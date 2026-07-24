import {
  calculateThreeDimensionalImpulseResponse,
  type ThreeDimensionalImpulseResponseParameters
} from './three-dimensional-impulse-response';
import {
  fitThreeDimensionalImpulseResponseParameters,
  type ThreeDimensionalDailyStrainLoad,
  type ThreeDimensionalPerformanceObservation
} from './three-dimensional-impulse-response-calibration';

const knownParameters: ThreeDimensionalImpulseResponseParameters = {
  criticalPower: {
    baseline: 250,
    fitnessGain: 1.8,
    fatigueGain: 1.2,
    fitnessTimeConstantDays: 52,
    fatigueTimeConstantDays: 7
  },
  wPrime: {
    baseline: 18_000,
    fitnessGain: 85,
    fatigueGain: 62,
    fitnessTimeConstantDays: 31,
    fatigueTimeConstantDays: 5
  },
  maximumPower: {
    baseline: 1_050,
    fitnessGain: 9,
    fatigueGain: 7,
    fitnessTimeConstantDays: 19,
    fatigueTimeConstantDays: 3
  }
};

describe('three-dimensional impulse-response calibration', () => {
  it('recovers and validates three independent synthetic response models', () => {
    const data = createSyntheticData();
    const calibration = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations);

    expect(calibration.status).toBe('ready');
    expect(calibration.reason).toBeNull();
    expect(calibration.dailyLoadCount).toBe(data.loads.length);
    expect(calibration.dateRange).toEqual({ start: '2025-01-01', end: '2025-07-19' });

    expect(calibration.criticalPower.parameters).toMatchObject({
      baseline: expect.closeTo(knownParameters.criticalPower.baseline, 3),
      fitnessGain: expect.closeTo(knownParameters.criticalPower.fitnessGain, 3),
      fatigueGain: expect.closeTo(knownParameters.criticalPower.fatigueGain, 3),
      fitnessTimeConstantDays: expect.closeTo(knownParameters.criticalPower.fitnessTimeConstantDays, 3),
      fatigueTimeConstantDays: expect.closeTo(knownParameters.criticalPower.fatigueTimeConstantDays, 3)
    });
    expect(calibration.wPrime.parameters).toMatchObject({
      baseline: expect.closeTo(knownParameters.wPrime.baseline, 2),
      fitnessGain: expect.closeTo(knownParameters.wPrime.fitnessGain, 2),
      fatigueGain: expect.closeTo(knownParameters.wPrime.fatigueGain, 2),
      fitnessTimeConstantDays: expect.closeTo(knownParameters.wPrime.fitnessTimeConstantDays, 3),
      fatigueTimeConstantDays: expect.closeTo(knownParameters.wPrime.fatigueTimeConstantDays, 3)
    });
    expect(calibration.maximumPower.parameters).toMatchObject({
      baseline: expect.closeTo(knownParameters.maximumPower.baseline, 3),
      fitnessGain: expect.closeTo(knownParameters.maximumPower.fitnessGain, 3),
      fatigueGain: expect.closeTo(knownParameters.maximumPower.fatigueGain, 3),
      fitnessTimeConstantDays: expect.closeTo(knownParameters.maximumPower.fitnessTimeConstantDays, 3),
      fatigueTimeConstantDays: expect.closeTo(knownParameters.maximumPower.fatigueTimeConstantDays, 3)
    });
    [calibration.criticalPower, calibration.wPrime, calibration.maximumPower].forEach(component => {
      expect(component.diagnostics).toMatchObject({
        observationCount: 27,
        trainingObservationCount: 23,
        validationObservationCount: 4,
        trainingSpanDays: 154
      });
      expect(component.diagnostics!.validationError.normalizedRmse).toBeLessThan(0.000001);
      expect(component.diagnostics!.hitTimeConstantBoundary).toBe(false);
      expect(component.parameters!.fitnessTimeConstantDays).toBeGreaterThan(
        component.parameters!.fatigueTimeConstantDays
      );
    });
  });

  it('is deterministic and accepts observations in arbitrary date order', () => {
    const data = createSyntheticData();
    const first = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations);
    const second = fitThreeDimensionalImpulseResponseParameters(data.loads, [...data.observations].reverse());

    expect(second).toEqual(first);
  });

  it('does not leak held-out performance observations into parameter fitting', () => {
    const data = createSyntheticData();
    const baseline = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations);
    const changedHeldOutValues = data.observations.map((observation, index) =>
      index < data.observations.length - 4
        ? observation
        : { ...observation, criticalPowerWatts: observation.criticalPowerWatts! + 500 }
    );
    const changed = fitThreeDimensionalImpulseResponseParameters(data.loads, changedHeldOutValues);

    expect(baseline.criticalPower.parameters).not.toBeNull();
    expect(changed.criticalPower).toMatchObject({
      status: 'poor-fit',
      reason: 'validation-error-exceeds-limit',
      parameters: null
    });
    expect(changed.criticalPower.diagnostics!.validationError.normalizedRmse).toBeGreaterThan(0.1);
    expect(changed.wPrime.parameters).toEqual(baseline.wPrime.parameters);
    expect(changed.maximumPower.parameters).toEqual(baseline.maximumPower.parameters);
  });

  it('fits channels independently instead of allowing another energy-system load to affect them', () => {
    const data = createSyntheticData();
    const changedWPrimeLoads = data.loads.map(load => ({ ...load, wPrime: load.wPrime * 15 + 40 }));
    const baseline = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations);
    const changed = fitThreeDimensionalImpulseResponseParameters(changedWPrimeLoads, data.observations);

    expect(changed.criticalPower).toEqual(baseline.criticalPower);
    expect(changed.maximumPower).toEqual(baseline.maximumPower);
    expect(changed.wPrime.parameters).not.toEqual(baseline.wPrime.parameters);
  });

  it('returns a useful partial result when only one system has sufficient independent measurements', () => {
    const data = createSyntheticData();
    const onlyCriticalPower = data.observations.map(observation => ({
      date: observation.date,
      criticalPowerWatts: observation.criticalPowerWatts
    }));
    const calibration = fitThreeDimensionalImpulseResponseParameters(data.loads, onlyCriticalPower);

    expect(calibration).toMatchObject({
      status: 'partial',
      criticalPower: { status: 'ready' },
      wPrime: { status: 'insufficient-evidence', reason: 'missing-observations', parameters: null },
      maximumPower: { status: 'insufficient-evidence', reason: 'missing-observations', parameters: null }
    });
  });

  it('gates sparse, short-span, and poor-validation evidence instead of returning defaults', () => {
    const data = createSyntheticData();
    const sparse = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations.slice(0, 15));
    const shortSpan = fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations.slice(0, 16), {
      minimumTrainingSpanDays: 200
    });

    expect(sparse.criticalPower).toMatchObject({
      status: 'insufficient-evidence',
      reason: 'insufficient-observations',
      parameters: null,
      diagnostics: null
    });
    expect(shortSpan.criticalPower).toMatchObject({
      status: 'insufficient-evidence',
      reason: 'insufficient-training-span',
      parameters: null,
      diagnostics: null
    });
  });

  it('does not turn a constant performance series with no strain into a predictive model', () => {
    const data = createSyntheticData();
    const noStrain = data.loads.map(load => ({ ...load, criticalPower: 0, wPrime: 0, maximumPower: 0 }));
    const constantObservations = data.observations.map(observation => ({
      date: observation.date,
      criticalPowerWatts: 250,
      wPrimeJoules: 18_000,
      maximumPowerWatts: 1_000
    }));
    const calibration = fitThreeDimensionalImpulseResponseParameters(noStrain, constantObservations);

    expect(calibration).toMatchObject({
      status: 'insufficient-evidence',
      criticalPower: { status: 'insufficient-evidence', reason: 'no-training-response-signal', parameters: null },
      wPrime: { status: 'insufficient-evidence', reason: 'no-training-response-signal', parameters: null },
      maximumPower: { status: 'insufficient-evidence', reason: 'no-training-response-signal', parameters: null }
    });
    expect(calibration.criticalPower.diagnostics).not.toBeNull();
  });

  it('rejects malformed, ambiguous, and unbounded inputs without throwing', () => {
    const data = createSyntheticData();
    const duplicateLoadDay = [...data.loads, { ...data.loads[0], criticalPower: 999 }];
    const duplicateObservation = [...data.observations, { date: data.observations[0].date, criticalPowerWatts: 251 }];
    const incompatibleSameDayObservations = [
      { date: '2025-02-01', criticalPowerWatts: 300 },
      { date: '2025-02-01', maximumPowerWatts: 300 }
    ];

    expect(fitThreeDimensionalImpulseResponseParameters([], data.observations)).toMatchObject({
      status: 'invalid-input',
      reason: 'invalid-daily-loads'
    });
    expect(fitThreeDimensionalImpulseResponseParameters(duplicateLoadDay, data.observations)).toMatchObject({
      status: 'invalid-input',
      reason: 'invalid-daily-loads'
    });
    expect(fitThreeDimensionalImpulseResponseParameters(data.loads, duplicateObservation)).toMatchObject({
      status: 'invalid-input',
      reason: 'invalid-observations'
    });
    expect(
      fitThreeDimensionalImpulseResponseParameters(data.loads, [{ date: '2024-12-31', criticalPowerWatts: 250 }])
    ).toMatchObject({ status: 'invalid-input', reason: 'observations-precede-load-history' });
    expect(
      fitThreeDimensionalImpulseResponseParameters(
        [
          { ...data.loads[0], date: '2020-01-01' },
          { ...data.loads[1], date: '2035-01-01' }
        ],
        [{ date: '2035-01-01', criticalPowerWatts: 250 }]
      )
    ).toMatchObject({ status: 'invalid-input', reason: 'calendar-span-exceeds-limit' });
    expect(
      fitThreeDimensionalImpulseResponseParameters(data.loads, [{ date: '2025-02-30', criticalPowerWatts: 250 }])
    ).toMatchObject({ status: 'invalid-input', reason: 'invalid-observations' });
    expect(
      fitThreeDimensionalImpulseResponseParameters(data.loads, [
        { date: '2025-02-01', criticalPowerWatts: 300, maximumPowerWatts: 300 }
      ])
    ).toMatchObject({ status: 'invalid-input', reason: 'invalid-observations' });
    expect(fitThreeDimensionalImpulseResponseParameters(data.loads, incompatibleSameDayObservations)).toMatchObject({
      status: 'invalid-input',
      reason: 'invalid-observations'
    });
    expect(
      fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations, {
        minimumTimeConstantDays: 10,
        maximumTimeConstantDays: 10
      })
    ).toMatchObject({ status: 'invalid-input', reason: 'invalid-options' });
    expect(
      fitThreeDimensionalImpulseResponseParameters(data.loads, data.observations, {
        minimumFitnessToFatigueTimeConstantRatio: 0.5
      })
    ).toMatchObject({ status: 'invalid-input', reason: 'invalid-options' });
  });

  it('allows different same-day measurements in separate records', () => {
    const data = createSyntheticData();
    const splitObservations = data.observations.flatMap(observation => [
      { date: observation.date, criticalPowerWatts: observation.criticalPowerWatts },
      { date: observation.date, wPrimeJoules: observation.wPrimeJoules },
      { date: observation.date, maximumPowerWatts: observation.maximumPowerWatts }
    ]);

    expect(fitThreeDimensionalImpulseResponseParameters(data.loads, splitObservations)).toMatchObject({
      status: 'ready',
      criticalPower: { status: 'ready' },
      wPrime: { status: 'ready' },
      maximumPower: { status: 'ready' }
    });
  });

  it('is invariant to deterministic permutations of daily loads and split same-day observations', () => {
    const data = createSyntheticData();
    const splitObservations = data.observations.flatMap(observation => [
      { date: observation.date, criticalPowerWatts: observation.criticalPowerWatts },
      { date: observation.date, wPrimeJoules: observation.wPrimeJoules },
      { date: observation.date, maximumPowerWatts: observation.maximumPowerWatts }
    ]);
    const expected = fitThreeDimensionalImpulseResponseParameters(data.loads, splitObservations);

    [17, 83, 2_021, 99_991].forEach(seed => {
      expect(
        fitThreeDimensionalImpulseResponseParameters(
          permuteDeterministically(data.loads, seed),
          permuteDeterministically(splitObservations, seed * 17)
        )
      ).toEqual(expected);
    });
  });

  it('treats omitted zero-load rest days exactly like explicit zero-load days', () => {
    const data = createSyntheticData();
    const denseLoads = data.loads.map((load, index) =>
      index % 13 === 5 ? { ...load, criticalPower: 0, wPrime: 0, maximumPower: 0 } : load
    );
    const sparseLoads = denseLoads.filter(
      load => load.criticalPower !== 0 || load.wPrime !== 0 || load.maximumPower !== 0
    );

    expect(fitThreeDimensionalImpulseResponseParameters(sparseLoads, data.observations)).toEqual(
      fitThreeDimensionalImpulseResponseParameters(denseLoads, data.observations)
    );
  });

  it('rejects a deterministic matrix of malformed values without throwing', () => {
    const data = createSyntheticData();
    const invalidCases: Array<{
      name: string;
      dailyLoads: unknown;
      observations: unknown;
      options?: unknown;
      reason: 'invalid-daily-loads' | 'invalid-observations' | 'invalid-options';
    }> = [
      {
        name: 'negative daily CP load',
        dailyLoads: [{ ...data.loads[0], criticalPower: -1 }],
        observations: data.observations,
        reason: 'invalid-daily-loads'
      },
      {
        name: 'non-finite daily W prime load',
        dailyLoads: [{ ...data.loads[0], wPrime: Number.POSITIVE_INFINITY }],
        observations: data.observations,
        reason: 'invalid-daily-loads'
      },
      {
        name: 'duplicate daily date',
        dailyLoads: [data.loads[0], { ...data.loads[0], maximumPower: 99 }],
        observations: data.observations,
        reason: 'invalid-daily-loads'
      },
      {
        name: 'impossible observation date',
        dailyLoads: data.loads,
        observations: [{ date: '2025-02-30', criticalPowerWatts: 250 }],
        reason: 'invalid-observations'
      },
      {
        name: 'nonpositive observed W prime',
        dailyLoads: data.loads,
        observations: [{ date: '2025-02-01', wPrimeJoules: 0 }],
        reason: 'invalid-observations'
      },
      {
        name: 'non-finite observed maximum power',
        dailyLoads: data.loads,
        observations: [{ date: '2025-02-01', maximumPowerWatts: Number.NaN }],
        reason: 'invalid-observations'
      },
      {
        name: 'duplicate observed critical power component',
        dailyLoads: data.loads,
        observations: [
          { date: '2025-02-01', criticalPowerWatts: 250 },
          { date: '2025-02-01', criticalPowerWatts: 251 }
        ],
        reason: 'invalid-observations'
      },
      {
        name: 'maximum power no greater than critical power',
        dailyLoads: data.loads,
        observations: [{ date: '2025-02-01', criticalPowerWatts: 300, maximumPowerWatts: 300 }],
        reason: 'invalid-observations'
      },
      {
        name: 'zero validation observation count',
        dailyLoads: data.loads,
        observations: data.observations,
        options: { validationObservationCount: 0 },
        reason: 'invalid-options'
      },
      {
        name: 'non-finite time constant bound',
        dailyLoads: data.loads,
        observations: data.observations,
        options: { maximumTimeConstantDays: Number.POSITIVE_INFINITY },
        reason: 'invalid-options'
      },
      {
        name: 'inverted response time constants',
        dailyLoads: data.loads,
        observations: data.observations,
        options: { minimumFitnessToFatigueTimeConstantRatio: 0.5 },
        reason: 'invalid-options'
      }
    ];

    invalidCases.forEach(({ name, dailyLoads, observations, options, reason }) => {
      let result: ReturnType<typeof fitThreeDimensionalImpulseResponseParameters> | undefined;

      expect(() => {
        result = fitThreeDimensionalImpulseResponseParameters(
          dailyLoads as ThreeDimensionalDailyStrainLoad[],
          observations as ThreeDimensionalPerformanceObservation[],
          options as Parameters<typeof fitThreeDimensionalImpulseResponseParameters>[2]
        );
      }).not.toThrow();

      expect({ name, result }).toMatchObject({ name, result: { status: 'invalid-input', reason } });
    });
  });

  it('does not return a model with a nonpositive baseline or daily performance', () => {
    const loads = Array.from({ length: 200 }, (_, index) => ({
      date: dateForIndex(index),
      criticalPower: 40 + (index % 7 === 0 ? 100 : 0) + (index % 19 < 3 ? 50 : 0),
      wPrime: 5,
      maximumPower: 1
    }));
    const response = calculateThreeDimensionalImpulseResponse(
      loads.map(({ criticalPower, wPrime, maximumPower }) => ({ criticalPower, wPrime, maximumPower })),
      {
        criticalPower: {
          baseline: -100,
          fitnessGain: 12,
          fatigueGain: 0,
          fitnessTimeConstantDays: 20,
          fatigueTimeConstantDays: 5
        },
        wPrime: knownParameters.wPrime,
        maximumPower: knownParameters.maximumPower
      }
    )!;
    const observations = response
      .map((point, index) => ({ point, index }))
      .filter(({ index }) => index >= 50 && index % 7 === 0)
      .map(({ point, index }) => ({ date: loads[index].date, criticalPowerWatts: point.criticalPower.performance }));
    const calibration = fitThreeDimensionalImpulseResponseParameters(loads, observations, {
      maximumValidationNormalizedRmse: 0.2
    });

    const parameters = calibration.criticalPower.parameters;
    expect(parameters).not.toBeNull();
    expect(parameters!.baseline).toBeGreaterThan(0);
    const fittedResponse = calculateThreeDimensionalImpulseResponse(
      loads.map(({ criticalPower, wPrime, maximumPower }) => ({ criticalPower, wPrime, maximumPower })),
      { criticalPower: parameters!, wPrime: knownParameters.wPrime, maximumPower: knownParameters.maximumPower }
    )!;
    expect(fittedResponse.every(point => point.criticalPower.performance > 0)).toBe(true);
  });

  it('keeps bounded finite diagnostics over a ten-year zero-filled training history', () => {
    const loads: ThreeDimensionalDailyStrainLoad[] = [
      { date: '2015-01-01', criticalPower: 80, wPrime: 10, maximumPower: 2 },
      { date: '2024-12-29', criticalPower: 90, wPrime: 15, maximumPower: 3 }
    ];
    const observations = Array.from({ length: 16 }, (_, index) => ({
      date: formatDate(2015 + Math.floor(index / 2), index % 2 === 0 ? 6 : 12, 1),
      criticalPowerWatts: 250 + index,
      wPrimeJoules: 18_000 + index * 100,
      maximumPowerWatts: 1_000 + index * 2
    }));
    const result = fitThreeDimensionalImpulseResponseParameters(loads, observations, {
      maximumIterations: 50,
      maximumCalendarSpanDays: 3_660
    });

    expect(result.status).not.toBe('invalid-input');
    expect(result.dailyLoadCount).toBeLessThanOrEqual(3_660);
    [result.criticalPower, result.wPrime, result.maximumPower].forEach(component => {
      if (component.diagnostics) {
        expect(Number.isFinite(component.diagnostics.trainingError.rmse)).toBe(true);
        expect(Number.isFinite(component.diagnostics.validationError.rmse)).toBe(true);
      }
    });
  });
});

