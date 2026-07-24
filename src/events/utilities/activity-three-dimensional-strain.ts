import { ActivityInterface } from '../../activities/activity.interface';
import { ActivityTypesHelper, type ActivityTypeGroup, type ActivityTypes } from '../../activities/activity.types';
import {
  THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS,
  THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
  type ThreeDimensionalStrainEligibilityReason,
  type ThreeDimensionalStrainEvidenceValueV2,
  type ThreeDimensionalStrainFitDiagnostics,
  type ThreeDimensionalStrainInputDiagnostics
} from '../../data/data.three-dimensional-strain-evidence';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve, type DataPowerCurvePoint } from '../../data/data.power-curve';
import {
  calculateThreeDimensionalStrain,
  fitThreeParameterCriticalPowerModel,
  type ThreeDimensionalStrainAnalysis
} from './three-dimensional-impulse-response';

export interface ActivityThreeDimensionalStrainAnalysis {
  summary: ThreeDimensionalStrainEvidenceValueV2 | null;
}

/**
 * Analyzes one activity's recorded power with a self-fitted three-parameter
 * power-duration model. Any canonical activity type can qualify; the result
 * retains that type and its activity group so consumers can keep sports separate.
 */
export function analyzeActivityThreeDimensionalStrain(
  activity: ActivityInterface
): ActivityThreeDimensionalStrainAnalysis {
  const activityContext = resolveActivityContext(activity);
  const power = safeGetPower(activity);
  const curve = safeGetPowerCurve(activity);
  if (!activityContext || (power.length === 0 && curve.length === 0)) {
    return { summary: null };
  }

  const sourceFingerprint = calculateActivityThreeDimensionalStrainSourceFingerprint(activity);
  const input = buildInputDiagnostics(power, curve);

  if (!input.validPowerSampleCount) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'missing-power') };
  }
  if (input.coverageRatio < THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.minimumPowerCoverageRatio) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'insufficient-coverage') };
  }
  if (input.curvePointCount < THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.minimumCurvePointCount) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'insufficient-curve-points') };
  }
  if (!input.hasShortDuration || !input.hasMediumDuration || !input.hasLongDuration) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'insufficient-duration-range') };
  }

  const fit = fitThreeParameterCriticalPowerModel(curve, {
    minimumSampleCount: THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.minimumCurvePointCount
  });
  if (!fit || !fit.converged) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'fit-failed') };
  }
  const fitDiagnostics = toFitDiagnostics(fit);
  if (fit.normalizedRmse > THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.maximumNormalizedRmse) {
    return { summary: buildUnavailable(activityContext, sourceFingerprint, input, 'poor-fit', fitDiagnostics) };
  }
  if (Math.max(...power.filter(isValidPower)) > fit.model.maximumPowerWatts) {
    return {
      summary: buildUnavailable(activityContext, sourceFingerprint, input, 'power-exceeds-maximum', fitDiagnostics)
    };
  }

  const strain = calculateThreeDimensionalStrain(power, fit.model, {
    minimumCoverageRatio: THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.minimumPowerCoverageRatio,
    maximumPowerAvailableExponent: 1,
    wPrimeBalanceTiming: 'before-sample'
  });
  if (
    strain.status !== 'ready' ||
    !strain.scores ||
    strain.endingWPrimeBalanceJoules === null ||
    strain.minimumWPrimeBalanceJoules === null
  ) {
    return {
      summary: buildUnavailable(
        activityContext,
        sourceFingerprint,
        inputFromStrain(input, strain),
        mapStrainReason(strain),
        fitDiagnostics
      )
    };
  }

  return {
    summary: {
      protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
      sourceFingerprint,
      ...activityContext,
      eligibility: { eligible: true, reason: 'eligible' },
      input: inputFromStrain(input, strain),
      fit: fitDiagnostics,
      evidence: {
        ...strain.scores,
        endingWPrimeBalanceJoules: strain.endingWPrimeBalanceJoules,
        minimumWPrimeBalanceJoules: strain.minimumWPrimeBalanceJoules
      }
    }
  };
}

/** A deterministic invalidation key for all protocol-v2 inputs. */
export function calculateActivityThreeDimensionalStrainSourceFingerprint(activity: ActivityInterface): string {
  const fingerprint = new ThreeDimensionalStrainFingerprint();
  const activityContext = resolveActivityContext(activity);
  fingerprint.add('protocol-version', THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION);
  Object.keys(THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS)
    .sort()
    .forEach(key =>
      fingerprint.add(
        `protocol-${key}`,
        THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS[key as keyof typeof THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS]
      )
    );
  fingerprint.add('activity-type', activityContext?.activityType || null);
  fingerprint.add('activity-group', activityContext?.activityGroup || null);
  fingerprint.add('duration-seconds', safeGetDuration(activity));
  safeGetPower(activity).forEach((value, index) => fingerprint.add(`power-${index}`, value));
  safeGetPowerCurve(activity).forEach((point, index) => {
    fingerprint.add(`curve-duration-${index}`, point.duration);
    fingerprint.add(`curve-power-${index}`, point.power);
  });
  return fingerprint.digest();
}

interface ActivityContext {
  activityType: ActivityTypes;
  activityGroup: ActivityTypeGroup;
}

function resolveActivityContext(activity: ActivityInterface): ActivityContext | null {
  try {
    const activityType = ActivityTypesHelper.resolveActivityType(activity.type);
    if (!activityType) {
      return null;
    }
    return {
      activityType,
      activityGroup: ActivityTypesHelper.getActivityGroupForActivityType(activityType)
    };
  } catch {
    return null;
  }
}

