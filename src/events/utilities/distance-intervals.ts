import type { ActivityInterface } from '../../activities/activity.interface';
import type { StreamInterface } from '../../streams/stream.interface';
import { Stream } from '../../streams/stream';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';
import { DataSpeed } from '../../data/data.speed';
import { DataGrade } from '../../data/data.grade';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { GradeCalculator, CLAMP, LOOK_AHEAD_IN_METERS } from './grade-calculator/grade-calculator';
// @ts-expect-error kalmanjs has no declarations (same runtime used by stream smoothing).
import KalmanFilter from 'kalmanjs';

type Values = (number | null)[];
interface Segment {
  start: number;
  end: number;
}
interface Support {
  data: Values;
  from: number[];
  to: number[];
}
// Cache decoded bounds. Serialized durations preserve these weights through native JSON.
const support = new WeakMap<StreamInterface, Support>();
const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function createSupportedStream(
  type: string,
  data: Values,
  from: number[],
  to: number[],
  direction: 'starting' | 'ending' = 'ending'
): Stream {
  const stream = new Stream(type, data, {
    direction,
    durations: data.map((value, i) => (finite(value) && finite(from[i]) && finite(to[i]) ? to[i] - from[i] : null))
  });
  support.set(stream, { data, from, to });
  return stream;
}

function getSupport(stream: StreamInterface): Support | undefined {
  const evidence = support.get(stream);
  const data = stream.getData();
  if (evidence?.data === data && stream.getIntervalSupport?.()) return evidence;
  const intervals = stream.getIntervalSupport?.();
  if (!intervals) return undefined;
  const from = intervals.durations.map((seconds, i) =>
    seconds === null ? NaN : intervals.direction === 'starting' ? i : i - seconds
  );
  const to = intervals.durations.map((seconds, i) =>
    seconds === null ? NaN : intervals.direction === 'ending' ? i : i + seconds
  );
  const restored = { data, from, to };
  support.set(stream, restored);
  return restored;
}

/** Active elapsed-clock segments. A stop may close an interval, but never bridge a pause. */
export function activeDistanceSegments(activity: ActivityInterface): Segment[] {
  const end = Math.max(0, (+activity.endDate - +activity.startDate) / 1000);
  const events = activity
    .getAllEvents()
    .filter(
      event =>
        Number.isFinite(event.timestamp) &&
        [DataStartEvent.type, DataStopEvent.type, DataStopAllEvent.type].includes(event.getType())
    )
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);
  const segments: Segment[] = [];
  let running = true,
    start = 0;
  for (const event of events) {
    const time = Math.max(0, Math.min(end, event.timestamp));
    if (event.getType() === DataStartEvent.type) {
      if (!running) start = time;
      running = true;
    } else {
      if (running && time > start) segments.push({ start, end: time });
      running = false;
    }
  }
  if (running && end > start) segments.push({ start, end });
  return segments;
}

/** Endpoint-supported interval speeds. Missing readings never become stationary seconds. */
export function speedFromDistance(activity: ActivityInterface, distance: Values): Stream {
  const values: Values = Array(distance.length).fill(null);
  const from = Array(distance.length).fill(NaN),
    to = Array(distance.length).fill(NaN);
  for (const segment of activeDistanceSegments(activity)) {
    let previous: number | undefined;
    for (let i = Math.ceil(segment.start); i <= Math.min(segment.end, distance.length - 1); i++) {
      const value = distance[i];
      if (value === null || value === undefined) continue;
      if (!finite(value) || value < 0) {
        previous = undefined;
        continue;
      }
      if (previous !== undefined && value >= (distance[previous] as number)) {
        values[i] = Math.round(((value - (distance[previous] as number)) / (i - previous)) * 1000) / 1000;
        from[i] = previous;
        to[i] = i;
      }
      previous = i;
    }
  }
  return createSupportedStream(DataSpeed.type, values, from, to);
}

/** Activity-only grade: paired observations, bounded look-ahead, and no carry-forward.
 * Route grade deliberately retains its separate, untimed geometry contract.
 */
export function gradeFromDistance(
  activity: ActivityInterface,
  distance: Values,
  altitude: Values,
  smooth: boolean
): Stream[] {
  const size = Math.max(distance.length, altitude.length);
  const grade: Values = Array(size).fill(null),
    smoothed: Values = Array(size).fill(null);
  const from = Array(size).fill(NaN),
    to = Array(size).fill(NaN);
  const flush = (points: number[]) => {
    const filter = new KalmanFilter({ R: 0.01, Q: 0.5 });
    let ahead = 0;
    for (let p = 0; p < points.length - 1; p++) {
      const index = points[p];
      ahead = Math.max(ahead, p + 1);
      while (
        ahead < points.length - 1 &&
        (distance[points[ahead]] as number) < (distance[index] as number) + LOOK_AHEAD_IN_METERS
      )
        ahead++;
      const delta = (distance[points[ahead]] as number) - (distance[index] as number);
      // Quantized recorded distance may repeat while recorded speed is positive.
      // The existing look-ahead, rather than the immediate next reading, establishes slope.
      if (!(delta > 0)) continue;
      const value =
        Math.round(
          Math.max(
            -CLAMP,
            Math.min(CLAMP, (100 * ((altitude[points[ahead]] as number) - (altitude[index] as number))) / delta)
          ) * 10
        ) / 10;
      grade[index] = value;
      smoothed[index] = filter.filter(value);
      from[index] = index;
      to[index] = points[p + 1];
    }
  };
  for (const segment of activeDistanceSegments(activity)) {
    let points: number[] = [],
      previousDistance: number | undefined;
    for (let i = Math.ceil(segment.start); i <= Math.min(segment.end, distance.length - 1); i++) {
      const value = distance[i];
      if (value === null || value === undefined) continue;
      if (!finite(value) || value < 0 || (previousDistance !== undefined && value < previousDistance)) {
        flush(points);
        points = [];
        previousDistance = undefined;
      }
      if (!finite(value) || value < 0) continue;
      previousDistance = value;
      if (finite(altitude[i])) points.push(i);
    }
    flush(points);
  }
  const streams = [createSupportedStream(DataGrade.type, grade, from, to, 'starting')];
  if (smooth) streams.push(createSupportedStream(DataGradeSmooth.type, smoothed, from, to, 'starting'));
  return streams;
}

