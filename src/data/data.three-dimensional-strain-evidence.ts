import { DataBare } from './data.bare';
import { DataJSONInterface } from './data.json.interface';

export const THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION = 1 as const;

export const THREE_DIMENSIONAL_STRAIN_PROTOCOL_THRESHOLDS = Object.freeze({
  minimumCurvePointCount: 8,
  shortDurationMaximumSeconds: 30,
  mediumDurationMinimumSeconds: 120,
  mediumDurationMaximumSeconds: 600,
  longDurationMinimumSeconds: 1200,
  maximumNormalizedRmse: 0.1,
  minimumPowerCoverageRatio: 0.95
});

export type ThreeDimensionalStrainDiscipline = 'cycling' | 'running';

export type ThreeDimensionalStrainEligibilityReason =
  | 'eligible'
  | 'missing-power'
  | 'insufficient-coverage'
  | 'insufficient-curve-points'
  | 'insufficient-duration-range'
  | 'fit-failed'
  | 'poor-fit'
  | 'power-exceeds-maximum';

export interface ThreeDimensionalStrainEligibility {
  eligible: boolean;
  reason: ThreeDimensionalStrainEligibilityReason;
}

export interface ThreeDimensionalStrainInputDiagnostics {
  powerSampleCount: number;
  validPowerSampleCount: number;
  candidateDurationSeconds: number;
  recordedDurationSeconds: number;
  coverageRatio: number;
  curvePointCount: number;
  hasShortDuration: boolean;
  hasMediumDuration: boolean;
  hasLongDuration: boolean;
}

export interface ThreeDimensionalStrainFitDiagnostics {
  criticalPowerWatts: number;
  wPrimeJoules: number;
  maximumPowerWatts: number;
  sampleCount: number;
  rmseWatts: number;
  normalizedRmse: number;
  rSquared: number | null;
  iterations: number;
  converged: boolean;
}

export interface ThreeDimensionalStrainEvidence {
  total: number;
  criticalPower: number;
  wPrime: number;
  maximumPower: number;
  endingWPrimeBalanceJoules: number;
  minimumWPrimeBalanceJoules: number;
}

/** Compact, activity-level 3D strain evidence. Source streams and timelines are never persisted. */
export interface ThreeDimensionalStrainEvidenceValue {
  protocolVersion: typeof THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION;
  /** Deterministic digest of the activity inputs used by protocol v1. */
  sourceFingerprint: string;
  discipline: ThreeDimensionalStrainDiscipline;
  eligibility: ThreeDimensionalStrainEligibility;
  input: ThreeDimensionalStrainInputDiagnostics;
  fit: ThreeDimensionalStrainFitDiagnostics | null;
  evidence: ThreeDimensionalStrainEvidence | null;
}

/** A compact, versioned result of fitting and scoring an activity's recorded power. */
export class DataThreeDimensionalStrainEvidence extends DataBare<ThreeDimensionalStrainEvidenceValue> {
  static type = 'Three Dimensional Strain Evidence';

  constructor(value: ThreeDimensionalStrainEvidenceValue | unknown) {
    super(assertThreeDimensionalStrainEvidenceValue(value));
  }

  override setValue(value: ThreeDimensionalStrainEvidenceValue): this {
    this.value = assertThreeDimensionalStrainEvidenceValue(value);
    return this;
  }

  getThreeDimensionalStrainValue(): ThreeDimensionalStrainEvidenceValue {
    return this.value;
  }

  override isValueTypeValid(value: unknown): boolean {
    return normalizeThreeDimensionalStrainEvidenceValue(value) !== null;
  }

  override toJSON(): DataJSONInterface {
    return {
      [DataThreeDimensionalStrainEvidence.type]: this.getThreeDimensionalStrainValue()
    };
  }
}

const DISCIPLINES = new Set<ThreeDimensionalStrainDiscipline>(['cycling', 'running']);
const ELIGIBILITY_REASONS = new Set<ThreeDimensionalStrainEligibilityReason>([
  'eligible',
  'missing-power',
  'insufficient-coverage',
  'insufficient-curve-points',
  'insufficient-duration-range',
  'fit-failed',
  'poor-fit',
  'power-exceeds-maximum'
]);

