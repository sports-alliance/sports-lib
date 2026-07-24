import { ActivityTypes } from '../../activities/activity.types';
import {
  buildPowerDurationEnvelope,
  fitThreeDimensionalCapacityModel,
  type DatedActivityPowerCurve
} from './three-dimensional-capacity';
import {
  predictThreeParameterCriticalPower,
  type ThreeParameterCriticalPowerModel
} from './three-dimensional-impulse-response';

const KNOWN_MODEL: ThreeParameterCriticalPowerModel = {
  criticalPowerWatts: 280,
  wPrimeJoules: 18_000,
  maximumPowerWatts: 1_000
};
const ALL_DURATIONS = [1, 2, 3, 5, 8, 12, 20, 30, 120, 180, 240, 300, 480, 720, 900, 1200];

function createCurve(
  sourceId: string,
  date: string,
  scale = 1,
  activityType: ActivityTypes = ActivityTypes.Cycling,
  durations: readonly number[] = ALL_DURATIONS
): DatedActivityPowerCurve {
  return {
    sourceId,
    date,
    activityType,
    powerCurve: durations.map(duration => ({
      duration,
      power: predictThreeParameterCriticalPower(KNOWN_MODEL, duration)! * scale
    }))
  };
}

function createHistory(): DatedActivityPowerCurve[] {
  return [
    createCurve('activity-a', '2026-01-01', 0.98),
    createCurve('activity-b', '2026-01-10', 1),
    createCurve('activity-c', '2026-01-20', 0.99)
  ];
}

function createNoisyHistory(seed: number, activityType = ActivityTypes.Cycling): DatedActivityPowerCurve[] {
  const random = createSeededRandom(seed);
  const dates = ['2026-01-01', '2026-01-08', '2026-01-15', '2026-01-22', '2026-01-29', '2026-02-05'];
  const scales = [0.96, 0.98, 1, 0.97, 0.99, 0.95];
  return dates.map((date, sourceIndex) => ({
    sourceId: `seed-${seed}-activity-${sourceIndex}`,
    date,
    activityType,
    powerCurve: ALL_DURATIONS.map(duration => ({
      duration,
      power:
        predictThreeParameterCriticalPower(KNOWN_MODEL, duration)! *
        scales[sourceIndex] *
        (1 + (random() - 0.5) * 0.002)
    }))
  }));
}

