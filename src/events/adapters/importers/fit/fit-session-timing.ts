interface TimingRecord {
  timestamp?: unknown;
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
}

interface TimingFile {
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
export function getCorroboratedSessionElapsedTime(file: TimingFile, maxDurationSeconds: number): number | null {
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
    previous !== end ||
    intervals.some(interval => interval.firstRecord === undefined || interval.lastRecord === interval.firstRecord)
  )
    return null;
  return end - start;
}
