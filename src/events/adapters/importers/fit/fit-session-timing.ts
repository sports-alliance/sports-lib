interface TimingRecord {
  timestamp?: unknown;
  distance?: unknown;
}

interface TimerEvent extends TimingRecord {
  event?: unknown;
  event_type?: unknown;
  event_group?: unknown;
}

interface TimingSession extends TimingRecord {
  start_time?: unknown;
  total_timer_time?: unknown;
  total_elapsed_time?: unknown;
  total_distance?: unknown;
}

interface TimingFile {
  activity?: { num_sessions?: unknown };
  messages?: { activity?: unknown[] };
  sessions?: TimingSession[];
  records?: TimingRecord[];
  events?: TimerEvent[];
}

const wholeSecond = (value: unknown): number | null => {
  if (!(value instanceof Date)) return null;
  const time = value.getTime();
  return Number.isSafeInteger(time) && time % 1000 === 0 ? time / 1000 : null;
};

/** Prove a sole recorded session's chronology independently of its elapsed summary.
 * Some merged exports summarize only their recorded portions, omitting long pauses.
 * A complete timer timeline must agree with the supplied active timer, with each
 * interval supported by ordered records. Global events cannot prove multisport ownership.
 * Call before session synthesis or normalization can supply missing evidence.
 */
