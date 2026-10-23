/** Test-only comparison of a dense elapsed-second stream with a timestamped reference.
 * Missing observations never become zero or shift later observations to another timestamp.
 */
export function compareStreamAtTimes(
  actual: readonly (number | null)[],
  expected: readonly number[],
  times: readonly number[],
  valueTolerance = 0
) {
  if (!times.length || times.length !== expected.length) {
    throw new Error('Reference values and timestamps must have the same nonzero length');
  }
  if (!Number.isFinite(valueTolerance) || valueTolerance < 0) throw new Error('Invalid value tolerance');
  const pairs: { time: number; actual: number; expected: number; error: number }[] = [];
  const missingTimes: number[] = [];
  times.forEach((time, index) => {
    if (!Number.isSafeInteger(time) || time < 0 || (index > 0 && time <= times[index - 1])) {
      throw new Error('Reference timestamps must be strictly increasing nonnegative integer seconds');
    }
    if (!Number.isFinite(expected[index])) throw new Error('Reference values must be finite');
    const value = actual[time];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      missingTimes.push(time);
      return;
    }
    pairs.push({ time, actual: value, expected: expected[index], error: Math.abs(value - expected[index]) });
  });
  const errors = pairs.map(pair => pair.error).sort((a, b) => a - b);
  return {
    pairs,
    missingTimes,
    referenceCount: times.length,
    matchedCount: pairs.length,
    coverage: pairs.length / times.length,
    withinToleranceCount: errors.filter(error => error <= valueTolerance).length,
    meanAbsoluteError: errors.length ? errors.reduce((sum, error) => sum + error, 0) / errors.length : null,
    // Nearest-rank percentile; no rounding of the observations before comparison.
    p95AbsoluteError: errors.length ? errors[Math.ceil(errors.length * 0.95) - 1] : null
  };
}
