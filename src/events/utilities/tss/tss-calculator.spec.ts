import { TssCalculator } from './tss-calculator';
import { TrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';
import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { DataStopAllEvent } from '../../../data/data.stop-all-event';

describe('TssCalculator', () => {
  it.each([15, 30, 3600])('uses the full eligible duration (%s seconds) with supplied NP', duration => {
    expect(TssCalculator.calculatePowerTss({ totalDurationWithoutPauses: duration,
      functionalThresholdPower: 250, normalizedPower: 250, samples: [] })?.trainingStressScore)
      .toBeCloseTo(100 * duration / 3600, 10);
  });
  it('keeps power TSS parity with Coggan NP/IF/TSS behavior', () => {
    const result = TssCalculator.calculatePowerTss({
      totalDurationWithoutPauses: 120,
      functionalThresholdPower: 250,
      normalizedPower: 200,
      samples: []
    });

    const expectedIntensityFactor = 200 / 250;
    const expectedTss = (100 * 120 * 200 * expectedIntensityFactor) / (250 * 3600);

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.POWER);
    expect(result!.normalizedPower).toBeCloseTo(200, 6);
    expect(result!.intensityFactor).toBeCloseTo(expectedIntensityFactor, 6);
    expect(result!.trainingStressScore).toBeCloseTo(expectedTss, 6);
  });

  it('accepts an explicitly supplied zero NP with valid FTP and duration', () => {
    expect(TssCalculator.calculatePowerTss({ totalDurationWithoutPauses: 3600,
      functionalThresholdPower: 250, normalizedPower: 0, samples: [] }))
      .toEqual({ calculationMethod: TrainingStressScoreMethod.POWER,
        trainingStressScore: 0, intensityFactor: 0, normalizedPower: 0 });
  });

  it.each([undefined, NaN, Infinity, -1])('rejects missing or invalid NP %s rather than treating it as zero', normalizedPower => {
    expect(TssCalculator.calculatePowerTss({ totalDurationWithoutPauses: 3600,
      functionalThresholdPower: 250, normalizedPower, samples: [] })).toBeNull();
  });

  it.each([0, -1, NaN, Infinity])('still requires valid FTP and duration for zero NP (%s)', invalid => {
    expect(TssCalculator.calculatePowerTss({ totalDurationWithoutPauses: 3600,
      functionalThresholdPower: invalid, normalizedPower: 0, samples: [] })).toBeNull();
    expect(TssCalculator.calculatePowerTss({ totalDurationWithoutPauses: invalid,
      functionalThresholdPower: 250, normalizedPower: 0, samples: [] })).toBeNull();
  });

  it('requires positive eligible activity duration even when HR samples are present', () => {
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 0,
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165,
      samples: [{ duration: 0, hr: 165 }, { duration: 3600, hr: 165 }] })).toBeNull();
  });

  it.each([0, 600, 3600])('requires an observed HR interval, not one reading at %s', duration => {
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 3600,
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165,
      samples: [{ duration, hr: 165 }] })).toBeNull();
  });

  it.each([0, -1, NaN, Infinity, null, undefined])('retains invalid HR %s as a break between intervals', invalid => {
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 3600,
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165,
      samples: [{ duration: 0, hr: 165 }, { duration: 1800, hr: invalid }, { duration: 3600, hr: 165 }] })).toBeNull();
  });

  it('keeps ordinary sparse intervals without a gap cutoff or pre-first extrapolation', () => {
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 3600,
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165,
      samples: [{ duration: 600, hr: 165 }, { duration: 3000, hr: 165 }] })?.trainingStressScore)
      .toBeCloseTo(100 * 2400 / 3600, 10);
  });

  it('distinguishes observed resting-HR zero from duplicate timestamps with no duration', () => {
    const input = { totalDurationWithoutPauses: 3600, maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 };
    expect(TssCalculator.calculateHrTss({ ...input, samples: [{ duration: 0, hr: 55 }, { duration: 3600, hr: 55 }] })?.trainingStressScore).toBe(0);
    expect(TssCalculator.calculateHrTss({ ...input, samples: [{ duration: 600, hr: 165 }, { duration: 600, hr: 165 }] })).toBeNull();
  });

  it('calculates HR TSS using Banister TRIMP when max/rest HR exist', () => {
    const hr = 170;
    const samples = Array.from({ length: 3600 }, (_value, index) => ({ duration: index + 1, hr }));

    const result = TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 170,
      maxHeartRate: 190,
      restingHeartRate: 50,
      samples
    });

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.HR);
    expect(result!.trainingStressScore).toBeCloseTo(100, 1);
  });

  it('uses gender coefficient in Banister TRIMP and defaults unknown to male coefficient', () => {
    const samples = Array.from({ length: 3600 }, (_value, index) => ({ duration: index + 1, hr: 160 }));

    const male = TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 170,
      maxHeartRate: 190,
      restingHeartRate: 50,
      gender: 'male',
      samples
    });

    const female = TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 170,
      maxHeartRate: 190,
      restingHeartRate: 50,
      gender: 'female',
      samples
    });

    const unknown = TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 170,
      maxHeartRate: 190,
      restingHeartRate: 50,
      samples
    });

    expect(male).toBeTruthy();
    expect(female).toBeTruthy();
    expect(unknown).toBeTruthy();
    expect(female!.trainingStressScore).toBeGreaterThan(male!.trainingStressScore);
    expect(unknown!.trainingStressScore).toBeCloseTo(male!.trainingStressScore, 6);
  });

  it.each([
    { maxHeartRate: 190, lactateThresholdHR: 165 },
    { restingHeartRate: 55, lactateThresholdHR: 165 },
    { maxHeartRate: 190, restingHeartRate: 55 },
    { maxHeartRate: 190, restingHeartRate: 165, lactateThresholdHR: 165 },
    { maxHeartRate: 165, restingHeartRate: 55, lactateThresholdHR: 165 },
    { maxHeartRate: Infinity, restingHeartRate: 55, lactateThresholdHR: 165 }
  ])('requires complete valid calibration: %j', calibration => {
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 3600,
      samples: [{ duration: 3600, hr: 82 }], ...calibration })).toBeNull();
  });

  it('gives approximately 7.6 for the synthetic recovery walk', () => {
    const samples = Array.from({length: 3601}, (_, duration) => ({ duration,
      hr: duration < 1830 ? 78 : duration < 3600 ? 86 : 100 }));
    expect(TssCalculator.calculateHrTss({ totalDurationWithoutPauses: 3600, samples,
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 })?.trainingStressScore).toBeCloseTo(7.6, 1);
  });

  it('calculates pace TSS with Minetti grade adjustment and threshold normalization', () => {
    const samples = Array.from({ length: 3600 }, (_value, index) => ({
      duration: index + 1,
      speed: 3,
      grade: 0
    }));

    const result = TssCalculator.calculatePaceTss({
      totalDurationWithoutPauses: 3600,
      functionalThresholdPace: 3,
      samples
    });

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.PACE);
    expect(result!.intensityFactor).toBeCloseTo(1, 1);
    expect(result!.trainingStressScore).toBeCloseTo(100, 1);
  });

  it('converts uphill and downhill speeds to equal-energy flat speeds', () => {
    const uphill = TssCalculator.calculatePaceTss({
      totalDurationWithoutPauses: 1200,
      functionalThresholdPace: 3,
      samples: Array.from({ length: 1200 }, (_value, index) => ({ duration: index + 1, speed: 3, grade: 0.1 }))
    });

    const downhill = TssCalculator.calculatePaceTss({
      totalDurationWithoutPauses: 1200,
      functionalThresholdPace: 3,
      samples: Array.from({ length: 1200 }, (_value, index) => ({ duration: index + 1, speed: 3, grade: -0.1 }))
    });

    expect(uphill).toBeTruthy();
    expect(downhill).toBeTruthy();
    expect(uphill!.averageGradeAdjustedPace).toBeCloseTo(3 * 5.968214 / 3.6, 8);
    expect(downhill!.averageGradeAdjustedPace).toBeCloseTo(3 * 2.151706 / 3.6, 8);
    expect(uphill!.trainingStressScore).toBeCloseTo(274.8424255385494 / 3, 8);
    expect(downhill!.trainingStressScore).toBeCloseTo(35.724064123734564 / 3, 8);
  });

  it('retains stationary seconds regardless of their position and does not require grade for zero speed', () => {
    const speeds = [...Array(1800).fill(0), ...Array(1800).fill(3)];
    const calculate = (values: number[]) => TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: 3600,
      functionalThresholdPace: 3, samples: values.map((speed, duration) => ({ duration, speed,
        grade: speed === 0 ? undefined : 0 })) });
    const means = speeds.slice(29).map((_, index) =>
      speeds.slice(index, index + 30).reduce((sum, speed) => sum + speed, 0) / 30);
    const expected = 100 * Math.sqrt(means.reduce((sum, speed) => sum + (speed / 3) ** 4, 0) / means.length);
    expect(calculate(speeds)?.trainingStressScore).toBeCloseTo(expected, 8);
    expect(calculate(speeds.slice().reverse())?.trainingStressScore).toBeCloseTo(expected, 8);
    expect(calculate(Array(3600).fill(0))).toMatchObject({ trainingStressScore: 0, intensityFactor: 0 });
  });

  it.each([0, 300, 10000])('uses active duration rather than the final sample timestamp (offset %s)', offset => {
    const result = TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: 2400,
      functionalThresholdPace: 3,
      samples: Array.from({ length: 120 }, (_, index) => ({ duration: offset + index, speed: 3, grade: 0 })) });
    expect(result?.trainingStressScore).toBeCloseTo(100 * 2400 / 3600, 10);
  });

  it.each([DataStopEvent, DataStopAllEvent])('excludes pause readings and never joins windows across %s', Stop => {
    const samples = Array.from({ length: 3600 }, (_, duration) => ({ duration,
      speed: duration >= 1200 && duration < 2400 ? 30 : 3, grade: 0 }));
    const timerEvents = [new DataStartEvent(0), new Stop(1200), new DataStartEvent(2400), new Stop(3600)];
    for (const records of [samples, samples.filter(sample => sample.duration < 1200 || sample.duration >= 2400)]) {
      expect(TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: 2400,
        functionalThresholdPace: 3, samples: records, timerEvents })?.trainingStressScore)
        .toBeCloseTo(100 * 2400 / 3600, 10);
    }
    expect(TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: 40, functionalThresholdPace: 3,
      samples: Array.from({ length: 40 }, (_, duration) => ({ duration, speed: 3, grade: 0 })),
      timerEvents: [new Stop(20), new DataStartEvent(20)] })).toBeNull();
  });

  it.each([NaN, Infinity, -1, null, undefined])('breaks pace windows at invalid speed %s', speed => {
    const samples = Array.from({ length: 41 }, (_, duration) => ({ duration,
      speed: duration === 20 ? speed : 3, grade: 0 }));
    expect(TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: 41,
      functionalThresholdPace: 3, samples })).toBeNull();
  });

  it('requires 30 consecutive one-second samples and valid active duration', () => {
    const samples = Array.from({ length: 30 }, (_, duration) => ({ duration, speed: 3, grade: 0 }));
    const calculate = (records: typeof samples) => TssCalculator.calculatePaceTss({
      totalDurationWithoutPauses: 30, functionalThresholdPace: 3, samples: records });
    expect(calculate(samples)?.trainingStressScore).toBeCloseTo(100 * 30 / 3600, 10);
    expect(calculate(samples.slice(1))).toBeNull();
    expect(calculate([{ duration: 0, speed: 3, grade: 0 }, { duration: 3600, speed: 3, grade: 0 }])).toBeNull();
    expect(calculate(samples.map(sample => ({ ...sample, duration: sample.duration * 2 })))).toBeNull();
    expect(calculate(samples.map(sample => ({ ...sample, duration: sample.duration > 14 ? sample.duration + 10 : sample.duration })))).toBeNull();
    for (const duration of [0, -1, NaN, Infinity]) {
      expect(TssCalculator.calculatePaceTss({ totalDurationWithoutPauses: duration,
        functionalThresholdPace: 3, samples })).toBeNull();
    }
  });

  it('calculates swim TSS from CSS/threshold speed with IF^3', () => {
    const result = TssCalculator.calculateSwimTss({
      totalDurationWithoutPauses: 3600,
      swimSpeed: 1.2,
      thresholdSwimSpeed: 1.2,
      samples: []
    });

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.SWIM_PACE);
    expect(result!.intensityFactor).toBeCloseTo(1, 6);
    expect(result!.trainingStressScore).toBeCloseTo(100, 6);
  });

  it('calculates normalized MET TSS and defaults thresholdMet to 10', () => {
    const estimatedMet = TssCalculator.estimateMetScore(600, 75, 3600);
    const result = TssCalculator.calculateMetTss({
      totalDurationWithoutPauses: 3600,
      metScore: estimatedMet,
      samples: []
    });

    expect(estimatedMet).toBeCloseTo(8, 6);
    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.MET);
    expect(result!.intensityFactor).toBeCloseTo(0.8, 6);
    expect(result!.trainingStressScore).toBeCloseTo(64, 6);
  });

  it('supports thresholdMet override for normalized MET TSS', () => {
    const result = TssCalculator.calculateMetTss({
      totalDurationWithoutPauses: 3600,
      metScore: 12,
      thresholdMet: 12,
      samples: []
    });

    expect(result).toBeTruthy();
    expect(result!.trainingStressScore).toBeCloseTo(100, 6);
  });

  it('returns null when calculated TSS is outside valid range', () => {
    const result = TssCalculator.calculateMetTss({
      totalDurationWithoutPauses: 36000,
      metScore: 200,
      thresholdMet: 1,
      samples: []
    });

    expect(result).toBeNull();
  });
});
