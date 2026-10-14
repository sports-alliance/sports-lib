import { TimingValidity } from '../../../../duration/timing-validity';

/** Attached to decoded source objects before any date repair or timer swapping. */
export const rejectedPoolTiming = Symbol('rejectedPoolTiming');

type Summary = {
  start_time?: unknown;
  timestamp?: unknown;
  total_elapsed_time?: unknown;
  total_timer_time?: unknown;
  [rejectedPoolTiming]?: TimingValidity;
};
type PoolFile = {
  sessions?: (Summary & { sport?: unknown; sub_sport?: unknown; pool_length?: unknown })[];
  laps?: Summary[];
  lengths?: Summary[];
  activity?: Summary | Summary[];
  events?: { timestamp?: unknown; event?: unknown; event_type?: unknown }[];
  records?: { timestamp?: unknown }[];
};
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const date = (value: unknown): number | null =>
  value instanceof Date && Number.isFinite(+value) ? +value / 1000 : null;

/** Withhold only pool durations contradicted by a complete single-workout envelope.
 * Every independent summary timestamp widens the bound. Multisport, incomplete
 * timer envelopes and late records are deliberately deferred. Source bytes stay intact.
 */
export function rejectImpossiblePoolTiming(file: PoolFile): void {
  if (file.sessions?.length !== 1) return;
  const session = file.sessions[0];
  if (
    !['swimming', 5].includes(session.sport as string | number) ||
    !(session.sub_sport === 'lap_swimming' || (finite(session.pool_length) && session.pool_length > 0))
  )
    return;
  const sessionStart = date(session.start_time);
  if (sessionStart === null || !finite(session.total_elapsed_time) || session.total_elapsed_time <= 0) return;
  const timers = (file.events ?? []).filter(event => event.event === 'timer');
  const last = timers[timers.length - 1];
  if (
    !last ||
    timers[0].event_type !== 'start' ||
    !['stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(last.event_type as string)
  )
    return;
  let previous = -Infinity;
  for (const event of timers) {
    const time = date(event.timestamp);
    if (time === null || time < previous) return;
    previous = time;
  }
  const firstTime = date(timers[0].timestamp)!;
  const stopTime = date(last.timestamp)!;
  if (Math.abs(firstTime - sessionStart) > 1 || stopTime <= sessionStart || !file.records?.length) return;
  let recordMin = Infinity,
    recordMax = -Infinity;
  for (const record of file.records) {
    const time = date(record.timestamp);
    if (time === null) continue;
    recordMin = Math.min(recordMin, time);
    recordMax = Math.max(recordMax, time);
  }
  if (!Number.isFinite(recordMin) || recordMin < sessionStart - 1 || recordMax > stopTime + 1) return;
  const laps = file.laps ?? [],
    lengths = file.lengths ?? [];
  let start = sessionStart;
  for (const summary of [...laps, ...lengths]) {
    const time = date(summary.start_time);
    if (time !== null) start = Math.min(start, time);
  }
  let end = Math.max(
    recordMax,
    sessionStart + session.total_elapsed_time,
    sessionStart + (finite(session.total_timer_time) ? session.total_timer_time : 0)
  );
  const activities = Array.isArray(file.activity) ? file.activity : file.activity ? [file.activity] : [];
  for (const summary of [...file.sessions, ...activities, ...laps, ...lengths, ...(file.events ?? [])]) {
    const time = date(summary.timestamp);
    if (time !== null) end = Math.max(end, time);
  }
  const upper = end - start;
  if (!Number.isFinite(upper) || upper <= 0) return;
  const reject = (summary: Summary, bound: number): void => {
    const elapsed = summary.total_elapsed_time,
      timer = summary.total_timer_time;
    const elapsedInvalid = finite(elapsed) && elapsed > bound + 1;
    const timerInvalid = finite(timer) && timer > bound + 1;
    if (!elapsedInvalid && !timerInvalid) return;
    summary[rejectedPoolTiming] = {
      version: 1,
      reason: 'exceeds-workout-envelope',
      ...(elapsedInvalid ? { elapsedTime: elapsed } : {}),
      ...(timerInvalid ? { timerTime: timer } : {})
    };
    // Keep source values and ownership evidence intact. Projections withhold them.
  };
  lengths.forEach(length => reject(length, upper));
  let elapsedSum = 0,
    timerSum = 0;
  for (const length of lengths) {
    if (
      finite(length.total_elapsed_time) &&
      length.total_elapsed_time >= 0 &&
      length[rejectedPoolTiming]?.elapsedTime === undefined
    )
      elapsedSum += length.total_elapsed_time;
    if (
      finite(length.total_timer_time) &&
      length.total_timer_time >= 0 &&
      length[rejectedPoolTiming]?.timerTime === undefined
    )
      timerSum += length.total_timer_time;
  }
  // Independent child totals can support vendor accumulation/rounding discrepancies.
  const lapUpper = Math.max(upper, elapsedSum, timerSum);
  laps.forEach(lap => reject(lap, lapUpper));
}
