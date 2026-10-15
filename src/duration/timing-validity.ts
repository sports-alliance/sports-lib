/** Source timing rejected using independent workout chronology, not a duration cap.
 * Rejected source values are retained here; they are not usable elapsed/active time.
 * Absence preserves legacy timing semantics. This is not a numeric metric.
 */
export interface TimingValidity {
  version: 1;
  reason: 'exceeds-workout-envelope';
  elapsedTime?: number;
  timerTime?: number;
}

/** Read the bounded additive native-JSON contract without forwarding arbitrary metadata. */
export function normalizeTimingValidity(value: unknown): TimingValidity | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  if (input.version !== 1 || input.reason !== 'exceeds-workout-envelope') return undefined;
  const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
  if (!positive(input.elapsedTime) && !positive(input.timerTime)) return undefined;
  return {
    version: 1,
    reason: 'exceeds-workout-envelope',
    ...(positive(input.elapsedTime) ? { elapsedTime: input.elapsedTime } : {}),
    ...(positive(input.timerTime) ? { timerTime: input.timerTime } : {})
  };
}

/**
 * Resolve usable swim-length timing in seconds, retaining valid zero.
 * A rejected timer returns null even if elapsed time is valid: elapsed can include rests.
 * Otherwise use the timer when present, or an unrejected elapsed value when the timer is absent,
 * preserving the existing fallback for legacy lengths without a timing-validity marker.
 * Callers must keep null unavailable rather than apply another elapsed/date/zero fallback.
 */
export function resolveSwimTimingSeconds(length: {
  timingValidity?: TimingValidity;
  timerTime: { getValue(): unknown } | null;
  elapsedTime: { getValue(): unknown } | null;
}): number | null {
  const validity = normalizeTimingValidity(length.timingValidity);
  if (validity?.timerTime !== undefined) return null;
  const timer = length.timerTime?.getValue();
  const elapsed = validity?.elapsedTime !== undefined ? null : length.elapsedTime?.getValue();
  const value = timer ?? elapsed;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
