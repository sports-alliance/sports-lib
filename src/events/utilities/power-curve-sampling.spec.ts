import { comparePowerCurveWindows, samplePowerCurveAtDuration } from './power-curve-sampling';
import { DataDuration } from '../../data/data.duration';
import { DataPower } from '../../data/data.power';

describe('power curve sampling', () => {
  it('uses exact points and keeps the strongest duplicate', () => {
    expect(
      samplePowerCurveAtDuration(
        [
          { duration: 60, power: 290 },
          { duration: 60, power: 300 }
        ],
        60
      )
    ).toBe(300);
  });

  it('interpolates only inside a bounded reciprocal-duration bracket', () => {
    const close = samplePowerCurveAtDuration(
      [
        { duration: 55, power: 310 },
        { duration: 65, power: 290 }
      ],
      60
    );
    expect(close).toBeCloseTo(299.167, 3);
    expect(
      samplePowerCurveAtDuration(
        [
          { duration: 30, power: 340 },
          { duration: 90, power: 270 }
        ],
        60
      )
    ).toBeNull();
  });

  it('accepts hydrated data values, watts per kg, and the exact bracket boundary', () => {
    const points = [
      {
        duration: new DataDuration(60),
        power: new DataPower(300),
        wattsPerKg: 4
      },
      {
        duration: new DataDuration(75),
        power: new DataPower(280),
        wattsPerKg: 3.5
      }
    ];
    expect(samplePowerCurveAtDuration(points, 70)).not.toBeNull();
    expect(samplePowerCurveAtDuration(points, 60, { key: 'wattsPerKg' })).toBe(4);
  });

  it('normalizes unsorted input and ignores invalid points and unsafe ratio overrides', () => {
    const points = [
      { duration: 65, power: 290 },
      { duration: -1, power: 999 },
      { duration: 55, power: 310 },
      { duration: 60, power: Number.NaN }
    ];
    expect(samplePowerCurveAtDuration(points, 60)).toBeCloseTo(299.167, 3);
    expect(
      samplePowerCurveAtDuration(
        [
          { duration: 30, power: 340 },
          { duration: 90, power: 270 }
        ],
        60,
        { maximumBracketDurationRatio: 999 }
      )
    ).toBeNull();
    expect(samplePowerCurveAtDuration(points, 60, { maximumBracketDurationRatio: Number.NaN })).toBeCloseTo(299.167, 3);
  });

  it('ignores malformed or throwing hydrated values without coercing arbitrary objects', () => {
    const recursive: { getValue: () => unknown } = { getValue: () => recursive };
    expect(() =>
      samplePowerCurveAtDuration(
        [
          { duration: { getValue: 60 }, power: 300 },
          {
            duration: {
              getValue: () => {
                throw new Error('bad value');
              }
            },
            power: 300
          },
          { duration: recursive, power: 300 },
          { duration: true, power: 300 },
          { duration: [], power: 300 },
          { duration: 60, power: { valueOf: () => 300 } },
          { duration: 60, power: 290 }
        ],
        60
      )
    ).not.toThrow();
    expect(
      samplePowerCurveAtDuration(
        [
          { duration: { getValue: 60 }, power: 300 },
          { duration: 60, power: 290 }
        ],
        60
      )
    ).toBe(290);
  });

  it('compares recent evidence as a percentage of the reference curve', () => {
    expect(
      comparePowerCurveWindows([{ duration: 300, power: 280 }], [{ duration: 300, power: 300 }], [300, 1200])
    ).toEqual([
      {
        durationSeconds: 300,
        recentValue: 280,
        referenceValue: 300,
        retentionPercent: 93.33333333333333,
        deltaPercent: -6.666666666666671
      },
      {
        durationSeconds: 1200,
        recentValue: null,
        referenceValue: null,
        retentionPercent: null,
        deltaPercent: null
      }
    ]);
  });

  it('normalizes each comparison window once for all requested durations', () => {
    const recentDuration = jest.fn(() => 60);
    const recentPower = jest.fn(() => 300);
    const referenceDuration = jest.fn(() => 60);
    const referencePower = jest.fn(() => 320);
    const comparisons = comparePowerCurveWindows(
      [{ duration: { getValue: recentDuration }, power: { getValue: recentPower } }],
      [{ duration: { getValue: referenceDuration }, power: { getValue: referencePower } }],
      Array.from({ length: 1000 }, () => 60)
    );

    expect(comparisons).toHaveLength(1000);
    expect(comparisons[999]).toMatchObject({ recentValue: 300, referenceValue: 320 });
    expect(recentDuration).toHaveBeenCalledTimes(1);
    expect(recentPower).toHaveBeenCalledTimes(1);
    expect(referenceDuration).toHaveBeenCalledTimes(1);
    expect(referencePower).toHaveBeenCalledTimes(1);
  });
});