/** Returns a canonical value and drops unknown fields, including any source streams or timeline. */
export function normalizeThreeDimensionalStrainEvidenceValue(
  value: unknown
): ThreeDimensionalStrainEvidenceValue | null {
  const raw = asRecord(value);
  if (!raw || raw.protocolVersion !== THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION) {
    return null;
  }
  const discipline = DISCIPLINES.has(raw.discipline as ThreeDimensionalStrainDiscipline)
    ? (raw.discipline as ThreeDimensionalStrainDiscipline)
    : null;
  const sourceFingerprint = normalizeSourceFingerprint(raw.sourceFingerprint);
  const eligibility = normalizeEligibility(raw.eligibility);
  const input = normalizeInput(raw.input);
  const fit = raw.fit === null ? null : normalizeFit(raw.fit);
  const evidence = raw.evidence === null ? null : normalizeEvidence(raw.evidence);
  if (!discipline || !sourceFingerprint || !eligibility || !input || fit === undefined || evidence === undefined) {
    return null;
  }
  const normalized: ThreeDimensionalStrainEvidenceValue = {
    protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
    sourceFingerprint,
    discipline,
    eligibility,
    input,
    fit,
    evidence
  };
  return isSemanticallyValid(normalized) ? normalized : null;
}

function assertThreeDimensionalStrainEvidenceValue(value: unknown): ThreeDimensionalStrainEvidenceValue {
  const normalized = normalizeThreeDimensionalStrainEvidenceValue(value);
  if (!normalized) {
    throw new Error('Invalid three dimensional strain evidence value');
  }
  return normalized;
}

function normalizeEligibility(value: unknown): ThreeDimensionalStrainEligibility | null {
  const raw = asRecord(value);
  if (
    !raw ||
    typeof raw.eligible !== 'boolean' ||
    !ELIGIBILITY_REASONS.has(raw.reason as ThreeDimensionalStrainEligibilityReason)
  ) {
    return null;
  }
  const reason = raw.reason as ThreeDimensionalStrainEligibilityReason;
  if (raw.eligible !== (reason === 'eligible')) {
    return null;
  }
  return { eligible: raw.eligible, reason };
}

function normalizeInput(value: unknown): ThreeDimensionalStrainInputDiagnostics | null {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const powerSampleCount = finiteCount(raw.powerSampleCount);
  const validPowerSampleCount = finiteCount(raw.validPowerSampleCount);
  const candidateDurationSeconds = finiteNonNegative(raw.candidateDurationSeconds);
  const recordedDurationSeconds = finiteNonNegative(raw.recordedDurationSeconds);
  const coverageRatio = finiteRatio(raw.coverageRatio);
  const curvePointCount = finiteCount(raw.curvePointCount);
  if (
    powerSampleCount === null ||
    validPowerSampleCount === null ||
    candidateDurationSeconds === null ||
    recordedDurationSeconds === null ||
    coverageRatio === null ||
    curvePointCount === null ||
    typeof raw.hasShortDuration !== 'boolean' ||
    typeof raw.hasMediumDuration !== 'boolean' ||
    typeof raw.hasLongDuration !== 'boolean' ||
    validPowerSampleCount > powerSampleCount ||
    recordedDurationSeconds > candidateDurationSeconds
  ) {
    return null;
  }
  return {
    powerSampleCount,
    validPowerSampleCount,
    candidateDurationSeconds,
    recordedDurationSeconds,
    coverageRatio,
    curvePointCount,
    hasShortDuration: raw.hasShortDuration,
    hasMediumDuration: raw.hasMediumDuration,
    hasLongDuration: raw.hasLongDuration
  };
}