describe('three-dimensional capacity estimation', () => {
  it('builds a deterministic, provenance-retaining envelope', () => {
    const history = createHistory();
    const forward = buildPowerDurationEnvelope(history, { effectiveDate: '2026-01-22' });
    const reversed = buildPowerDurationEnvelope([...history].reverse(), { effectiveDate: '2026-01-22' });

    expect(forward).toEqual(reversed);
    expect(forward).toMatchObject({
      status: 'ready',
      activityType: ActivityTypes.Cycling,
      sourceCount: 3,
      historyStartDate: '2026-01-01',
      historyEndDate: '2026-01-20',
      historySpanDays: 19,
      points: expect.arrayContaining([
        expect.objectContaining({ durationSeconds: 1, sourceId: 'activity-b' }),
        expect.objectContaining({ durationSeconds: 1200, sourceId: 'activity-b' })
      ])
    });
    expect(forward.sourceFingerprint).toMatch(/^three-dimensional-capacity-v1:[0-9a-f]{16}$/);
  });

  it('recovers a complete model from a dated multi-activity history', () => {
    const fit = fitThreeDimensionalCapacityModel(createHistory(), { effectiveDate: '2026-01-22' });

    expect(fit.status).toBe('ready');
    expect(fit.reason).toBeNull();
    expect(fit.model).not.toBeNull();
    expect(relativeError(fit.model!.criticalPowerWatts, KNOWN_MODEL.criticalPowerWatts)).toBeLessThan(0.02);
    expect(relativeError(fit.model!.wPrimeJoules, KNOWN_MODEL.wPrimeJoules)).toBeLessThan(0.2);
    expect(relativeError(fit.model!.maximumPowerWatts, KNOWN_MODEL.maximumPowerWatts)).toBeLessThan(0.1);
    expect(fit.criticalPower.status).toBe('ready');
    expect(fit.wPrime.status).toBe('ready');
    expect(fit.maximumPower.status).toBe('ready');
    expect(fit.diagnostics.criticalPowerCandidates).toHaveLength(3);
  });

  it('returns partial CP/W′ evidence when short-duration Pmax evidence is absent', () => {
    const longDurations = [120, 180, 240, 300, 480, 720, 900, 1200];
    const history = [
      createCurve('activity-a', '2026-01-01', 0.98, ActivityTypes.Cycling, longDurations),
      createCurve('activity-b', '2026-01-10', 1, ActivityTypes.Cycling, longDurations),
      createCurve('activity-c', '2026-01-20', 0.99, ActivityTypes.Cycling, longDurations)
    ];

    expect(fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-01-22' })).toMatchObject({
      status: 'partial',
      reason: 'insufficient-maximum-power-range',
      model: null,
      criticalPower: { status: 'ready', value: expect.any(Number) },
      wPrime: { status: 'ready', value: expect.any(Number) },
      maximumPower: { status: 'insufficient-evidence', value: null }
    });
  });

  it('requires multiple dated activities instead of treating one workout as athlete capacity', () => {
    expect(
      fitThreeDimensionalCapacityModel([createCurve('single', '2026-01-01')], {
        effectiveDate: '2026-01-22'
      })
    ).toMatchObject({
      status: 'insufficient-evidence',
      reason: 'insufficient-history',
      model: null
    });
  });

  it('canonicalizes activity aliases but rejects mixed exact activity types', () => {
    const aliased = createHistory().map(curve => ({ ...curve, activityType: 'cycling' as ActivityTypes }));
    expect(fitThreeDimensionalCapacityModel(aliased, { effectiveDate: '2026-01-22' }).activityType).toBe(
      ActivityTypes.Cycling
    );

    const mixed = createHistory();
    mixed[2] = { ...mixed[2], activityType: ActivityTypes.IndoorCycling };
    expect(fitThreeDimensionalCapacityModel(mixed, { effectiveDate: '2026-01-22' })).toMatchObject({
      status: 'invalid-input',
      reason: 'mixed-activity-types',
      model: null
    });
  });

  it.each([
    {
      name: 'invalid effective date',
      history: createHistory(),
      effectiveDate: '2026-02-30',
      reason: 'invalid-effective-date'
    },
    {
      name: 'future evidence',
      history: [...createHistory(), createCurve('future', '2026-01-22')],
      effectiveDate: '2026-01-22',
      reason: 'future-evidence'
    },
    {
      name: 'duplicate source',
      history: [...createHistory(), createCurve('activity-a', '2026-01-21')],
      effectiveDate: '2026-01-22',
      reason: 'duplicate-source'
    },
    {
      name: 'invalid source date',
      history: createHistory().map((curve, index) => (index === 0 ? { ...curve, date: 'not-a-date' } : curve)),
      effectiveDate: '2026-01-22',
      reason: 'invalid-date'
    },
    {
      name: 'curve without valid points',
      history: createHistory().map((curve, index) =>
        index === 0
          ? {
              ...curve,
              powerCurve: [
                { duration: Number.NaN, power: 300 },
                { duration: 60, power: -1 }
              ]
            }
          : curve
      ),
      effectiveDate: '2026-01-22',
      reason: 'invalid-power-curve'
    }
  ])('returns $reason without throwing for $name', ({ history, effectiveDate, reason }) => {
    expect(() => fitThreeDimensionalCapacityModel(history, { effectiveDate })).not.toThrow();
    expect(fitThreeDimensionalCapacityModel(history, { effectiveDate })).toMatchObject({
      status: 'invalid-input',
      reason,
      model: null
    });
  });

  it('uses a stable invalid-input priority regardless of source order', () => {
    const malformed = [
      { ...createCurve('bad-curve', '2026-01-01'), powerCurve: [] },
      { ...createCurve('bad-date', '2026-01-10'), date: 'not-a-date' },
      createCurve('future', '2026-01-22')
    ];

    const forward = fitThreeDimensionalCapacityModel(malformed, { effectiveDate: '2026-01-22' });
    const reversed = fitThreeDimensionalCapacityModel([...malformed].reverse(), {
      effectiveDate: '2026-01-22'
    });

    expect(forward).toEqual(reversed);
    expect(forward).toMatchObject({
      status: 'invalid-input',
      reason: 'invalid-date',
      model: null
    });
  });

  it('drops malformed points without letting them change the model fingerprint', () => {
    const history = createHistory();
    const withMalformed = history.map((curve, index) =>
      index === 0
        ? {
            ...curve,
            powerCurve: [...curve.powerCurve, { duration: -1, power: Number.POSITIVE_INFINITY }]
          }
        : curve
    );
    const clean = buildPowerDurationEnvelope(history, { effectiveDate: '2026-01-22' });
    const normalized = buildPowerDurationEnvelope(withMalformed, { effectiveDate: '2026-01-22' });

    expect(normalized.rejectedPointCount).toBe(1);
    expect(normalized.sourceFingerprint).toBe(clean.sourceFingerprint);
    expect(normalized.points).toEqual(clean.points);
  });

  it('rejects flat and poorly identified histories instead of manufacturing a boundary model', () => {
    const history = ['2026-01-01', '2026-01-10', '2026-01-20'].map((date, index) => ({
      sourceId: `flat-${index}`,
      date,
      activityType: ActivityTypes.Cycling,
      powerCurve: ALL_DURATIONS.map(duration => ({ duration, power: 250 }))
    }));

    expect(fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-01-22' })).toMatchObject({
      status: expect.stringMatching(/poor-fit|unstable/),
      model: null
    });
  });

  it('contains finite-input numerical overflow without emitting non-finite diagnostics', () => {
    const criticalPowerWatts = 1e156;
    const wPrimeJoules = 1e158;
    const maximumPowerWatts = 4e156;
    const timeOffsetSeconds = wPrimeJoules / (maximumPowerWatts - criticalPowerWatts);
    const history = ['2026-01-01', '2026-01-10', '2026-01-20'].map((date, index) => ({
      sourceId: `extreme-${index}`,
      date,
      activityType: ActivityTypes.Cycling,
      powerCurve: ALL_DURATIONS.map(duration => ({
        duration,
        power: criticalPowerWatts + wPrimeJoules / (duration + timeOffsetSeconds)
      }))
    }));

    const result = fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-01-22' });
    const numericValues: number[] = [];
    collectNumericValues(result, numericValues);

    expect(result).toMatchObject({
      status: 'poor-fit',
      reason: 'poor-critical-power-fit',
      model: null
    });
    expect(numericValues.every(Number.isFinite)).toBe(true);
  });

  it.each([1, 7, 42, 1_337, 65_537])(
    'is order invariant and recovers stable parameters for deterministic noisy seed %s',
    seed => {
      const history = createNoisyHistory(seed);
      const random = createSeededRandom(seed ^ 0x9e3779b9);
      const permuted = [...history].sort(() => random() - 0.5);

      const expected = fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-02-12' });
      const actual = fitThreeDimensionalCapacityModel(permuted, { effectiveDate: '2026-02-12' });

      expect(actual).toEqual(expected);
      expect(actual.status).toBe('ready');
      expect(relativeError(actual.model!.criticalPowerWatts, KNOWN_MODEL.criticalPowerWatts)).toBeLessThan(0.03);
      expect(relativeError(actual.model!.wPrimeJoules, KNOWN_MODEL.wPrimeJoules)).toBeLessThan(0.2);
      expect(relativeError(actual.model!.maximumPowerWatts, KNOWN_MODEL.maximumPowerWatts)).toBeLessThan(0.1);
    }
  );

  it('uses the same estimator for a non-running/cycling canonical activity type', () => {
    const fit = fitThreeDimensionalCapacityModel(createNoisyHistory(42, ActivityTypes.Rowing), {
      effectiveDate: '2026-02-12'
    });

    expect(fit).toMatchObject({
      status: 'ready',
      activityType: ActivityTypes.Rowing,
      model: {
        criticalPowerWatts: expect.any(Number),
        wPrimeJoules: expect.any(Number),
        maximumPowerWatts: expect.any(Number)
      }
    });
  });

  it('handles a dense 42-day history without changing results when inputs are reversed', () => {
    const history = Array.from({ length: 84 }, (_value, index) => {
      const day = 1 + Math.floor(index / 2);
      return createCurve(
        `dense-${index}`,
        new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10),
        0.9 + (index % 10) / 100
      );
    });

    const forward = fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-02-12' });
    const reversed = fitThreeDimensionalCapacityModel([...history].reverse(), { effectiveDate: '2026-02-12' });

    expect(forward).toEqual(reversed);
    expect(forward.status).toBe('ready');
  });
});

function relativeError(actual: number, expected: number): number {
  return Math.abs(actual - expected) / expected;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function collectNumericValues(value: unknown, target: number[]): void {
  if (typeof value === 'number') {
    target.push(value);
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  Object.values(value).forEach(nested => collectNumericValues(nested, target));
}
