import type { TrainingStressScoreMethodType } from '../../../data/data.training-stress-score-method';
import type { ActivityInterface } from '../../../activities/activity.interface';

/** A requested calculation policy. Imported scores always take precedence. */
export type TrainingStressScorePreference = 'AUTOMATIC' | 'HR' | 'MET' | 'SWIM_PACE' | 'RUNNING_PACE';

/** HR formula used by a calculated HR evaluation; absent on legacy evaluations. */
export type TrainingStressScoreHrAlgorithm = 'BANISTER' | 'THRESHOLD';

/** Independent consumer calibration, used only when original-file calibration is unavailable.
 * These inputs never become recorded activity statistics or replace imported TSS.
 */
export interface TrainingStressScoreCalibration {
  /** Independent FTP in watts. */
  functionalThresholdPower?: number;
  /** Independent lactate-threshold heart rate in bpm; uses the threshold-HR estimate. */
  lactateThresholdHR?: number;
  /** Independent resting HR in bpm. Used for Banister only with an explicit formula choice and a complete tuple. */
  restingHeartRate?: number;
  /** Independent maximum HR in bpm; never the activity's peak. */
  maxHeartRate?: number;
  /** Omit to retain existing file-first/threshold-only behavior, even when consumer rest/max are supplied. */
  hrAlgorithm?: TrainingStressScoreHrAlgorithm;
  /** Independent CSS in metres/second. */
  thresholdSwimSpeed?: number;
  /** Independent running threshold speed in metres/second, never workout-average pace. */
  thresholdRunningSpeed?: number;
  /** Body mass in kilograms, used only when the activity has no valid file weight. */
  bodyMassKg?: number;
}

/** Whether a complete, independent HR tuple can calibrate Banister. Partial tuples cannot. */
export function isValidTrainingStressScoreHrCalibration(
  calibration: Pick<TrainingStressScoreCalibration, 'restingHeartRate' | 'lactateThresholdHR' | 'maxHeartRate'>,
): boolean {
  const { restingHeartRate: rest, lactateThresholdHR: threshold, maxHeartRate: max } = calibration;
  return [rest, threshold, max].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0)
    && rest! < threshold! && threshold! < max!;
}

/**
 * Stable machine-readable diagnostics, suitable for a consumer's localized explanation.
 * `invalid-hr-calibration` includes inconsistent file settings, such as a scoped threshold
 * below the lowest boundary of the recognized six-boundary 50–100% HRR pattern.
 */
export type TrainingStressScoreReason =
  | 'imported-score'
  | 'unsupported-sport'
  | 'missing-hr-calibration'
  | 'threshold-hr-fallback'
  | 'requested-hr-algorithm-unavailable'
  | 'invalid-hr-calibration'
  | 'ambiguous-hr-calibration'
  | 'missing-hr-samples'
  | 'missing-met-inputs'
  | 'missing-power-inputs'
  | 'missing-pace-inputs'
  | 'missing-swim-threshold'
  | 'calculation-unavailable';

/** A resolved policy; null is unavailable, while zero is a valid score. */
export interface TrainingStressScoreEvaluation {
  preference: TrainingStressScorePreference;
  score: number | null;
  method: TrainingStressScoreMethodType | null;
  estimated: boolean;
  /** Present only for calculated HR. THRESHOLD is an estimate without full Banister calibration. */
  hrAlgorithm?: TrainingStressScoreHrAlgorithm;
  provenance: 'imported' | 'calculated' | null;
  reasons: TrainingStressScoreReason[];
}

/** Compact evaluations computed from the same parsed inputs, with no raw physiology or streams. */
export interface TrainingStressScoreEvaluations {
  version: 1;
  automatic: TrainingStressScoreEvaluation;
  hr: TrainingStressScoreEvaluation;
  met: TrainingStressScoreEvaluation;
  /** Absent in evaluations saved by older versions. */
  swimPace?: TrainingStressScoreEvaluation;
  /** Absent in evaluations saved by older versions. Uses the existing eligible running sports. */
  runningPace?: TrainingStressScoreEvaluation;
}

export interface FileHeartRateCalibration {
  maxHeartRate?: number;
  restingHeartRate?: number;
  lactateThresholdHR?: number;
  reason?: 'ambiguous-hr-calibration' | 'invalid-hr-calibration';
  /** Independently checked threshold with missing/zero unused rest or max settings. Parser-only evidence. */
  thresholdFallbackHR?: number;
}

// Parser-only evidence must never enter ordinary Activity JSON or DataStore discovery.
export const fileHeartRateCalibration = new WeakMap<ActivityInterface, FileHeartRateCalibration>();
// A numeric FTP stat alone is not evidence: it may be a per-ride estimate or
// restored JSON. Only the original-file importer can establish this provenance.
export const fileFunctionalThresholdPower = new WeakMap<ActivityInterface, number>();
// Distinguish an explicitly reconstructed all-paused activity from legacy zero
// timer placeholders without adding parser evidence to persisted activity data.
// null marks a contradictory source duration that cannot be independently recovered.
// It blocks elapsed/moving-time fallback on the parsed instance; ordinary JSON
// retains missing stats, not the private source evidence.
export const fileActiveDuration = new WeakMap<ActivityInterface, number | null>();
export const trainingStressScoreEvaluations = new WeakMap<ActivityInterface, TrainingStressScoreEvaluations>();
