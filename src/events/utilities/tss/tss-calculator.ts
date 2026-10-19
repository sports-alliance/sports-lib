import { TrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';
import type { DataEvent } from '../../../data/data.event';
import { calculateNormalizedPower } from '../normalized-power';
import type { TrainingStressScoreHrAlgorithm } from './tss-evaluation';

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
  /** Explicit timer boundaries on the sample clock; used by rolling pace calculation. */
  timerEvents?: DataEvent[];
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
  hrAlgorithm?: TrainingStressScoreHrAlgorithm;
}

const BANISTER_A = 0.64;
const BANISTER_K_MALE_OR_UNKNOWN = 1.92;
const BANISTER_K_FEMALE = 1.67;
const DEFAULT_MET_THRESHOLD = 10;

export class TssCalculator {
  private static readonly TSS_MIN = 0;
  private static readonly TSS_MAX = 9999;

  public static estimateMetScore(energyConsumption: number, userWeight: number, totalDurationWithoutPauses: number): number {
    if (![energyConsumption, userWeight, totalDurationWithoutPauses].every(value => Number.isFinite(value) && value > 0)) {
      return 0;
    }
    return (3600 * energyConsumption) / (userWeight * totalDurationWithoutPauses);
  }

  public static calculatePowerTss(input: TssInput): TssCalculationResult | null {
    const functionalThresholdPower = this.positive(input.functionalThresholdPower);
    const normalizedPower = input.normalizedPower === 0 ? 0 : this.positive(input.normalizedPower);
    const totalDurationWithoutPauses = this.positive(input.totalDurationWithoutPauses);
    if (functionalThresholdPower === null || normalizedPower === null || totalDurationWithoutPauses === null) {
      return null;
    }

    try {
      const intensityFactor = normalizedPower / functionalThresholdPower;
      const tss =
        (100 * totalDurationWithoutPauses * normalizedPower * intensityFactor) / (functionalThresholdPower * 3600);

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
    const durationSeconds = this.positive(input.totalDurationWithoutPauses);
    if (thresholdSpeed === null || durationSeconds === null) {
      return null;
    }

    const samples = input.samples.slice().sort((left, right) => left.duration - right.duration);
    const adjustedSpeed = samples.map(sample => {
      const speed = sample.speed;
      if (!Number.isFinite(speed) || (speed as number) < 0) return NaN;
      // A recorded stationary second remains zero even when grade is unavailable.
      if (speed === 0) return 0;
      const grade = this.resolveSampleGrade(sample, speed as number);
      if (grade === null) return NaN;
      const cost = this.runningCostMinetti(this.clamp(grade, -0.45, 0.45));
      // Cost is energy per distance. Equal-energy flat speed increases with cost.
      return Number.isFinite(cost) && cost > 0 ? (speed as number) * cost / 3.6 : NaN;
    });
    // Pace uses the same fourth-power normalization on the one-second grid as NP:
    // retain zeroes, require complete windows and restart at gaps or timer pauses.
    const normalizedGradedSpeed = calculateNormalizedPower(adjustedSpeed,
      samples.map(sample => sample.duration), input.timerEvents);
    if (!Number.isFinite(normalizedGradedSpeed) || normalizedGradedSpeed < 0) return null;

    const intensityFactor = normalizedGradedSpeed / thresholdSpeed;
    return this.applyRangeCheck({
      calculationMethod: TrainingStressScoreMethod.PACE,
      trainingStressScore: 100 * (durationSeconds / 3600) * Math.pow(intensityFactor, 2),
      intensityFactor,
      averageGradeAdjustedPace: normalizedGradedSpeed
    });
  }

  public static calculateHrTss(input: TssInput): TssCalculationResult | null {
    if (this.positive(input.totalDurationWithoutPauses) === null) return null;
    const maxHeartRate = this.positive(input.maxHeartRate);
    const restingHeartRate = this.positive(input.restingHeartRate);
    const threshold = this.positive(input.lactateThresholdHR);
    if (maxHeartRate === null || restingHeartRate === null || threshold === null ||
        !(restingHeartRate < threshold && threshold < maxHeartRate)) {
      return null;
    }
    const samples = input.samples
      .filter(sample => Number.isFinite(sample.duration) && sample.duration >= 0)
      .sort((left, right) => left.duration - right.duration);
    if (!samples.length) {
      return null;
    }
    return this.calculateBanisterHrTss(samples, maxHeartRate, restingHeartRate, threshold, input.gender);
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

  /** Existing sports-lib threshold bands, integrated only over observed HR intervals.
   * Sport eligibility and file-calibration validation belong to the activity evaluator.
   * Exactly 100% of threshold earns 100 TSS/hour; other exact boundaries retain the lower band.
   * No rest/max or threshold is inferred.
   */
  public static calculateThresholdHrTss(input: TssInput): TssCalculationResult | null {
    const threshold = this.positive(input.lactateThresholdHR);
    if (threshold === null || this.positive(input.totalDurationWithoutPauses) === null) return null;
    const limits = [0, 0.27, 0.54, 0.82, 0.855, 0.89, 0.94, 1, 1.03, 1.06];
    const rates = [20, 30, 40, 50, 60, 70, 80, 100, 120, 140];
    const samples = input.samples.filter(sample => Number.isFinite(sample.duration) && sample.duration >= 0)
      .sort((left, right) => left.duration - right.duration);
    const score = this.accumulateSampleLoad(samples, sample => {
      let band = 0;
      const hr = sample.hr as number;
      for (let index = 1; index < limits.length; index++) {
        if (hr > limits[index] * threshold || (limits[index] === 1 && hr === threshold)) band = index;
      }
      return rates[band] / 60;
    });
    return this.applyRangeCheck({ calculationMethod: TrainingStressScoreMethod.HR,
      trainingStressScore: score, hrAlgorithm: 'THRESHOLD' });
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

    const thresholdDhr = ((lactateThresholdHR as number) - restingHeartRate) / (maxHeartRate - restingHeartRate);
    const thresholdHourLoad = 60 * thresholdDhr * BANISTER_A * Math.exp(k * thresholdDhr);
    if (!Number.isFinite(sessionLoad) || !Number.isFinite(thresholdHourLoad) || thresholdHourLoad <= 0) {
      return null;
    }

    return this.applyRangeCheck({
      calculationMethod: TrainingStressScoreMethod.HR,
      hrAlgorithm: 'BANISTER',
      trainingStressScore: (100 * sessionLoad) / thresholdHourLoad
    });
  }

  private static accumulateSampleLoad(samples: TssSample[], loadPerMinuteForSample: (sample: TssSample) => number): number {
    let previousDuration: number | null = null;
    let sum = 0, coveredSeconds = 0;

    samples.forEach(sample => {
      // An invalid observation is a boundary, not a zero workload or a gap to
      // bridge. The first valid reading starts coverage without extrapolation.
      if (!Number.isFinite(sample.hr) || (sample.hr as number) <= 0) {
        previousDuration = null;
        return;
      }
      const dtSeconds = previousDuration === null ? 0 : sample.duration - previousDuration;
      previousDuration = sample.duration;
      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
      const loadPerMinute = loadPerMinuteForSample(sample);
      if (!Number.isFinite(loadPerMinute) || loadPerMinute < 0) return;
      sum += loadPerMinute * (dtSeconds / 60);
      coveredSeconds += dtSeconds;
    });

    // Fully observed resting-HR intervals legitimately sum to zero; absent
    // positive-duration coverage is unavailable instead.
    return coveredSeconds > 0 ? sum : NaN;
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

  private static positive(value: number | null | undefined): number | null {
    return Number.isFinite(value) && (value as number) > 0 ? (value as number) : null;
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
