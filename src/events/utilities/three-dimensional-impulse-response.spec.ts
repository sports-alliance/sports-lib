import {
  calculateImpulseResponse,
  calculateMaximumPowerAvailable,
  calculateThreeDimensionalImpulseResponse,
  calculateThreeDimensionalStrain,
  calculateThreeDimensionalStrainCoefficient,
  fitThreeParameterCriticalPowerModel,
  predictThreeParameterCriticalPower,
  resolveThreeDimensionalPowerContributions,
  type ThreeParameterCriticalPowerModel
} from './three-dimensional-impulse-response';

const model: ThreeParameterCriticalPowerModel = {
  criticalPowerWatts: 300,
  wPrimeJoules: 20_000,
  maximumPowerWatts: 1_200
};

describe('three-dimensional impulse-response utilities', () => {
  describe('three-parameter critical-power model', () => {
    it("predicts Morton's three-parameter power-duration relationship", () => {
      expect(predictThreeParameterCriticalPower(model, 1)).toBeCloseTo(1_161.244019, 6);
      expect(predictThreeParameterCriticalPower(model, 60)).toBeCloseTo(543.243243, 6);
      expect(predictThreeParameterCriticalPower(model, 1_200)).toBeCloseTo(316.363636, 6);
    });

    it('rejects invalid models and duration values', () => {
      expect(predictThreeParameterCriticalPower({ ...model, maximumPowerWatts: 300 }, 60)).toBeNull();
      expect(predictThreeParameterCriticalPower(model, 0)).toBeNull();
      expect(predictThreeParameterCriticalPower(model, Number.NaN)).toBeNull();
    });

    it("recovers an exact synthetic model across the paper's 5s to 20min fitting durations", () => {
      const expected = {
        criticalPowerWatts: 225,
        wPrimeJoules: 11_300,
        maximumPowerWatts: 745
      };
      const durations = [5, 30, 60, 120, 150, 180, 360, 480, 600, 720, 1_200];
      const fit = fitThreeParameterCriticalPowerModel(
        durations.map(duration => ({
          duration,
          power: predictThreeParameterCriticalPower(expected, duration)
        }))
      );

      expect(fit).not.toBeNull();
      expect(fit!.model.criticalPowerWatts).toBeCloseTo(expected.criticalPowerWatts, 4);
      expect(fit!.model.wPrimeJoules).toBeCloseTo(expected.wPrimeJoules, 2);
      expect(fit!.model.maximumPowerWatts).toBeCloseTo(expected.maximumPowerWatts, 4);
      expect(fit!.rmseWatts).toBeLessThan(0.00001);
      expect(fit!.rSquared).toBeCloseTo(1, 8);
    });

    it("matches the published Sep-24 Morton fit from the paper's supporting dataset", () => {
      // Kontro et al. (2026), S2 File, fit using 5, 30, 60, 120, 150, 180, 360, 480, 600, 720 and 1200 s.
      const fit = fitThreeParameterCriticalPowerModel([
        { duration: 5, power: 963.2 },
        { duration: 30, power: 614.9 },
        { duration: 60, power: 459.5 },
        { duration: 120, power: 355.3 },
        { duration: 150, power: 347 },
        { duration: 180, power: 319.1 },
        { duration: 360, power: 302.7 },
        { duration: 480, power: 300.1 },
        { duration: 600, power: 298.8 },
        { duration: 720, power: 298.9 },
        { duration: 1_200, power: 291.7 }
      ]);

      expect(fit).not.toBeNull();
      expect(fit!.model.criticalPowerWatts).toBeCloseTo(265.223853, 3);
      expect(fit!.model.wPrimeJoules).toBeCloseTo(15_184.090273, 1);
      expect(fit!.model.maximumPowerWatts).toBeCloseTo(1_178.130074, 3);
      expect(fit!.rmseWatts).toBeCloseTo(14.007765, 3);
    });

    it('normalizes hydrated values, deduplicates durations, and ignores malformed curve points', () => {
      const source = {
        criticalPowerWatts: 240,
        wPrimeJoules: 18_000,
        maximumPowerWatts: 950
      };
      const durations = [5, 30, 60, 120, 180, 360, 720, 1_200];
      const fit = fitThreeParameterCriticalPowerModel([
        { duration: { getValue: () => 5 }, power: { getValue: () => predictThreeParameterCriticalPower(source, 5) } },
        ...durations
          .slice(1)
          .map(duration => ({ duration, power: predictThreeParameterCriticalPower(source, duration) })),
        { duration: 60, power: 1 },
        { duration: -1, power: 999 },
        { duration: 300, power: Number.NaN }
      ]);

      expect(fit).not.toBeNull();
      expect(fit!.sampleCount).toBe(durations.length);
      expect(fit!.model.criticalPowerWatts).toBeCloseTo(source.criticalPowerWatts, 4);
    });

    it('requires enough distinct usable durations', () => {
      expect(
        fitThreeParameterCriticalPowerModel([
          { duration: 5, power: 800 },
          { duration: 60, power: 400 },
          { duration: 60, power: 410 },
          { duration: 180, power: 300 },
          { duration: 0, power: 500 }
        ])
      ).toBeNull();
    });
  });

  describe('power allocation and strain', () => {
    it("matches the paper's CP, W′, and Pmax allocations at 400 W and 1000 W", () => {
      expect(resolveThreeDimensionalPowerContributions(400, model)).toEqual({
        criticalPowerWatts: 300,
        wPrimeWatts: 88.88888888888889,
        maximumPowerWatts: 11.11111111111111
      });
      expect(resolveThreeDimensionalPowerContributions(1_000, model)).toEqual({
        criticalPowerWatts: 300,
        wPrimeWatts: 155.55555555555554,
        maximumPowerWatts: 544.4444444444445
      });
    });

    it('assigns all sub-critical power to the oxidative component', () => {
      expect(resolveThreeDimensionalPowerContributions(250, model)).toEqual({
        criticalPowerWatts: 250,
        wPrimeWatts: 0,
        maximumPowerWatts: 0
      });
    });

    it('preserves power allocation and bounded-strain invariants across the model domain', () => {
      const powers = [0, 1, 299, 300, 301, 400, 750, 1_199, 1_200];
      const balances = [0, 1, 10_000, 19_999, 20_000];

      powers.forEach(power => {
        const allocation = resolveThreeDimensionalPowerContributions(power, model)!;
        expect(allocation.criticalPowerWatts + allocation.wPrimeWatts + allocation.maximumPowerWatts).toBeCloseTo(
          power,
          12
        );

        balances.forEach(balance => {
          const mpa = calculateMaximumPowerAvailable(balance, model)!;
          const coefficient = calculateThreeDimensionalStrainCoefficient(power, mpa, model)!;
          expect(coefficient).toBeGreaterThan(0);
          expect(coefficient).toBeLessThanOrEqual(1);
        });
      });
    });

    it('calculates MPA for both the main-model and quadratic supporting-workbook variants', () => {
      expect(calculateMaximumPowerAvailable(20_000, model)).toBe(1_200);
      expect(calculateMaximumPowerAvailable(0, model)).toBe(300);
      expect(calculateMaximumPowerAvailable(10_000, model, 1)).toBe(750);
      expect(calculateMaximumPowerAvailable(10_000, model, 2)).toBe(975);
    });

    it('calculates Equation 11 strain coefficients across available-power states', () => {
      const mpaAtFullBalance = calculateMaximumPowerAvailable(20_000, model)!;
      expect(calculateThreeDimensionalStrainCoefficient(100, mpaAtFullBalance, model)).toBeCloseTo(0.214286, 6);
      expect(calculateThreeDimensionalStrainCoefficient(300, mpaAtFullBalance, model)).toBeCloseTo(0.25, 6);
      expect(calculateThreeDimensionalStrainCoefficient(400, 400, model)).toBeCloseTo(1, 6);
      expect(calculateThreeDimensionalStrainCoefficient(400, 300, model)).toBeCloseTo(1, 6);
    });

    it('normalizes one hour at CP in a recovered state to 100 strain score', () => {
      const analysis = calculateThreeDimensionalStrain(new Array(3_600).fill(300), model);

      expect(analysis.status).toBe('ready');
      expect(analysis.scores).toEqual({
        total: expect.closeTo(100, 8),
        criticalPower: expect.closeTo(100, 8),
        wPrime: expect.closeTo(0, 8),
        maximumPower: expect.closeTo(0, 8)
      });
    });

    it('matches the published Fig 4/5 supporting workbook for 20 minutes at 350 W', () => {
      // Kontro et al. (2026), S2 File, "TSS XSS calculator (Fig4-5)".
      const analysis = calculateThreeDimensionalStrain(
        new Array(1_200).fill(350),
        { criticalPowerWatts: 330, wPrimeJoules: 25_000, maximumPowerWatts: 1_200 },
        { maximumPowerAvailableExponent: 2, wPrimeBalanceTiming: 'after-sample' }
      );

      expect(analysis.status).toBe('ready');
      expect(analysis.scores!.total).toBeCloseTo(65.10695879597203, 8);
      expect(analysis.scores!.criticalPower).toBeCloseTo(61.386561150487935, 8);
      expect(analysis.scores!.wPrime).toBeCloseTo(3.634871262829307, 8);
      expect(analysis.scores!.maximumPower).toBeCloseTo(0.08552638265480715, 8);
      expect(analysis.minimumWPrimeBalanceJoules).toBeCloseTo(1_000, 8);
    });

    it('matches the reference main-model timing and caps strain when MPA is below observed power', () => {
      const fresh = calculateThreeDimensionalStrain([400], model);
      const depleted = calculateThreeDimensionalStrain([400], model, { initialWPrimeBalanceJoules: 0 });

      expect(fresh.scores!.total).toBeCloseTo(4 / 99, 12);
      expect(depleted.scores!.total).toBeCloseTo(4 / 27, 12);
      expect(depleted.scores!.total).toBeCloseTo(
        depleted.scores!.criticalPower + depleted.scores!.wPrime + depleted.scores!.maximumPower,
        12
      );
    });

    it('models W′ recovery below CP without inventing missing power samples', () => {
      const analysis = calculateThreeDimensionalStrain(
        [...new Array(100).fill(400), ...new Array(600).fill(200)],
        model
      );

      expect(analysis.status).toBe('ready');
      expect(analysis.minimumWPrimeBalanceJoules).toBeCloseTo(10_000, 8);
      expect(analysis.endingWPrimeBalanceJoules).toBeCloseTo(19_502.12931632136, 8);
    });

    it('supports duration-aware samples and a partially depleted initial W′ balance', () => {
      const analysis = calculateThreeDimensionalStrain([{ power: 300, durationSeconds: 2 }], model, {
        initialWPrimeBalanceJoules: 10_000
      });

      expect(analysis.status).toBe('ready');
      expect(analysis.scores!.total).toBeCloseTo(0.1388888888888889, 10);
      expect(analysis.endingWPrimeBalanceJoules).toBe(10_000);
    });

    it('accepts optional durations and recursively hydrated power values', () => {
      const analysis = calculateThreeDimensionalStrain([{ power: { getValue: () => '300' } }], model);

      expect(analysis).toMatchObject({
        status: 'ready',
        candidateDurationSeconds: 1,
        recordedDurationSeconds: 1,
        scores: { total: expect.closeTo(0.027777777777777776, 10) }
      });
    });

    it('keeps scores unavailable for missing, insufficient, or physically inconsistent power evidence', () => {
      expect(calculateThreeDimensionalStrain([], model)).toMatchObject({
        status: 'insufficient-evidence',
        reason: 'missing-power',
        scores: null
      });
      expect(calculateThreeDimensionalStrain([300, null, null, null], model)).toMatchObject({
        status: 'insufficient-evidence',
        reason: 'insufficient-coverage',
        scores: null,
        coverageRatio: 0.25
      });
      expect(calculateThreeDimensionalStrain([1_201], model)).toMatchObject({
        status: 'insufficient-evidence',
        reason: 'power-exceeds-maximum',
        scores: null
      });
    });

    it('rejects invalid models, options, allocations, and coefficients without throwing', () => {
      expect(calculateThreeDimensionalStrain([300], { ...model, wPrimeJoules: 0 })).toMatchObject({
        status: 'invalid-model',
        reason: 'invalid-model'
      });
      expect(calculateThreeDimensionalStrain([300], model, { minimumCoverageRatio: 2 })).toMatchObject({
        status: 'invalid-model',
        reason: 'invalid-model'
      });
      expect(calculateThreeDimensionalStrain([300], model, { wPrimeBalanceTiming: 'unknown' as never })).toMatchObject({
        status: 'invalid-model',
        reason: 'invalid-model'
      });
      expect(calculateThreeDimensionalStrain([300], model, { initialWPrimeBalanceJoules: 20_001 })).toMatchObject({
        status: 'invalid-model',
        reason: 'invalid-model'
      });
      expect(resolveThreeDimensionalPowerContributions(1_201, model)).toBeNull();
      expect(calculateMaximumPowerAvailable(20_001, model)).toBeNull();
      expect(calculateThreeDimensionalStrainCoefficient(400, 299, model)).toBeNull();
    });
  });

  describe('fitness-fatigue responses', () => {
    const parameters = {
      baseline: 200,
      fitnessGain: 2,
      fatigueGain: 3,
      fitnessTimeConstantDays: 4,
      fatigueTimeConstantDays: 2
    };

    it('uses independent exponential fitness and fatigue response windows', () => {
      const response = calculateImpulseResponse([100, 0, 0], parameters);

      expect(response).not.toBeNull();
      expect(response![0]).toEqual({
        load: 100,
        fitness: expect.closeTo(22.119921692859513, 10),
        fatigue: expect.closeTo(39.346934028736655, 10),
        performance: expect.closeTo(126.19904129950905, 10)
      });
      expect(response![2].fitness).toBeLessThan(response![1].fitness);
      expect(response![2].fatigue).toBeLessThan(response![1].fatigue);
    });

    it('runs independent CP, W′, and Pmax response series', () => {
      const response = calculateThreeDimensionalImpulseResponse(
        [
          { criticalPower: 100, wPrime: 0, maximumPower: 0 },
          { criticalPower: 0, wPrime: 20, maximumPower: 5 }
        ],
        { criticalPower: parameters, wPrime: parameters, maximumPower: parameters }
      );

      expect(response).not.toBeNull();
      expect(response![0].criticalPower.load).toBe(100);
      expect(response![0].wPrime.load).toBe(0);
      expect(response![1].wPrime.load).toBe(20);
      expect(response![1].maximumPower.load).toBe(5);
    });

    it('returns null rather than creating a response from malformed loads or parameters', () => {
      expect(calculateImpulseResponse([100, Number.NaN], parameters)).toBeNull();
      expect(calculateImpulseResponse([100], { ...parameters, fatigueTimeConstantDays: 0 })).toBeNull();
      expect(
        calculateThreeDimensionalImpulseResponse([{ criticalPower: 1, wPrime: -1, maximumPower: 2 }], {
          criticalPower: parameters,
          wPrime: parameters,
          maximumPower: parameters
        })
      ).toBeNull();
      expect(
        calculateThreeDimensionalImpulseResponse(
          [{ criticalPower: 1, wPrime: 2, maximumPower: 3 }],
          null as unknown as {
            criticalPower: typeof parameters;
            wPrime: typeof parameters;
            maximumPower: typeof parameters;
          }
        )
      ).toBeNull();
    });
  });
});
