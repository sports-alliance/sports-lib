const seconds = (value: unknown): number | null => {
  if (!(value instanceof Date)) return null;
  const time = value.getTime();
  return Number.isSafeInteger(time) && time % 1000 === 0 ? time / 1000 : null;
};
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const indexValue = (value: any): unknown => value !== null && typeof value === 'object' ? value.value : value;
const isStop = (type: unknown): boolean => ['stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(type as string);

/** Recover only one explicitly declared, missing final session. Source session
 * order, closing records, timer events and a monotonic distance counter must
 * independently bound the tail. Never guess its sport or reassign source laps.
 * Call before normalization can synthesize sessions or supply missing evidence.
 * This internal helper does not mutate the decoded file.
 */
export function getMissingFinalSession(file: any, maxDurationSeconds: number): any | null {
  const sessions: any[] = file.sessions ?? [], records: any[] = file.records ?? [];
  if (!sessions.length || file.activity?.num_sessions !== sessions.length + 1 ||
      file.messages?.activity?.length > 1 || !finite(maxDurationSeconds) || maxDurationSeconds <= 0) return null;
  const windows = sessions.map(session => ({ start: seconds(session?.start_time), end: seconds(session?.timestamp), session }));
  if (windows.some((window, index) => window.start === null || window.end === null || window.end <= window.start ||
      (index > 0 && window.start !== windows[index - 1].end))) return null;
  if (sessions.some(session => session.message_index != null) &&
      sessions.some((session, index) => indexValue(session.message_index) !== index)) return null;
  const first = windows[0].start!, start = windows[windows.length - 1].end!, end = seconds(file.activity.timestamp);
  if (end === null || end <= start || end - start > maxDurationSeconds) return null;

  // Pool lengths and laps can already be cascaded into an earlier session.
  // Unknown/malformed bounds cannot establish that they belong before the tail.
  const laps: any[] = [...(file.laps ?? []), ...sessions.flatMap(session => session.laps ?? [])];
  const lengths: any[] = [...(file.lengths ?? []), ...laps.flatMap(lap => lap.lengths ?? [])];
  if ([...laps, ...lengths].some(row => seconds(row?.timestamp) === null || seconds(row.timestamp)! > start) ||
      file.sports?.length) return null;
  let previous = -Infinity, firstDistance: number | null = null, lastDistance: number | null = null;
  let distanceEnd: number | null = null, tailRecords = 0;
  for (const record of records) {
    const time = seconds(record?.timestamp);
    if (time === null || time < first || time > end || time < previous) return null;
    previous = time;
    if (time > start) {
      tailRecords++;
      if (record.sport != null || record.sub_sport != null) return null;
    }
    if (time < start || record.distance == null) continue;
    if (!finite(record.distance) || record.distance < 0 ||
        (lastDistance !== null && record.distance < lastDistance) ||
        (distanceEnd === time && record.distance !== lastDistance)) return null;
    if (firstDistance === null) {
      if (time !== start) return null;
      firstDistance = record.distance;
    }
    lastDistance = record.distance;
    distanceEnd = time;
  }
  if (!tailRecords || previous !== end || firstDistance === null || lastDistance === null || distanceEnd !== end) return null;

  const timers: any[] = (file.events ?? []).filter((event: any) => event.event === 'timer');
  if (!timers.length || seconds(timers[0].timestamp) !== first || timers[0].event_type !== 'start' ||
      seconds(timers[timers.length - 1].timestamp) !== end || !isStop(timers[timers.length - 1].event_type)) return null;
  const group = timers[0].event_group;
  if (group !== undefined && (!Number.isInteger(group) || group < 0 || group >= 255)) return null;
  const intervals: Array<[number, number]> = [];
  previous = first;
  let running = false;
  for (let index = 0; index < timers.length; index++) {
    const event = timers[index], time = seconds(event.timestamp), starts = event.event_type === 'start';
    if (time === null || time < previous || time > end || event.event_group !== group ||
        (!starts && !isStop(event.event_type)) ||
        (index > 0 && time === previous && starts !== running)) return null;
    if (running && time > previous) intervals.push([previous, time]);
    running = starts;
    previous = time;
  }
  const active = (from: number, to: number): number => intervals.reduce((sum, [left, right]) =>
    sum + Math.max(0, Math.min(right, to) - Math.max(left, from)), 0);
  // Existing importer tolerance: FIT timestamps have one-second precision.
  if (windows.some(window => !finite(window.session.total_timer_time) || window.session.total_timer_time <= 0 ||
      Math.abs(active(window.start!, window.end!) - window.session.total_timer_time) > 1)) return null;
  const timer = active(start, end);
  if (timer <= 0) return null;
  return {
    start_time: new Date(start * 1000), timestamp: new Date(end * 1000), sport: 'unknown',
    total_elapsed_time: end - start, total_timer_time: timer, total_distance: lastDistance - firstDistance, laps: []
  };
}
