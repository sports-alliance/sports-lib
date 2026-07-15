export interface PowerCurveSampleLike {
  duration: unknown;
  power: unknown;
  wattsPerKg?: unknown;
}

export interface SamplePowerCurveOptions {
  key?: 'power' | 'wattsPerKg';
  maximumBracketDurationRatio?: number;
}

export interface PowerCurveWindowComparison {
  durationSeconds: number;
  recentValue: number | null;
  referenceValue: number | null;
  retentionPercent: number | null;
  deltaPercent: number | null;
}

export const DEFAULT_POWER_CURVE_MAXIMUM_BRACKET_DURATION_RATIO = 1.25;
export const MAXIMUM_ALLOWED_POWER_CURVE_BRACKET_DURATION_RATIO = 2;

/**
 * Samples a mean-max curve in reciprocal-duration (1/t) space.
 *
 * Exact durations win, duplicate durations retain their strongest positive value, and interpolation
 * requires two neighboring points whose duration ratio is at most 1.25 by default (2 is the hard max).
 * Durations outside the curve are never extrapolated.
 */
export function samplePowerCurveAtDuration(
  points: readonly PowerCurveSampleLike[],
  durationSeconds: number,
  options: SamplePowerCurveOptions = {}
): number | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null;
  }
  const key = options.key || 'power';
  const normalized = normalizeCurve(points, key);
  return sampleNormalizedCurveAtDuration(normalized, durationSeconds, resolveMaximumBracketDurationRatio(options));
}

/**
 * Compares aligned curve samples. Retention is recent/reference × 100; delta is retention minus 100.
 * Each source curve is normalized and sorted once for the complete duration set.
 */
export function comparePowerCurveWindows(
  recentPoints: readonly PowerCurveSampleLike[],
  referencePoints: readonly PowerCurveSampleLike[],
  durationSeconds: readonly number[],
  options: SamplePowerCurveOptions = {}
): PowerCurveWindowComparison[] {
  const key = options.key || 'power';
  const recent = normalizeCurve(recentPoints, key);
  const reference = normalizeCurve(referencePoints, key);
  const maximumBracketDurationRatio = resolveMaximumBracketDurationRatio(options);
  return durationSeconds.map(duration => {
    const recentValue = sampleNormalizedCurveAtDuration(recent, duration, maximumBracketDurationRatio);
    const referenceValue = sampleNormalizedCurveAtDuration(reference, duration, maximumBracketDurationRatio);
    const retentionPercent =
      recentValue !== null && referenceValue !== null && referenceValue > 0
        ? (recentValue / referenceValue) * 100
        : null;
    return {
      durationSeconds: duration,
      recentValue,
      referenceValue,
      retentionPercent,
      deltaPercent: retentionPercent === null ? null : retentionPercent - 100
    };
  });
}

function sampleNormalizedCurveAtDuration(
  points: readonly { duration: number; value: number }[],
  durationSeconds: number,
  maximumBracketDurationRatio: number
): number | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null;
  }
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (points[middle].duration < durationSeconds) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  if (low < points.length && points[low].duration === durationSeconds) {
    return points[low].value;
  }
  if (low <= 0 || low >= points.length) {
    return null;
  }
  const left = points[low - 1];
  const right = points[low];
  if (right.duration / left.duration > maximumBracketDurationRatio) {
    return null;
  }
  const leftX = 1 / left.duration;
  const rightX = 1 / right.duration;
  const targetX = 1 / durationSeconds;
  const ratio = (targetX - leftX) / (rightX - leftX);
  return left.value + (right.value - left.value) * ratio;
}

function resolveMaximumBracketDurationRatio(options: SamplePowerCurveOptions): number {
  const requestedMaximumRatio = options.maximumBracketDurationRatio;
  return typeof requestedMaximumRatio === 'number' &&
    Number.isFinite(requestedMaximumRatio) &&
    requestedMaximumRatio >= 1 &&
    requestedMaximumRatio <= MAXIMUM_ALLOWED_POWER_CURVE_BRACKET_DURATION_RATIO
    ? requestedMaximumRatio
    : DEFAULT_POWER_CURVE_MAXIMUM_BRACKET_DURATION_RATIO;
}

function normalizeCurve(
  points: readonly PowerCurveSampleLike[],
  key: 'power' | 'wattsPerKg'
): Array<{ duration: number; value: number }> {
  const byDuration = new Map<number, number>();
  (points || []).forEach(point => {
    const duration = toFiniteValue(point?.duration);
    const value = toFiniteValue(point?.[key]);
    if (duration === null || duration <= 0 || value === null || value <= 0) {
      return;
    }
    byDuration.set(duration, Math.max(value, byDuration.get(duration) || 0));
  });
  return [...byDuration.entries()]
    .map(([duration, value]) => ({ duration, value }))
    .sort((left, right) => left.duration - right.duration);
}

function toFiniteValue(value: unknown, seen = new Set<object>()): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    if (!value.trim()) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return null;
  }
  const getter = (value as { getValue?: unknown }).getValue;
  if (typeof getter !== 'function') {
    return null;
  }
  seen.add(value);
  try {
    return toFiniteValue(getter.call(value), seen);
  } catch (_error) {
    return null;
  }
}