function normalizeFit(value: unknown): ThreeDimensionalStrainFitDiagnostics | null | undefined {
  const raw = asRecord(value);
  if (!raw) {
    return undefined;
  }
  const criticalPowerWatts = finitePositive(raw.criticalPowerWatts);
  const wPrimeJoules = finitePositive(raw.wPrimeJoules);
  const maximumPowerWatts = finitePositive(raw.maximumPowerWatts);
  const sampleCount = finiteCount(raw.sampleCount);
  const rmseWatts = finiteNonNegative(raw.rmseWatts);
  const normalizedRmse = finiteNonNegative(raw.normalizedRmse);
  const rSquared = nullableFinite(raw.rSquared);
  const iterations = finiteCount(raw.iterations);
  if (
    criticalPowerWatts === null ||
    wPrimeJoules === null ||
    maximumPowerWatts === null ||
    sampleCount === null ||
    rmseWatts === null ||
    normalizedRmse === null ||
    rSquared === undefined ||
    iterations === null ||
    typeof raw.converged !== 'boolean' ||
    maximumPowerWatts <= criticalPowerWatts
  ) {
    return undefined;
  }
  return {
    criticalPowerWatts,
    wPrimeJoules,
    maximumPowerWatts,
    sampleCount,
    rmseWatts,
    normalizedRmse,
    rSquared,
    iterations,
    converged: raw.converged
  };
}

function normalizeEvidence(value: unknown): ThreeDimensionalStrainEvidence | null | undefined {
  const raw = asRecord(value);
  if (!raw) {
    return undefined;
  }
  const total = finiteNonNegative(raw.total);
  const criticalPower = finiteNonNegative(raw.criticalPower);
  const wPrime = finiteNonNegative(raw.wPrime);
  const maximumPower = finiteNonNegative(raw.maximumPower);
  const endingWPrimeBalanceJoules = finiteNonNegative(raw.endingWPrimeBalanceJoules);
  const minimumWPrimeBalanceJoules = finiteNonNegative(raw.minimumWPrimeBalanceJoules);
  if (
    total === null ||
    criticalPower === null ||
    wPrime === null ||
    maximumPower === null ||
    endingWPrimeBalanceJoules === null ||
    minimumWPrimeBalanceJoules === null
  ) {
    return undefined;
  }
  return {
    total,
    criticalPower,
    wPrime,
    maximumPower,
    endingWPrimeBalanceJoules,
    minimumWPrimeBalanceJoules
  };
}

function isSemanticallyValid(value: ThreeDimensionalStrainEvidenceValue): boolean {
  if (value.eligibility.eligible !== (value.eligibility.reason === 'eligible')) {
    return false;
  }
  if (value.eligibility.eligible !== (value.fit !== null && value.evidence !== null)) {
    return false;
  }
  if (
    value.input.validPowerSampleCount !== value.input.recordedDurationSeconds ||
    value.input.powerSampleCount !== value.input.candidateDurationSeconds ||
    !hasExpectedCoverageRatio(value.input)
  ) {
    return false;
  }
  if (
    [
      'missing-power',
      'insufficient-coverage',
      'insufficient-curve-points',
      'insufficient-duration-range',
      'fit-failed'
    ].includes(value.eligibility.reason) &&
    value.fit !== null
  ) {
    return false;
  }
  if (['poor-fit', 'power-exceeds-maximum'].includes(value.eligibility.reason) && value.fit === null) {
    return false;
  }
  if (value.fit && (!value.fit.converged || value.fit.sampleCount !== value.input.curvePointCount)) {
    return false;
  }
  if (
    value.evidence &&
    Math.abs(
      value.evidence.total - (value.evidence.criticalPower + value.evidence.wPrime + value.evidence.maximumPower)
    ) > 1e-6
  ) {
    return false;
  }
  return (
    !value.fit ||
    value.evidence === null ||
    (value.evidence.minimumWPrimeBalanceJoules <= value.fit.wPrimeJoules &&
      value.evidence.endingWPrimeBalanceJoules <= value.fit.wPrimeJoules)
  );
}

function hasExpectedCoverageRatio(input: ThreeDimensionalStrainInputDiagnostics): boolean {
  const expected = input.candidateDurationSeconds ? input.recordedDurationSeconds / input.candidateDurationSeconds : 0;
  return Math.abs(input.coverageRatio - expected) <= Number.EPSILON;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function finiteCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function finiteNonNegative(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function finitePositive(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function finiteRatio(value: unknown): number | null {
  const number = finiteNonNegative(value);
  return number !== null && number <= 1 ? number : null;
}

function nullableFinite(value: unknown): number | null | undefined {
  return value === null ? null : typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeSourceFingerprint(value: unknown): string | null {
  const fingerprint = typeof value === 'string' ? value.trim() : '';
  return /^three-dimensional-strain-v1:[0-9a-f]{16}$/.test(fingerprint) ? fingerprint : null;
}
