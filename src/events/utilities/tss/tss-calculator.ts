import { TrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';

export interface TssSample {
  duration: number;
  power?: number | null;
  speed?: number | null;
  verticalSpeed?: number | null;
  grade?: number | null;
  hr?: number | null;
}

export interface TssInput {
  totalDurationWithoutPauses: number;
  functionalThresholdPower?: number;
  normalizedPower?: number;
  functionalThresholdPace?: number;
  lactateThresholdHR?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  swimSpeed?: number;
  thresholdSwimSpeed?: number;
  metScore?: number;
  thresholdMet?: number;
  gender?: string;
  samples: TssSample[];
}

export interface TssCalculationResult {
  calculationMethod:
    | typeof TrainingStressScoreMethod.POWER
    | typeof TrainingStressScoreMethod.HR
    | typeof TrainingStressScoreMethod.PACE
    | typeof TrainingStressScoreMethod.SWIM_PACE
    | typeof TrainingStressScoreMethod.MET;
  trainingStressScore: number;
  intensityFactor?: number;
  normalizedPower?: number;
  averageGradeAdjustedPace?: number;
}

const BANISTER_A = 0.64;
const BANISTER_K_MALE_OR_UNKNOWN = 1.92;
const BANISTER_K_FEMALE = 1.67;
const DEFAULT_HR_THRESHOLD_RATIO = 0.85;
const DEFAULT_MET_THRESHOLD = 10;

export class TssCalculator {
  private static readonly TSS_MIN = 0;
  private static readonly TSS_MAX = 9999;

  public static estimateMetScore(energyConsumption: number, userWeight: number, totalDurationWithoutPauses: number): number {
    if (energyConsumption <= 0 || userWeight <= 0 || totalDurationWithoutPauses <= 0) {
      return 0;
    }
    return (3600 * energyConsumption) / (userWeight * totalDurationWithoutPauses);
  }

  public static calculatePowerTss(input: TssInput): TssCalculationResult | null {
    const functionalThresholdPower = this.positive(input.functionalThresholdPower);
    const normalizedPower = this.positive(input.normalizedPower);
    const totalDurationWithoutPauses = this.positive(input.totalDurationWithoutPauses);
    if (functionalThresholdPower === null || normalizedPower === null || totalDurationWithoutPauses === null) {
      return null;
    }

    try {
      const intensityFactor = normalizedPower / functionalThresholdPower;
      const effectiveDuration = Math.max(totalDurationWithoutPauses - 29, 0);
      const tss =
        (100 * effectiveDuration * normalizedPower * intensityFactor) / (functionalThresholdPower * 3600);

      return this.applyRangeCheck({
        calculationMethod: TrainingStressScoreMethod.POWER,
        trainingStressScore: tss,
        intensityFactor,
        normalizedPower
      });
    } catch {
      return null;
    }
  }

  public static calculatePaceTss(input: TssInput): TssCalculationResult | null {
    const thresholdSpeed = this.positive(input.functionalThresholdPace);
    if (thresholdSpeed === null) {
      return null;
    }

    const samples = input.samples
      .filter(sample => Number.isFinite(sample.speed))
      .sort((left, right) => left.duration - right.duration);
    if (!samples.length) {
      return null;
    }

    try {
      const adjustedSpeedSamples = samples
        .map(sample => {
          const speed = sample.speed as number;
          if (speed <= 0) {
            return null;
          }

          const grade = this.resolveSampleGrade(sample, speed);
          if (grade === null) {
            return null;
          }

          const clampedGrade = this.clamp(grade, -0.45, 0.45);
          const cost = this.runningCostMinetti(clampedGrade);
          if (!Number.isFinite(cost) || cost <= 0) {
            return null;
          }

          const adjustedSpeed = speed * (3.6 / cost);
          if (!Number.isFinite(adjustedSpeed) || adjustedSpeed < 0) {
            return null;
          }

          return {
            duration: sample.duration,
            adjustedSpeed
          };
        })
        .filter((sample): sample is { duration: number; adjustedSpeed: number } => sample !== null);

      if (!adjustedSpeedSamples.length) {
        return null;
      }

      const adjusted30sList = adjustedSpeedSamples.map((sample, index) => {
        if (sample.duration < 30) {
          return null;
        }

        const index30SecAgo = Math.max(
          0,
          adjustedSpeedSamples.slice(0, index).findIndex(prev => sample.duration - prev.duration < 30)
        );
        const mean = this.average(adjustedSpeedSamples.slice(index30SecAgo, index + 1).map(item => item.adjustedSpeed));
        return Number.isNaN(mean) ? null : mean;
      });

      let roll4Sum = 0;
      let roll4Count = 0;
      adjusted30sList.forEach(value => {
        if (value !== null) {
          roll4Sum += Math.pow(value, 4);
          roll4Count += 1;
        }
      });
      if (roll4Count === 0) {
        return null;
      }

      const normalizedGradedSpeed = Math.pow(roll4Sum / roll4Count, 0.25);
      const intensityFactor = normalizedGradedSpeed / thresholdSpeed;
      const durationSeconds = adjustedSpeedSamples[adjustedSpeedSamples.length - 1].duration;
      const tss = 100 * (durationSeconds / 3600) * Math.pow(intensityFactor, 2);

      return this.applyRangeCheck({
        calculationMethod: TrainingStressScoreMethod.PACE,
        trainingStressScore: tss,
        intensityFactor,
        averageGradeAdjustedPace: normalizedGradedSpeed
      });
    } catch {
      return null;
    }
  }

  public static calculateHrTss(input: TssInput): TssCalculationResult | null {
    const maxHeartRate = this.positive(input.maxHeartRate);
    if (maxHeartRate === null) {
      return null;
    }

    const samples = input.samples
      .filter(sample => Number.isFinite(sample.hr) && (sample.hr as number) > 0)
      .sort((left, right) => left.duration - right.duration);
    if (!samples.length) {
      return null;
    }

    const restingHeartRate = this.positive(input.restingHeartRate);
    const banister = this.calculateBanisterHrTss(samples, maxHeartRate, restingHeartRate, input.lactateThresholdHR, input.gender);
    if (banister) {
      return banister;
    }

    return this.calculateEdwardsHrTss(samples, maxHeartRate, input.lactateThresholdHR);
  }

  public static calculateSwimTss(input: TssInput): TssCalculationResult | null {
    const swimSpeed = this.positive(input.swimSpeed);
    const thresholdSwimSpeed = this.positive(input.thresholdSwimSpeed);
    const duration = this.positive(input.totalDurationWithoutPauses);
    if (swimSpeed === null || thresholdSwimSpeed === null || duration === null) {
      return null;
    }

    try {
      const intensityFactor = swimSpeed / thresholdSwimSpeed;
      const tss = 100 * (duration / 3600) * Math.pow(intensityFactor, 3);

      return this.applyRangeCheck({
        calculationMethod: TrainingStressScoreMethod.SWIM_PACE,
        trainingStressScore: tss,
        intensityFactor
      });
    } catch {
      return null;
    }
  }

  public static calculateMetTss(input: TssInput): TssCalculationResult | null {
    const metScore = this.positive(input.metScore);
    const duration = this.positive(input.totalDurationWithoutPauses);
    const thresholdMet = this.positive(input.thresholdMet) ?? DEFAULT_MET_THRESHOLD;
    if (metScore === null || duration === null || thresholdMet <= 0) {
      return null;
    }

    try {
      const intensityFactor = metScore / thresholdMet;
      const tss = 100 * (duration / 3600) * Math.pow(intensityFactor, 2);

      return this.applyRangeCheck({
        calculationMethod: TrainingStressScoreMethod.MET,
        trainingStressScore: tss,
        intensityFactor
      });
    } catch {
      return null;
    }
  }

  private static calculateBanisterHrTss(
    samples: TssSample[],
    maxHeartRate: number,
    restingHeartRate: number | null,
    lactateThresholdHR?: number,
    gender?: string
  ): TssCalculationResult | null {
    if (restingHeartRate === null || maxHeartRate <= restingHeartRate) {
      return null;
    }

    const k = this.isFemale(gender) ? BANISTER_K_FEMALE : BANISTER_K_MALE_OR_UNKNOWN;
    const sessionLoad = this.accumulateSampleLoad(samples, sample => {
      const hr = sample.hr as number;
      const dHrr = this.clamp((hr - restingHeartRate) / (maxHeartRate - restingHeartRate), 0, 1);
      return dHrr * BANISTER_A * Math.exp(k * dHrr);
    });

    const thresholdDhr = this.resolveBanisterThresholdDhr(
      maxHeartRate,
      restingHeartRate,
      this.positive(lactateThresholdHR)
    );
    const thresholdHourLoad = 60 * thresholdDhr * BANISTER_A * Math.exp(k * thresholdDhr);
    if (!Number.isFinite(sessionLoad) || !Number.isFinite(thresholdHourLoad) || thresholdHourLoad <= 0) {
      return null;
    }

    return this.applyRangeCheck({
      calculationMethod: TrainingStressScoreMethod.HR,
      trainingStressScore: (100 * sessionLoad) / thresholdHourLoad
    });
  }

  private static calculateEdwardsHrTss(
    samples: TssSample[],
    maxHeartRate: number,
    lactateThresholdHR?: number
  ): TssCalculationResult | null {
    if (maxHeartRate <= 0) {
      return null;
    }

    const sessionLoad = this.accumulateSampleLoad(samples, sample => {
      const hr = sample.hr as number;
      return this.edwardsZoneWeight(hr / maxHeartRate);
    });

    const thresholdRatio = this.resolveEdwardsThresholdRatio(maxHeartRate, this.positive(lactateThresholdHR));
    const thresholdWeight = this.edwardsZoneWeight(thresholdRatio);
    const thresholdHourLoad = 60 * thresholdWeight;
    if (!Number.isFinite(sessionLoad) || !Number.isFinite(thresholdHourLoad) || thresholdHourLoad <= 0) {
      return null;
    }

    return this.applyRangeCheck({
      calculationMethod: TrainingStressScoreMethod.HR,
      trainingStressScore: (100 * sessionLoad) / thresholdHourLoad
    });
  }

  private static accumulateSampleLoad(samples: TssSample[], loadPerMinuteForSample: (sample: TssSample) => number): number {
    let previousDuration = 0;
    let sum = 0;

    samples.forEach(sample => {
      const dtSeconds = sample.duration - previousDuration;
      previousDuration = sample.duration;

      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
        return;
      }

      const loadPerMinute = loadPerMinuteForSample(sample);
      if (!Number.isFinite(loadPerMinute) || loadPerMinute < 0) {
        return;
      }

      sum += loadPerMinute * (dtSeconds / 60);
    });

    return sum;
  }

  private static resolveBanisterThresholdDhr(
    maxHeartRate: number,
    restingHeartRate: number,
    lactateThresholdHR: number | null
  ): number {
    if (lactateThresholdHR !== null && maxHeartRate > restingHeartRate) {
      return this.clamp((lactateThresholdHR - restingHeartRate) / (maxHeartRate - restingHeartRate), 0, 1);
    }
    return DEFAULT_HR_THRESHOLD_RATIO;
  }

  private static resolveEdwardsThresholdRatio(maxHeartRate: number, lactateThresholdHR: number | null): number {
    if (lactateThresholdHR !== null && maxHeartRate > 0) {
      return this.clamp(lactateThresholdHR / maxHeartRate, 0, 1);
    }
    return DEFAULT_HR_THRESHOLD_RATIO;
  }

  private static edwardsZoneWeight(hrRatio: number): number {
    const percentage = hrRatio * 100;
    if (!Number.isFinite(percentage) || percentage < 50) {
      return 0;
    }
    if (percentage < 60) {
      return 1;
    }
    if (percentage < 70) {
      return 2;
    }
    if (percentage < 80) {
      return 3;
    }
    if (percentage < 90) {
      return 4;
    }
    return 5;
  }

  private static resolveSampleGrade(sample: TssSample, speed: number): number | null {
    if (Number.isFinite(sample.grade)) {
      return sample.grade as number;
    }

    if (Number.isFinite(sample.verticalSpeed) && speed > 0) {
      return (sample.verticalSpeed as number) / speed;
    }

    return null;
  }

  private static runningCostMinetti(grade: number): number {
    return (
      155.4 * Math.pow(grade, 5) -
      30.4 * Math.pow(grade, 4) -
      43.3 * Math.pow(grade, 3) +
      46.3 * Math.pow(grade, 2) +
      19.5 * grade +
      3.6
    );
  }

  private static isFemale(gender?: string): boolean {
    if (!gender) {
      return false;
    }

    const normalized = gender.trim().toLowerCase();
    return normalized === 'f' || normalized === 'female' || normalized === 'woman';
  }

  private static applyRangeCheck(result: TssCalculationResult): TssCalculationResult | null {
    if (
      !Number.isFinite(result.trainingStressScore) ||
      result.trainingStressScore < this.TSS_MIN ||
      result.trainingStressScore > this.TSS_MAX
    ) {
      return null;
    }
    return result;
  }

  private static average(values: number[]): number {
    if (!values.length) {
      return NaN;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private static positive(value: number | null | undefined): number | null {
    return Number.isFinite(value) && (value as number) > 0 ? (value as number) : null;
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