function createSyntheticData(): {
  loads: ThreeDimensionalDailyStrainLoad[];
  observations: ThreeDimensionalPerformanceObservation[];
} {
  const loads = Array.from({ length: 200 }, (_, index) => ({
    date: dateForIndex(index),
    criticalPower: 45 + (index % 7 === 0 ? 105 : 0) + (index % 19 < 3 ? 40 : 0),
    wPrime: 4 + (index % 5 === 0 ? 38 : 0) + (index % 23 === 0 ? 20 : 0),
    maximumPower: 0.5 + (index % 11 === 0 ? 14 : 0) + (index % 29 === 0 ? 10 : 0)
  }));
  const response = calculateThreeDimensionalImpulseResponse(
    loads.map(({ criticalPower, wPrime, maximumPower }) => ({ criticalPower, wPrime, maximumPower })),
    knownParameters
  )!;
  const observations = response
    .map((point, index) => ({ point, index }))
    .filter(({ index }) => index >= 10 && index % 7 === 0)
    .map(({ point, index }) => ({
      date: dateForIndex(index),
      criticalPowerWatts: point.criticalPower.performance,
      wPrimeJoules: point.wPrime.performance,
      maximumPowerWatts: point.maximumPower.performance
    }));
  return { loads, observations };
}

function dateForIndex(index: number): string {
  const date = new Date(Date.UTC(2025, 0, 1 + index));
  return date.toISOString().slice(0, 10);
}

function formatDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function permuteDeterministically<T>(values: readonly T[], seed: number): T[] {
  const result = [...values];
  let state = seed >>> 0;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