function getCorroboratedPausedSessionElapsedTime(file: TimingFile, maxDurationSeconds: number): number | null {
  if (
    !Array.isArray(file.sessions) ||
    file.sessions.length !== 1 ||
    !Number.isFinite(maxDurationSeconds) ||
    maxDurationSeconds <= 0
  )
    return null;
  const session = file.sessions[0];
  const start = wholeSecond(session?.start_time),
    end = wholeSecond(session?.timestamp);
  const timer = session?.total_timer_time,
    elapsed = session?.total_elapsed_time;
  if (
    start === null ||
    end === null ||
    end <= start ||
    end - start > maxDurationSeconds ||
    typeof timer !== 'number' ||
    !Number.isFinite(timer) ||
    timer <= 0 ||
    typeof elapsed !== 'number' ||
    !Number.isFinite(elapsed) ||
    elapsed < timer ||
    elapsed >= end - start
  )
    return null;

  if (!Array.isArray(file.records) || file.records.length < 4 || !Array.isArray(file.events)) return null;
  const events = file.events.filter(event => event?.event === 'timer');
  if (events.length < 4 || events.length % 2 !== 0) return null;
  const group = events[0].event_group;
  if (group !== undefined && (typeof group !== 'number' || !Number.isInteger(group) || group < 0 || group >= 255)) {
    return null;
  }
  const intervals: Array<{ start: number; end: number; firstRecord?: number; lastRecord?: number }> = [];
  let previous = -Infinity,
    active = 0;
  for (let index = 0; index < events.length; index++) {
    const event = events[index],
      time = wholeSecond(event.timestamp);
    const isStart = index % 2 === 0;
    if (
      time === null ||
      time < start ||
      time > end ||
      time <= previous ||
      event.event_group !== group ||
      (isStart
        ? event.event_type !== 'start'
        : !['stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(event.event_type as string))
    )
      return null;
    if (isStart) intervals.push({ start: time, end: time });
    else {
      intervals[intervals.length - 1].end = time;
      active += time - previous;
    }
    previous = time;
  }
  if (intervals[0].start !== start || intervals[intervals.length - 1].end !== end || active >= end - start) return null;

  // FIT timestamps are whole seconds. Each endpoint difference has <1 second
  // quantization error; the supplied duration has 0.001-second resolution. This
  // tolerance scales only with observed closed intervals, not workout duration.
  if (Math.abs(active * 1000 - Math.round(timer * 1000)) > intervals.length * 1000 + 1) return null;

  previous = -Infinity;
  let intervalIndex = 0;
  for (const record of file.records) {
    const time = wholeSecond(record?.timestamp);
    if (time === null || time < start || time > end || time < previous) return null;
    while (intervalIndex < intervals.length && time > intervals[intervalIndex].end) intervalIndex++;
    const interval = intervals[intervalIndex];
    if (interval && time >= interval.start) {
      interval.firstRecord ??= time;
      interval.lastRecord = time;
    }
    previous = time;
  }
  if (
    wholeSecond(file.records[0].timestamp) !== start ||
    // A whole-second final sample can precede the independently recorded stop by one tick.
    previous < end - 1 ||
    intervals.some(interval => interval.firstRecord === undefined || interval.lastRecord === interval.firstRecord)
  )
    return null;
  return end - start;
}

const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const validGroup = (group: unknown) =>
  group === undefined || (typeof group === 'number' && Number.isInteger(group) && group >= 0 && group < 255);
const isStop = (type: unknown) => ['stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(type as string);
const sameDistance = (left: number, right: number) =>
  Number.isSafeInteger(Math.round(left * 100)) &&
  Number.isSafeInteger(Math.round(right * 100)) &&
  Math.round(left * 100) === Math.round(right * 100);

/** Repair a premature end only when the explicit elapsed duration and complete
 * start/stop envelope agree, and an ordered complete distance counter reaches the
 * independently supplied session distance after the premature timestamp.
 * These envelope events do not establish active time; keep the supplied timer.
 */
function getElapsedEnvelope(file: TimingFile, max: number): number | null {
  const session = file.sessions![0],
    start = wholeSecond(session.start_time),
    end = wholeSecond(session.timestamp);
  const elapsed = session.total_elapsed_time,
    timer = session.total_timer_time,
    distance = session.total_distance;
  if (
    start === null ||
    end === null ||
    !positive(elapsed) ||
    !positive(timer) ||
    elapsed < timer ||
    elapsed > max ||
    !positive(distance) ||
    end <= start ||
    elapsed <= end - start + 1 ||
    Math.abs(end - start - timer) >= 1
  )
    return null;
  const events = file.events?.filter(event => event?.event === 'timer');
  if (
    !events ||
    events.length !== 2 ||
    events[0].event_type !== 'start' ||
    !isStop(events[1].event_type) ||
    wholeSecond(events[0].timestamp) !== start ||
    !validGroup(events[0].event_group) ||
    !validGroup(events[1].event_group) ||
    (events[0].event_group !== undefined &&
      events[1].event_group !== undefined &&
      events[0].event_group !== events[1].event_group)
  )
    return null;
  const stop = wholeSecond(events[1].timestamp);
  if (stop === null || Math.abs(stop - start - elapsed) >= 1) return null;
  if (!file.records || file.records.length < 2) return null;
  let previous = -Infinity,
    previousDistance = -Infinity;
  for (const record of file.records) {
    const time = wholeSecond(record?.timestamp),
      value = record?.distance;
    if (
      time === null ||
      time < start ||
      time > start + elapsed ||
      time < previous ||
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value < previousDistance
    )
      return null;
    previous = time;
    previousDistance = value;
  }
  return file.records[0].distance === 0 && previous > end && sameDistance(previousDistance, distance) ? elapsed : null;
}

/** A delayed save may be much later than the final recorded exercise stop.
 * Unlike the pause-only proof above, this recovery requires a complete monotonic
 * distance counter. Repeated stop_all while already stopped is idempotent; it
 * never adds active time or moves the final exercise stop. Stationary records
 * while stopped are allowed, but advancing distance there is contradictory.
 * Explicit zero distance needs a declared sole session and an entirely zero
 * counter; missing distance is not evidence of a stationary recording.
 */
function getRecordedTimerEnvelope(file: TimingFile, max: number): number | null {
  const session = file.sessions![0],
    start = wholeSecond(session.start_time),
    saved = wholeSecond(session.timestamp);
  const elapsed = session.total_elapsed_time,
    timer = session.total_timer_time,
    distance = session.total_distance;
  const zeroDistance = distance === 0;
  if (
    start === null ||
    saved === null ||
    saved <= start ||
    !positive(elapsed) ||
    !positive(timer) ||
    elapsed < timer ||
    (distance !== 0 && !positive(distance)) ||
    (zeroDistance && file.activity?.num_sessions !== 1) ||
    !file.records ||
    file.records.length < 4
  )
    return null;
  const events = file.events?.filter(event => event?.event === 'timer');
  if (!events || events.length < 4 || !validGroup(events[0].event_group)) return null;
  const intervals: Array<{ start: number; end: number; first?: number; last?: number }> = [];
  let opened: number | null = null,
    previous = -Infinity,
    active = 0;
  for (const event of events) {
    const time = wholeSecond(event.timestamp);
    if (
      time === null ||
      time < start - 1 ||
      time > saved ||
      time <= previous ||
      event.event_group !== events[0].event_group
    )
      return null;
    if (event.event_type === 'start') {
      if (opened !== null) return null;
      opened = time;
    } else if (isStop(event.event_type)) {
      if (opened === null) {
        if (event.event_type !== 'stop_all' || intervals.length === 0) return null;
      } else {
        intervals.push({ start: opened, end: time });
        active += time - opened;
        opened = null;
      }
    } else return null;
    previous = time;
  }
  if (opened !== null || intervals.length < 2 || Math.abs(intervals[0].start - start) > 1) return null;
  const end = intervals[intervals.length - 1].end,
    span = end - start;
  const timerErrorMilliseconds = Math.abs(active * 1000 - Math.round(timer * 1000));
  // Zero-distance recovery has no progressing counter to corroborate the timer.
  // Require strict agreement within whole-second endpoint quantization; retain
  // the established positive-distance tolerance for existing imports.
  const timerDisagrees = zeroDistance
    ? timerErrorMilliseconds >= intervals.length * 1000
    : timerErrorMilliseconds > intervals.length * 1000 + 1;
  if (span <= elapsed || span > max || active >= span || timerDisagrees) return null;
  previous = -Infinity;
  let previousDistance = -Infinity,
    first: number | null = null,
    index = 0;
  for (const record of file.records) {
    const time = wholeSecond(record?.timestamp),
      value = record?.distance;
    if (time === null || time < previous || time > end) return null;
    previous = time;
    // Pre-start observations do not move the explicitly supplied start.
    if (time < start) continue;
    first ??= time;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value < previousDistance) return null;
    while (index < intervals.length && time > intervals[index].end) index++;
    const interval = intervals[index];
    if (interval && time >= interval.start) {
      interval.first ??= time;
      interval.last = time;
    } else if (value !== previousDistance) return null;
    previousDistance = value;
  }
  if (
    first === null ||
    first > start + 1 ||
    previous !== end ||
    (zeroDistance ? previousDistance !== 0 : !sameDistance(previousDistance, distance)) ||
    intervals.some(interval => interval.first === undefined || interval.first === interval.last)
  )
    return null;
  return span;
}

/** Keep a terminal whole-second record when an independently recorded stop and
 * the millisecond elapsed summary identify the same final timestamp tick. This
 * is not permission to round an arbitrary summary or extend to the last record:
 * the complete timer timeline and every active interval must be source-backed.
 * Only elapsed chronology changes; the supplied active timer is retained.
 */
function getTerminalRecordPrecisionEnvelope(file: TimingFile, max: number): number | null {
  const session = file.sessions![0],
    start = wholeSecond(session.start_time),
    saved = wholeSecond(session.timestamp);
  const elapsed = session.total_elapsed_time,
    timer = session.total_timer_time;
  if (
    start === null ||
    saved === null ||
    !positive(elapsed) ||
    !positive(timer) ||
    elapsed < timer ||
    saved <= start ||
    saved - start > max ||
    !file.records ||
    file.records.length < 2
  )
    return null;
  const span = Math.ceil(elapsed),
    end = start + span;
  // A FIT timestamp has one-second resolution, unlike a duration's milliseconds.
  // Require the actual stop/record at that next tick, never a whole-second gap.
  if (span === elapsed || span > max || end > saved) return null;
  const events = file.events?.filter(event => event?.event === 'timer');
  if (!events || events.length < 2 || events.length % 2 !== 0 || !validGroup(events[0].event_group)) return null;
  const intervals: Array<{ start: number; end: number; first?: number; last?: number }> = [];
  let previous = -Infinity,
    active = 0;
  for (let index = 0; index < events.length; index++) {
    const event = events[index],
      time = wholeSecond(event.timestamp),
      starts = index % 2 === 0;
    if (
      time === null ||
      time < start ||
      time > end ||
      time <= previous ||
      event.event_group !== events[0].event_group ||
      (starts ? event.event_type !== 'start' : !isStop(event.event_type))
    )
      return null;
    if (starts) intervals.push({ start: time, end: time });
    else {
      intervals[intervals.length - 1].end = time;
      active += time - previous;
    }
    previous = time;
  }
  // The difference of two quantized timestamps has <1 second error per closed
  // interval. Compare encoded milliseconds to avoid floating-point boundary drift.
  if (
    intervals[0].start !== start ||
    previous !== end ||
    Math.abs(active * 1000 - Math.round(timer * 1000)) >= intervals.length * 1000
  )
    return null;
  previous = -Infinity;
  let index = 0;
  for (const record of file.records) {
    const time = wholeSecond(record?.timestamp);
    if (time === null || time < start || time > end || time < previous) return null;
    while (index < intervals.length && time > intervals[index].end) index++;
    const interval = intervals[index];
    if (interval && time >= interval.start) {
      interval.first ??= time;
      interval.last = time;
    }
    previous = time;
  }
  if (
    wholeSecond(file.records[0].timestamp) !== start ||
    previous !== end ||
    intervals.some(interval => interval.first === undefined || interval.first === interval.last)
  )
    return null;
  return span;
}

/** Return an independently corroborated elapsed duration for a sole explicit
 * session. No provider-specific defaults, source mutation or inferred active time.
 */
export function getCorroboratedSessionElapsedTime(file: TimingFile, maxDurationSeconds: number): number | null {
  if (
    !Array.isArray(file.sessions) ||
    file.sessions.length !== 1 ||
    !file.sessions[0] ||
    (file.messages?.activity?.length ?? 0) > 1 ||
    // A decoded session count is not whole-workout ownership when the source
    // explicitly declares missing sessions. Keep absent legacy counts compatible.
    (file.activity?.num_sessions != null && file.activity.num_sessions !== 1) ||
    !Array.isArray(file.records) ||
    !Array.isArray(file.events) ||
    !positive(maxDurationSeconds)
  )
    return null;
  return (
    getCorroboratedPausedSessionElapsedTime(file, maxDurationSeconds) ??
    getElapsedEnvelope(file, maxDurationSeconds) ??
    getRecordedTimerEnvelope(file, maxDurationSeconds) ??
    getTerminalRecordPrecisionEnvelope(file, maxDurationSeconds)
  );
}