/** Look up calculated terrain only inside its supported interval.
 * A calculated speed interval must be wholly contained; a recorded speed is a point observation.
 * This is a calculation view: neither input stream is filled or modified.
 */
export function gradeSamplesForSpeed(speed: StreamInterface, grade: StreamInterface): Values {
  const grades = grade.getData();
  const speedSupport = getSupport(speed),
    gradeSupport = getSupport(grade);
  if (!gradeSupport) return grades;
  const speeds = speed.getData();
  const aligned: Values = Array(speeds.length).fill(null);
  grades.forEach((value, index) => {
    const left = gradeSupport.from[index],
      right = gradeSupport.to[index];
    if (!finite(value) || !Number.isFinite(left) || !Number.isFinite(right) || right <= left) return;
    // Nonoverlapping intervals bound the total loop work to the stream length plus endpoints.
    for (let second = Math.max(0, Math.ceil(left)); second <= Math.min(right, speeds.length - 1); second++) {
      const speedLeft = speedSupport ? speedSupport.from[second] : second;
      const speedRight = speedSupport ? speedSupport.to[second] : second;
      if (finite(speeds[second]) && speedLeft >= left && speedRight <= right) aligned[second] = value;
    }
  });
  return aligned;
}

/** Missing grade is unknown; a measured zero speed still gives zero adjusted speed. */
export function adjustedSpeedFromGrade(speed: StreamInterface, grade: StreamInterface): Stream {
  const speeds = speed.getData(),
    grades = gradeSamplesForSpeed(speed, grade);
  const speedSupport = getSupport(speed);
  const values: Values = Array(speeds.length).fill(null);
  const from = Array(speeds.length).fill(NaN),
    to = Array(speeds.length).fill(NaN);
  speeds.forEach((value, index) => {
    if (!finite(value) || value < 0) return;
    const gradeValue = grades[index];
    if (value !== 0 && !finite(gradeValue)) return;
    values[index] =
      value === 0 ? 0 : Math.round(GradeCalculator.estimateAdjustedSpeed(value, gradeValue as number) * 100) / 100;
    if (speedSupport) {
      from[index] = speedSupport.from[index];
      to[index] = speedSupport.to[index];
    }
  });
  return speedSupport
    ? createSupportedStream(DataGradeAdjustedSpeed.type, values, from, to)
    : new Stream(DataGradeAdjustedSpeed.type, values);
}

function visitIntervals(
  stream: StreamInterface,
  start: number,
  end: number,
  visit: (value: number, seconds: number) => void
): boolean {
  const evidence = getSupport(stream);
  if (!evidence) return false;
  for (
    let index = Math.max(0, Math.ceil(start));
    index <= Math.min(evidence.data.length - 1, Math.floor(end));
    index++
  ) {
    const value = evidence.data[index];
    // Only whole supported intervals belong to a lap; don't invent boundary positions.
    const left = evidence.from[index],
      right = evidence.to[index];
    if (
      !finite(value) ||
      !Number.isFinite(left) ||
      !Number.isFinite(right) ||
      left < start ||
      right > end ||
      right <= left
    )
      continue;
    visit(value, right - left);
  }
  return true;
}

/** Values for lap extrema use the same whole intervals as their weighted average. */
export function intervalValues(stream: StreamInterface, start: number, end: number): number[] | undefined {
  const values: number[] = [];
  return visitIntervals(stream, start, end, value => values.push(value)) ? values : undefined;
}

/** undefined preserves recorded-stream summary policy; null means no supported interval. */
export function intervalAverage(stream: StreamInterface, start = 0, end = Infinity): number | null | undefined {
  let weighted = 0,
    seconds = 0;
  if (
    !visitIntervals(stream, start, end, (value, duration) => {
      weighted += value * duration;
      seconds += duration;
    })
  )
    return undefined;
  return seconds > 0 ? weighted / seconds : null;
}

/** Supported interval estimate, never extrapolated before the first reading or across timer pauses. */
export function movingSeconds(activity: ActivityInterface, stream: StreamInterface, threshold: number): number | null {
  const evidence = getSupport(stream);
  let observed = 0,
    moving = 0;
  if (evidence) {
    evidence.data.forEach((value, index) => {
      const seconds = evidence.to[index] - evidence.from[index];
      if (!finite(value) || value < 0 || !(seconds > 0)) return;
      observed += seconds;
      if (value > threshold) moving += seconds;
    });
  } else {
    const values = stream.getData();
    for (const segment of activeDistanceSegments(activity)) {
      let previous: number | undefined;
      for (let i = Math.ceil(segment.start); i <= Math.min(segment.end, values.length - 1); i++) {
        const value = values[i];
        if (value === null || value === undefined) continue;
        if (!finite(value) || value < 0) {
          previous = undefined;
          continue;
        }
        if (previous !== undefined) {
          observed += i - previous;
          if (value > threshold) moving += i - previous;
        }
        previous = i;
      }
    }
  }
  return observed > 0 ? moving : null;
}
