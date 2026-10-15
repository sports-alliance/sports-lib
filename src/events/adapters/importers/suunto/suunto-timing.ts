/** Private source evidence for Suunto JSON/SML timing; never serialized. */
export interface SuuntoTimingSource {
  firstActivity: number;
  lastSample: number;
  pauses: { time: number; paused: boolean }[];
  conflictingPauses: boolean;
}
export interface SuuntoTiming {
  elapsed: number;
  active: number | null;
  pause: number | null;
}
const nonnegative = (value: unknown): number | undefined => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const timestamp = (value: unknown): number =>
  typeof value === 'string' && value.trim() ? new Date(value).getTime() : NaN;

export function readSuuntoTimingSource(samples: any[]): SuuntoTimingSource {
  let firstActivity = Infinity;
  let lastSample = -Infinity;
  const pauses: SuuntoTimingSource['pauses'] = [];
  let conflictingPauses = false;
  for (const sample of samples) {
    const time = timestamp(sample.TimeISO8601);
    if (Number.isFinite(time)) lastSample = Math.max(lastSample, time);
    for (const event of Array.isArray(sample.Events) ? sample.Events : []) {
      if (event?.Activity && Number.isFinite(time)) firstActivity = Math.min(firstActivity, time);
      if (!event?.Pause) continue;
      if (!Number.isFinite(time) || typeof event.Pause.State !== 'boolean') {
        conflictingPauses = true;
        continue;
      }
      pauses.push({ time, paused: event.Pause.State });
    }
  }
  pauses.sort((a, b) => a.time - b.time);
  if (pauses.some((p, i) => i > 0 && p.time === pauses[i - 1].time && p.paused !== pauses[i - 1].paused)) {
    conflictingPauses = true;
  }
  return { firstActivity, lastSample, pauses, conflictingPauses };
}

/** An explicit Activity start supplies the initial running state. Pause.State is
 * a state observation (repeated equal states are idempotent), not a toggle.
 * The complete recording's timer timeline can establish an earlier leg's state
 * even when its first pause occurs in a later leg. Integration stays leg-local. */
function recordedActiveTime(start: number, end: number, source: SuuntoTimingSource): number | undefined {
  if (
    source.conflictingPauses ||
    source.firstActivity > start ||
    end > source.lastSample ||
    !source.pauses.some(p => p.time >= source.firstActivity && p.time <= source.lastSample)
  )
    return undefined;
  let paused = false;
  let cursor = start;
  let active = 0;
  for (const p of source.pauses) {
    if (p.time < source.firstActivity) continue;
    if (p.time > end) break;
    if (p.time < start) {
      paused = p.paused;
      continue;
    }
    if (!paused) active += p.time - cursor;
    cursor = p.time;
    paused = p.paused;
  }
  if (!paused) active += end - cursor;
  return active / 1000;
}

/** Resolve one owned window. Activity/lap windows without PauseDuration report
 * active time; header/SML windows with PauseDuration report elapsed time.
 * A contradictory summary never becomes an assumed full-duration workout. */
export function resolveSuuntoTiming(
  start: number,
  end: number,
  window: any,
  source: SuuntoTimingSource,
  header?: any,
  ambiguousWindow = false
): SuuntoTiming {
  const span = (end - start) / 1000;
  const unavailable = { elapsed: span, active: null, pause: null };
  if (!Number.isFinite(span) || span < 0) return unavailable;
  const total = nonnegative(window?.Duration);
  const hasPause = window?.PauseDuration !== undefined;
  const pause = hasPause ? nonnegative(window.PauseDuration) : 0;
  const active = total !== undefined && pause !== undefined && pause <= total ? total - pause : undefined;
  if (!ambiguousWindow && active !== undefined && active <= span) {
    // An explicit elapsed/pause pair retains its own precision and semantics.
    // It must fit this leg; a parent-sized window cannot donate elapsed time.
    if (!hasPause || total! <= span || Math.fround(total!) === Math.fround(span)) {
      const elapsed = hasPause ? total! : span;
      return { elapsed, active, pause: elapsed - active };
    }
  }
  if (!ambiguousWindow && active !== undefined && header && timestamp(header.DateTime) === start) {
    const elapsed = nonnegative(header.Duration);
    const headerPause = header.PauseDuration === undefined ? 0 : nonnegative(header.PauseDuration);
    // A single-leg header may corroborate float32 window duration. Require its
    // complete elapsed interval inside the recorded sample envelope; do not
    // extend timestamps, borrow a multisport total, or accept an impossible clock.
    if (
      elapsed !== undefined &&
      headerPause !== undefined &&
      headerPause <= elapsed &&
      start + elapsed * 1000 <= source.lastSample &&
      Math.fround(elapsed - headerPause) === Math.fround(active)
    ) {
      return { elapsed, active: elapsed - headerPause, pause: headerPause };
    }
  }
  if (!ambiguousWindow && !hasPause && active !== undefined && Math.fround(active) === Math.fround(span)) {
    // Equality at the source float32 precision is numeric quantization, not a
    // physiological/time cutoff. Retain active precision instead of a negative pause.
    return { elapsed: active, active, pause: 0 };
  }
  const recorded = recordedActiveTime(start, end, source);
  if (recorded !== undefined) return { elapsed: span, active: recorded, pause: span - recorded };
  if (!ambiguousWindow && window?.Duration === undefined && !hasPause) {
    // Preserve the existing samples-only compatibility fallback. A present but
    // invalid/conflicting summary must not enter this missing-input branch.
    return { elapsed: span, active: span, pause: 0 };
  }
  return unavailable;
}
