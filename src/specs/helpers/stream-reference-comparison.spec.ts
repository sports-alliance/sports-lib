import { compareStreamAtTimes } from './stream-reference-comparison';

describe('timestamped reference comparison', () => {
  it('preserves zero and reports missing observations without shifting later samples', () => {
    const actual = [0, null, 20, null, 40];
    const result = compareStreamAtTimes(actual, [0, 10, 20, 40], [0, 1, 2, 4]);
    expect(result).toMatchObject({
      missingTimes: [1],
      matchedCount: 3,
      referenceCount: 4,
      coverage: 0.75,
      meanAbsoluteError: 0,
      withinToleranceCount: 3,
      p95AbsoluteError: 0
    });
    expect(result.pairs.map(pair => pair.time)).toEqual([0, 2, 4]);
    expect(actual).toEqual([0, null, 20, null, 40]);
  });

  it('does not accept a matching value that occurs at the wrong time', () => {
    expect(compareStreamAtTimes([20, 10], [10, 20], [0, 1])).toMatchObject({
      meanAbsoluteError: 10,
      withinToleranceCount: 0
    });
  });

  it('keeps an all-missing comparison unavailable and exposes its zero coverage', () => {
    expect(compareStreamAtTimes([null, NaN, Infinity], [1, 2, 3, 4], [0, 1, 2, 3])).toMatchObject({
      matchedCount: 0,
      coverage: 0,
      meanAbsoluteError: null,
      p95AbsoluteError: null
    });
  });

  it('does not hide a low-coverage match behind a zero average error', () => {
    const result = compareStreamAtTimes([10], [10, 20, 30, 40], [0, 1, 2, 3]);
    expect(result.meanAbsoluteError).toBe(0);
    expect(result.coverage).toBe(0.25);
    expect(result.missingTimes).toEqual([1, 2, 3]);
  });

  it.each([
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1.5],
    [0, NaN]
  ])('rejects invalid reference clocks %j', (...times) => {
    expect(() => compareStreamAtTimes([1, 2], [1, 2], times)).toThrow('timestamps');
  });

  it('rejects empty, mismatched or invalid reference values', () => {
    expect(() => compareStreamAtTimes([], [], [])).toThrow('nonzero length');
    expect(() => compareStreamAtTimes([1], [1, 2], [0])).toThrow('same nonzero length');
    expect(() => compareStreamAtTimes([1], [NaN], [0])).toThrow('finite');
  });
});
