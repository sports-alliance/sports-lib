import * as fs from 'fs';
import * as path from 'path';
import { TssCalculator } from './tss-calculator';
import { TrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';

describe('TssCalculator', () => {
  it('keeps power TSS parity with Coggan NP/IF/TSS behavior', () => {
    const result = TssCalculator.calculatePowerTss({
      totalDurationWithoutPauses: 120,
      functionalThresholdPower: 250,
      normalizedPower: 200,
      samples: []
    });

    const expectedIntensityFactor = 200 / 250;
    const expectedTss = (100 * (120 - 29) * 200 * expectedIntensityFactor) / (250 * 3600);

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.POWER);
    expect(result!.normalizedPower).toBeCloseTo(200, 6);
    expect(result!.intensityFactor).toBeCloseTo(expectedIntensityFactor, 6);
    expect(result!.trainingStressScore).toBeCloseTo(expectedTss, 6);
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

  it('falls back to Edwards TRIMP when resting HR is missing', () => {
    const samples = Array.from({ length: 3600 }, (_value, index) => ({ duration: index + 1, hr: 160 }));

    const result = TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 160,
      maxHeartRate: 190,
      samples
    });

    expect(result).toBeTruthy();
    expect(result!.calculationMethod).toBe(TrainingStressScoreMethod.HR);
    expect(result!.trainingStressScore).toBeCloseTo(100, 1);
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

  it('produces lower adjusted load uphill than downhill for same raw speed', () => {
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
    expect(downhill!.trainingStressScore).toBeGreaterThan(uphill!.trainingStressScore);
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

  it('does not contain STT lookup arrays/constants in the calculator implementation', () => {
    const source = fs.readFileSync(path.join(__dirname, 'tss-calculator.ts'), 'utf-8');

    expect(source.includes('SWIM_REF_SPEED_LIST')).toBe(false);
    expect(source.includes('SWIM_REF_THRESHOLD_SPEED_LIST')).toBe(false);
    expect(source.includes('HR_TSS_WEIGHTS')).toBe(false);
    expect(source.includes('0.5656')).toBe(false);
    expect(source.includes('4.3635')).toBe(false);
  });
});