function buildUnavailable(
  activityContext: ActivityContext,
  sourceFingerprint: string,
  input: ThreeDimensionalStrainInputDiagnostics,
  reason: Exclude<ThreeDimensionalStrainEligibilityReason, 'eligible'>,
  fit: ThreeDimensionalStrainFitDiagnostics | null = null
): ThreeDimensionalStrainEvidenceValueV2 {
  return {
    protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
    sourceFingerprint,
    ...activityContext,
    eligibility: { eligible: false, reason },
    input,
    fit,
    evidence: null
  };
}

function buildInputDiagnostics(
  power: readonly (number | null)[],
  curve: readonly NormalizedCurvePoint[]
): ThreeDimensionalStrainInputDiagnostics {
  const validPowerSampleCount = power.filter(isValidPower).length;
  const curvePointCount = curve.length;
  return {
    powerSampleCount: power.length,
    validPowerSampleCount,
    candidateDurationSeconds: power.length,
    recordedDurationSeconds: validPowerSampleCount,
    coverageRatio: power.length ? validPowerSampleCount / power.length : 0,
    curvePointCount,
    hasShortDuration: curve.some(
      point => point.duration <= THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.shortDurationMaximumSeconds
    ),
    hasMediumDuration: curve.some(
      point =>
        point.duration >= THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.mediumDurationMinimumSeconds &&
        point.duration <= THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.mediumDurationMaximumSeconds
    ),
    hasLongDuration: curve.some(
      point => point.duration >= THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS.longDurationMinimumSeconds
    )
  };
}

function inputFromStrain(
  input: ThreeDimensionalStrainInputDiagnostics,
  strain: ThreeDimensionalStrainAnalysis
): ThreeDimensionalStrainInputDiagnostics {
  return {
    ...input,
    powerSampleCount: strain.sampleCount,
    validPowerSampleCount: strain.validSampleCount,
    candidateDurationSeconds: strain.candidateDurationSeconds,
    recordedDurationSeconds: strain.recordedDurationSeconds,
    coverageRatio: strain.coverageRatio
  };
}

function mapStrainReason(
  strain: ThreeDimensionalStrainAnalysis
): Exclude<ThreeDimensionalStrainEligibilityReason, 'eligible'> {
  if (strain.reason === 'insufficient-coverage') {
    return 'insufficient-coverage';
  }
  if (strain.reason === 'power-exceeds-maximum') {
    return 'power-exceeds-maximum';
  }
  return 'fit-failed';
}

function toFitDiagnostics(
  fit: NonNullable<ReturnType<typeof fitThreeParameterCriticalPowerModel>>
): ThreeDimensionalStrainFitDiagnostics {
  return {
    criticalPowerWatts: fit.model.criticalPowerWatts,
    wPrimeJoules: fit.model.wPrimeJoules,
    maximumPowerWatts: fit.model.maximumPowerWatts,
    sampleCount: fit.sampleCount,
    rmseWatts: fit.rmseWatts,
    normalizedRmse: fit.normalizedRmse,
    rSquared: fit.rSquared,
    iterations: fit.iterations,
    converged: fit.converged
  };
}

interface NormalizedCurvePoint {
  duration: number;
  power: number;
}

function safeGetPowerCurve(activity: ActivityInterface): NormalizedCurvePoint[] {
  const points = activity.getStat<DataPowerCurvePoint[]>(DataPowerCurve.type)?.getValue();
  if (!Array.isArray(points)) {
    return [];
  }
  const strongestByDuration = new Map<number, number>();
  points.forEach(point => {
    const duration = valueOf(point?.duration);
    const power = valueOf(point?.power);
    if (duration === null || power === null || duration <= 0 || power <= 0) {
      return;
    }
    strongestByDuration.set(duration, Math.max(strongestByDuration.get(duration) || 0, power));
  });
  return [...strongestByDuration.entries()]
    .map(([duration, power]) => ({ duration, power }))
    .sort((left, right) => left.duration - right.duration);
}

function safeGetPower(activity: ActivityInterface): (number | null)[] {
  try {
    const value = activity.getStreamData(DataPower.type);
    return Array.isArray(value) ? value.map(sample => (typeof sample === 'number' ? sample : null)) : [];
  } catch {
    return [];
  }
}

function safeGetDuration(activity: ActivityInterface): number | null {
  try {
    const duration = activity.getDuration()?.getValue();
    return typeof duration === 'number' && Number.isFinite(duration) && duration >= 0 ? duration : null;
  } catch {
    return null;
  }
}

function valueOf(value: unknown): number | null {
  const resolved =
    value && typeof (value as { getValue?: unknown }).getValue === 'function'
      ? (value as { getValue: () => unknown }).getValue()
      : value;
  return typeof resolved === 'number' && Number.isFinite(resolved) ? resolved : null;
}

function isValidPower(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

class ThreeDimensionalStrainFingerprint {
  private first = 0x811c9dc5;
  private second = 0x9e3779b9;

  add(label: string, value: unknown): void {
    this.update(`${label.length}:${label}${fingerprintValue(value)}`);
  }

  digest(): string {
    return `three-dimensional-strain-v${THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION}:${toHex(this.first)}${toHex(this.second)}`;
  }

  private update(value: string): void {
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      this.first = Math.imul(this.first ^ code, 0x01000193);
      this.second = Math.imul(this.second ^ code, 0x85ebca6b);
      this.second ^= this.second >>> 13;
    }
  }
}

function fingerprintValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null;';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `n:${value};` : 'n:non-finite;';
  }
  if (typeof value === 'string') {
    return `s:${value.length}:${value};`;
  }
  if (typeof value === 'boolean') {
    return value ? 'b:1;' : 'b:0;';
  }
  return `j:${JSON.stringify(value)};`;
}

function toHex(value: number): string {
  return (value >>> 0).toString(16).padStart(8, '0');
}
