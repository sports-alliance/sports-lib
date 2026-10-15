interface PoolReaders {
  number(value: unknown): number | null;
  index(value: unknown): number | null;
  date(value: unknown): Date | null;
  window(summary: any): { startDate: Date | null; endDate: Date | null };
  enum(value: unknown): string | null;
  type(value: unknown): string | null;
}

/** Read the original length list after ordinary session/lap ownership is assigned.
 * Keep corroboration outside decoded records and serialized activity data. */
export function getPoolLengthEvidence(
  file: any,
  read: PoolReaders
): {
  ends: Map<object, Date>;
  incompleteSessions: Set<object>;
} {
  const ends = new Map<object, Date>(),
    incompleteSessions = new Set<object>();
  const lengths: any[] = file.lengths ?? [];
  if (!lengths.length) return { ends, incompleteSessions };
  const indexed = new Map<number, any[]>();
  for (const length of lengths) {
    const index = read.index(length.message_index);
    if (index !== null && Number.isSafeInteger(index) && index >= 0) {
      const entries = indexed.get(index) ?? [];
      entries.push(length);
      indexed.set(index, entries);
    }
  }
  const ranges = (file.sessions as any[])
    .flatMap(session =>
      (session.laps as any[]).map(lap => ({
        session,
        lap,
        first: read.number(lap.first_length_index),
        count: read.number(lap.num_lengths)
      }))
    )
    .filter(
      (range): range is { session: any; lap: any; first: number; count: number } =>
        range.first !== null &&
        Number.isSafeInteger(range.first) &&
        range.first >= 0 &&
        range.count !== null &&
        Number.isSafeInteger(range.count) &&
        range.count > 0 &&
        Number.isSafeInteger(range.first + range.count)
    );
  const isPool = (session: any): boolean =>
    ['swimming', '5'].includes(read.enum(session.sport) ?? '') &&
    (read.enum(session.sub_sport) === 'lap_swimming' || (read.number(session.pool_length) ?? 0) > 0);
  const inside = (start: number, end: number, summary: any): boolean => {
    const window = read.window(summary);
    return !!window.startDate && !!window.endDate && start >= +window.startDate && end <= +window.endDate;
  };

  for (const [index, entries] of indexed) {
    const nextEntries = indexed.get(index + 1);
    if (entries.length !== 1 || nextEntries?.length !== 1) continue;
    const length = entries[0],
      next = nextEntries[0];
    const start = read.date(length.start_time),
      elapsed = read.number(length.total_elapsed_time);
    const timer = read.number(length.total_timer_time),
      stamp = read.date(length.timestamp);
    if (!start || elapsed === null || elapsed <= 0 || timer === null || timer < 0 || timer > elapsed || !stamp)
      continue;
    const end = +start + elapsed * 1000,
      nextStart = read.date(next.start_time),
      nextStamp = read.date(next.timestamp);
    // A shared later summary timestamp is not the endpoint when the independently
    // recorded next start corroborates elapsed time at FIT's whole-second precision.
    // A start inferred from that same summary timestamp is not independent evidence.
    if (
      +stamp <= end + 1000 ||
      !nextStart ||
      !nextStamp ||
      +nextStamp !== +stamp ||
      (Math.floor(end / 1000) * 1000 !== +nextStart && Math.ceil(end / 1000) * 1000 !== +nextStart)
    )
      continue;
    const owners = ranges.filter(range => index >= range.first && index + 1 < range.first + range.count);
    if (owners.length !== 1) continue;
    const { session, lap } = owners[0];
    if (
      !isPool(session) ||
      !inside(+start, end, session) ||
      !inside(+start, end, lap) ||
      !session.lengths.includes(length) ||
      !lap.lengths.includes(length) ||
      !lap.lengths.includes(next)
    )
      continue;
    ends.set(length, new Date(end));
  }

  for (const range of ranges) {
    const { session, lap, first, count } = range;
    const activeCount = read.number(lap.num_active_lengths);
    if (
      !isPool(session) ||
      activeCount === null ||
      !Number.isSafeInteger(activeCount) ||
      activeCount <= 0 ||
      ranges.some(other => other !== range && first < other.first + other.count && other.first < first + count)
    )
      continue;
    // Require complete, unique raw index coverage and matching active/rest counts.
    // This includes lengths whose source starts fall outside every session.
    const members = lengths.filter(length => {
      const index = read.index(length.message_index);
      return index !== null && index >= first && index < first + count;
    });
    if (
      members.length !== count ||
      new Set(members.map(length => read.index(length.message_index))).size !== count ||
      members.some(length => !['active', 'idle'].includes(read.type(length.length_type) ?? ''))
    )
      continue;
    const active = members.filter(length => read.type(length.length_type) === 'active');
    if (active.length === activeCount && active.some(length => !session.lengths.includes(length))) {
      incompleteSessions.add(session);
    }
  }
  return { ends, incompleteSessions };
}
