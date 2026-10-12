import type { TrainingStressScoreMethodType } from '../../../data/data.training-stress-score-method';
import type { ActivityInterface } from '../../../activities/activity.interface';

/** A requested calculation policy. Imported scores always take precedence. */
export type TrainingStressScorePreference = 'AUTOMATIC' | 'HR' | 'MET';

/**
 * Stable machine-readable diagnostics, suitable for a consumer's localized explanation.
 * `invalid-hr-calibration` includes inconsistent file settings, such as a scoped threshold
 * below the lowest boundary of the recognized six-boundary 50–100% HRR pattern.
 */
export type TrainingStressScoreReason =
  | 'imported-score'
  | 'unsupported-sport'
  | 'missing-hr-calibration'
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
  provenance: 'imported' | 'calculated' | null;
  reasons: TrainingStressScoreReason[];
}

/** Compact evaluations computed from the same parsed inputs, with no raw physiology or streams. */
export interface TrainingStressScoreEvaluations {
  version: 1;
  automatic: TrainingStressScoreEvaluation;
  hr: TrainingStressScoreEvaluation;
  met: TrainingStressScoreEvaluation;
}

export interface FileHeartRateCalibration {
  maxHeartRate?: number;
  restingHeartRate?: number;
  lactateThresholdHR?: number;
  reason?: 'ambiguous-hr-calibration' | 'invalid-hr-calibration';
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
