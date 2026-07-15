import { DataBare } from './data.bare';
import { DataJSONInterface } from './data.json.interface';

export const DURABILITY_PROTOCOL_VERSION = 1 as const;
export const DURABILITY_PROTOCOL_ELIGIBILITY_THRESHOLDS = Object.freeze({
  minimumActivityDurationSeconds: 40 * 60,
  minimumQualifyingDurationSeconds: 30 * 60,
  minimumCoverageRatio: 0.6,
  maximumOutputCoefficientOfVariation: 0.25,
  maximumHardZoneRatio: 0.2,
  minimumPoolComparableLengths: 24,
  minimumPoolThirdLengths: 8
});

export type DurabilityDiscipline = 'cycling' | 'running' | 'open-water-swimming' | 'pool-swimming';
export type DurabilityOutputSource = 'power' | 'grade-adjusted-speed' | 'speed' | 'pool-length-speed';
export type DurabilityOutputUnit = 'W' | 'm/s';
export type DurabilityEligibilityReason =
  | 'eligible'
  | 'unsupported-activity'
  | 'missing-output'
  | 'missing-heart-rate'
  | 'insufficient-duration'
  | 'insufficient-coverage'
  | 'insufficient-halves'
  | 'too-variable'
  | 'too-intense'
  | 'unsupported-context';

export interface DurabilityContext {
  poolLengthMeters: number;
  stroke: string;
}

export interface DurabilityEligibility {
  eligible: boolean;
  reason: DurabilityEligibilityReason;
  validSampleCount: number;
  comparisonSegments: 'halves' | 'outer-thirds';
  earlySampleCount: number;
  lateSampleCount: number;
  outputCoefficientOfVariation: number | null;
  hardZoneRatio: number | null;
}

export interface AerobicDurabilityEvidence {
  kind: 'aerobic-efficiency';
  firstHalfEfficiency: number;
  secondHalfEfficiency: number;
  decouplingPercent: number;
  firstHalfOutput: number;
  secondHalfOutput: number;
  outputRetentionPercent: number;
  firstHalfHeartRateBpm: number;
  secondHalfHeartRateBpm: number;
  heartRateDriftBpm: number;
}

export interface PoolDurabilityEvidence {
  kind: 'pool-consistency';
  poolLengthMeters: number;
  stroke: string;
  comparableLengthCount: number;
  firstPaceSecondsPer100m: number;
  finalPaceSecondsPer100m: number;
  paceRetentionPercent: number;
  firstSwolf: number | null;
  finalSwolf: number | null;
  swolfChange: number | null;
}

export type DurabilityEvidence = AerobicDurabilityEvidence | PoolDurabilityEvidence;

export interface DurabilityEvidenceValue {
  protocolVersion: typeof DURABILITY_PROTOCOL_VERSION;
  /** Deterministic digest of every activity input used by protocol v1. */
  sourceFingerprint: string;
  discipline: DurabilityDiscipline;
  outputSource: DurabilityOutputSource;
  outputUnit: DurabilityOutputUnit;
  context: DurabilityContext | null;
  durationSeconds: number;
  qualifyingDurationSeconds: number;
  coverageRatio: number;
  eligibility: DurabilityEligibility;
  evidence: DurabilityEvidence | null;
}

/** Compact activity-level durability summary. Timelines and source streams are intentionally not persisted. */
export class DataDurabilityEvidence extends DataBare<DurabilityEvidenceValue> {
  static type = 'Durability Evidence';

  constructor(value: DurabilityEvidenceValue | unknown) {
    super(assertDurabilityEvidenceValue(value));
  }

  override setValue(value: DurabilityEvidenceValue): this {
    this.value = assertDurabilityEvidenceValue(value);
    return this;
  }

  getDurabilityValue(): DurabilityEvidenceValue {
    return this.value;
  }

  override isValueTypeValid(value: unknown): boolean {
    return normalizeDurabilityEvidenceValue(value) !== null;
  }

  override toJSON(): DataJSONInterface {
    return {
      [DataDurabilityEvidence.type]: this.getDurabilityValue()
    };
  }
}

const DURABILITY_DISCIPLINES = new Set<DurabilityDiscipline>([
  'cycling',
  'running',
  'open-water-swimming',
  'pool-swimming'
]);
const DURABILITY_OUTPUT_SOURCES = new Set<DurabilityOutputSource>([
  'power',
  'grade-adjusted-speed',
  'speed',
  'pool-length-speed'
]);
const DURABILITY_ELIGIBILITY_REASONS = new Set<DurabilityEligibilityReason>([
  'eligible',
  'unsupported-activity',
  'missing-output',
  'missing-heart-rate',
  'insufficient-duration',
  'insufficient-coverage',
  'insufficient-halves',
  'too-variable',
  'too-intense',
  'unsupported-context'
]);

/** Returns a compact canonical value and strips every unknown field, including timelines. */
export function normalizeDurabilityEvidenceValue(value: unknown): DurabilityEvidenceValue | null {
  const raw = asRecord(value);
  if (!raw || raw.protocolVersion !== DURABILITY_PROTOCOL_VERSION) {
    return null;
  }
  const discipline = DURABILITY_DISCIPLINES.has(raw.discipline as DurabilityDiscipline)
    ? (raw.discipline as DurabilityDiscipline)
    : null;
  const outputSource = DURABILITY_OUTPUT_SOURCES.has(raw.outputSource as DurabilityOutputSource)
    ? (raw.outputSource as DurabilityOutputSource)
    : null;
  const outputUnit = raw.outputUnit === 'W' || raw.outputUnit === 'm/s' ? raw.outputUnit : null;
  if (!discipline || !outputSource || !outputUnit || !isCompatibleOutput(discipline, outputSource, outputUnit)) {
    return null;
  }
  const durationSeconds = finiteNonNegative(raw.durationSeconds);
  const qualifyingDurationSeconds = finiteNonNegative(raw.qualifyingDurationSeconds);
  const coverageRatio = finiteRatio(raw.coverageRatio);
  const sourceFingerprint = normalizeSourceFingerprint(raw.sourceFingerprint);
  const eligibility = normalizeEligibility(raw.eligibility, discipline === 'pool-swimming');
  const context = normalizeContext(raw.context, discipline);
  if (
    durationSeconds === null ||
    qualifyingDurationSeconds === null ||
    coverageRatio === null ||
    !sourceFingerprint ||
    !eligibility ||
    (discipline === 'pool-swimming' && raw.context !== null && !context) ||
    (discipline === 'pool-swimming' && eligibility.eligible && !context) ||
    (discipline !== 'pool-swimming' && raw.context !== null)
  ) {
    return null;
  }
  const evidence = eligibility.eligible ? normalizeEvidence(raw.evidence, discipline, context) : null;
  if ((eligibility.eligible && !evidence) || (!eligibility.eligible && raw.evidence !== null)) {
    return null;
  }
  const normalized: DurabilityEvidenceValue = {
    protocolVersion: DURABILITY_PROTOCOL_VERSION,
    sourceFingerprint,
    discipline,
    outputSource,
    outputUnit,
    context,
    durationSeconds,
    qualifyingDurationSeconds,
    coverageRatio,
    eligibility,
    evidence
  };
  return isSemanticallyValidDurabilityEvidence(normalized) ? normalized : null;
}

export function normalizeComparablePoolStroke(value: unknown): string | null {
  const stroke = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!stroke || ['drill', 'unknown', 'mixed', 'im', 'medley', 'individual medley'].includes(stroke)) {
    return null;
  }
  return stroke;
}

function assertDurabilityEvidenceValue(value: unknown): DurabilityEvidenceValue {
  const normalized = normalizeDurabilityEvidenceValue(value);
  if (!normalized) {
    throw new Error('Invalid durability evidence value');
  }
  return normalized;
}

function normalizeEligibility(value: unknown, isPool: boolean): DurabilityEligibility | null {
  const raw = asRecord(value);
  if (
    !raw ||
    typeof raw.eligible !== 'boolean' ||
    !DURABILITY_ELIGIBILITY_REASONS.has(raw.reason as DurabilityEligibilityReason)
  ) {
    return null;
  }
  const reason = raw.reason as DurabilityEligibilityReason;
  if (raw.eligible !== (reason === 'eligible')) {
    return null;
  }
  const validSampleCount = finiteCount(raw.validSampleCount);
  const earlySampleCount = finiteCount(raw.earlySampleCount);
  const lateSampleCount = finiteCount(raw.lateSampleCount);
  const outputCoefficientOfVariation = nullableFiniteNonNegative(raw.outputCoefficientOfVariation);
  const hardZoneRatio = nullableFiniteRatio(raw.hardZoneRatio);
  if (
    validSampleCount === null ||
    earlySampleCount === null ||
    lateSampleCount === null ||
    outputCoefficientOfVariation === undefined ||
    hardZoneRatio === undefined
  ) {
    return null;
  }
  const comparisonSegments = isPool ? 'outer-thirds' : 'halves';
  if (raw.comparisonSegments !== comparisonSegments) {
    return null;
  }
  return {
    eligible: raw.eligible,
    reason,
    validSampleCount,
    comparisonSegments,
    earlySampleCount,
    lateSampleCount,
    outputCoefficientOfVariation,
    hardZoneRatio
  };
}

function normalizeContext(value: unknown, discipline: DurabilityDiscipline): DurabilityContext | null {
  if (discipline !== 'pool-swimming') {
    return null;
  }
  const raw = asRecord(value);
  const poolLengthMeters = finitePositive(raw?.poolLengthMeters);
  const stroke = normalizeComparablePoolStroke(raw?.stroke);
  return poolLengthMeters === null || !stroke ? null : { poolLengthMeters, stroke };
}

function normalizeEvidence(
  value: unknown,
  discipline: DurabilityDiscipline,
  context: DurabilityContext | null
): DurabilityEvidence | null {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  if (discipline === 'pool-swimming') {
    const poolLengthMeters = finitePositive(raw.poolLengthMeters);
    const stroke = normalizeComparablePoolStroke(raw.stroke);
    const comparableLengthCount = finiteCount(raw.comparableLengthCount);
    const firstPaceSecondsPer100m = finitePositive(raw.firstPaceSecondsPer100m);
    const finalPaceSecondsPer100m = finitePositive(raw.finalPaceSecondsPer100m);
    const paceRetentionPercent = finitePositive(raw.paceRetentionPercent);
    const firstSwolf = nullableFinitePositive(raw.firstSwolf);
    const finalSwolf = nullableFinitePositive(raw.finalSwolf);
    const swolfChange = nullableFinite(raw.swolfChange);
    if (
      raw.kind !== 'pool-consistency' ||
      poolLengthMeters === null ||
      !stroke ||
      comparableLengthCount === null ||
      firstPaceSecondsPer100m === null ||
      finalPaceSecondsPer100m === null ||
      paceRetentionPercent === null ||
      firstSwolf === undefined ||
      finalSwolf === undefined ||
      swolfChange === undefined ||
      !context ||
      context.poolLengthMeters !== poolLengthMeters ||
      context.stroke !== stroke
    ) {
      return null;
    }
    return {
      kind: 'pool-consistency',
      poolLengthMeters,
      stroke,
      comparableLengthCount,
      firstPaceSecondsPer100m,
      finalPaceSecondsPer100m,
      paceRetentionPercent,
      firstSwolf,
      finalSwolf,
      swolfChange
    };
  }
  const firstHalfEfficiency = finitePositive(raw.firstHalfEfficiency);
  const secondHalfEfficiency = finitePositive(raw.secondHalfEfficiency);
  const decouplingPercent = finite(raw.decouplingPercent);
  const firstHalfOutput = finitePositive(raw.firstHalfOutput);
  const secondHalfOutput = finitePositive(raw.secondHalfOutput);
  const outputRetentionPercent = finitePositive(raw.outputRetentionPercent);
  const firstHalfHeartRateBpm = finitePositive(raw.firstHalfHeartRateBpm);
  const secondHalfHeartRateBpm = finitePositive(raw.secondHalfHeartRateBpm);
  const heartRateDriftBpm = finite(raw.heartRateDriftBpm);
  if (
    raw.kind !== 'aerobic-efficiency' ||
    firstHalfEfficiency === null ||
    secondHalfEfficiency === null ||
    decouplingPercent === null ||
    firstHalfOutput === null ||
    secondHalfOutput === null ||
    outputRetentionPercent === null ||
    firstHalfHeartRateBpm === null ||
    secondHalfHeartRateBpm === null ||
    heartRateDriftBpm === null
  ) {
    return null;
  }
  return {
    kind: 'aerobic-efficiency',
    firstHalfEfficiency,
    secondHalfEfficiency,
    decouplingPercent,
    firstHalfOutput,
    secondHalfOutput,
    outputRetentionPercent,
    firstHalfHeartRateBpm,
    secondHalfHeartRateBpm,
    heartRateDriftBpm
  };
}

function isSemanticallyValidDurabilityEvidence(value: DurabilityEvidenceValue): boolean {
  const { eligibility } = value;
  if (value.qualifyingDurationSeconds > value.durationSeconds) {
    return false;
  }
  if (value.discipline === 'pool-swimming') {
    if (
      eligibility.earlySampleCount !== eligibility.lateSampleCount ||
      eligibility.earlySampleCount !== Math.floor(eligibility.validSampleCount / 3)
    ) {
      return false;
    }
  } else if (
    !Number.isInteger(value.qualifyingDurationSeconds) ||
    eligibility.validSampleCount !== value.qualifyingDurationSeconds ||
    eligibility.earlySampleCount + eligibility.lateSampleCount !== eligibility.validSampleCount
  ) {
    return false;
  }
  if (!eligibility.eligible) {
    return true;
  }
  const thresholds = DURABILITY_PROTOCOL_ELIGIBILITY_THRESHOLDS;
  if (
    value.durationSeconds < thresholds.minimumActivityDurationSeconds ||
    value.qualifyingDurationSeconds < thresholds.minimumQualifyingDurationSeconds ||
    value.coverageRatio < thresholds.minimumCoverageRatio ||
    eligibility.outputCoefficientOfVariation === null ||
    eligibility.outputCoefficientOfVariation > thresholds.maximumOutputCoefficientOfVariation ||
    (eligibility.hardZoneRatio !== null && eligibility.hardZoneRatio > thresholds.maximumHardZoneRatio) ||
    eligibility.earlySampleCount <= 0 ||
    eligibility.lateSampleCount <= 0 ||
    !value.evidence
  ) {
    return false;
  }
  if (value.discipline === 'pool-swimming') {
    return isSemanticallyValidPoolEvidence(value.evidence, eligibility);
  }
  return isSemanticallyValidAerobicEvidence(value.evidence);
}

function isSemanticallyValidAerobicEvidence(evidence: DurabilityEvidence): boolean {
  if (evidence.kind !== 'aerobic-efficiency') {
    return false;
  }
  return (
    approximatelyEqual(
      evidence.firstHalfEfficiency,
      evidence.firstHalfOutput / evidence.firstHalfHeartRateBpm,
      0.00001
    ) &&
    approximatelyEqual(
      evidence.secondHalfEfficiency,
      evidence.secondHalfOutput / evidence.secondHalfHeartRateBpm,
      0.00001
    ) &&
    approximatelyEqual(
      evidence.decouplingPercent,
      ((evidence.firstHalfEfficiency - evidence.secondHalfEfficiency) / evidence.firstHalfEfficiency) * 100,
      0.01
    ) &&
    approximatelyEqual(
      evidence.outputRetentionPercent,
      (evidence.secondHalfOutput / evidence.firstHalfOutput) * 100,
      0.01
    ) &&
    approximatelyEqual(
      evidence.heartRateDriftBpm,
      evidence.secondHalfHeartRateBpm - evidence.firstHalfHeartRateBpm,
      0.01
    )
  );
}

function isSemanticallyValidPoolEvidence(evidence: DurabilityEvidence, eligibility: DurabilityEligibility): boolean {
  if (evidence.kind !== 'pool-consistency') {
    return false;
  }
  const thresholds = DURABILITY_PROTOCOL_ELIGIBILITY_THRESHOLDS;
  if (
    eligibility.validSampleCount < thresholds.minimumPoolComparableLengths ||
    eligibility.earlySampleCount < thresholds.minimumPoolThirdLengths ||
    evidence.comparableLengthCount !== eligibility.validSampleCount ||
    !approximatelyEqual(
      evidence.paceRetentionPercent,
      (evidence.firstPaceSecondsPer100m / evidence.finalPaceSecondsPer100m) * 100,
      0.01
    )
  ) {
    return false;
  }
  if (evidence.firstSwolf === null || evidence.finalSwolf === null) {
    return evidence.swolfChange === null;
  }
  return (
    evidence.swolfChange !== null &&
    approximatelyEqual(evidence.swolfChange, evidence.finalSwolf - evidence.firstSwolf, 0.01)
  );
}

function normalizeSourceFingerprint(value: unknown): string | null {
  return typeof value === 'string' && /^durability-v1:[0-9a-f]{16}$/.test(value) ? value : null;
}

function approximatelyEqual(left: number, right: number, tolerance: number): boolean {
  return Number.isFinite(right) && Math.abs(left - right) <= tolerance;
}

function isCompatibleOutput(
  discipline: DurabilityDiscipline,
  outputSource: DurabilityOutputSource,
  outputUnit: DurabilityOutputUnit
): boolean {
  if (discipline === 'cycling') {
    return outputSource === 'power' && outputUnit === 'W';
  }
  if (discipline === 'running') {
    return (outputSource === 'grade-adjusted-speed' || outputSource === 'speed') && outputUnit === 'm/s';
  }
  if (discipline === 'open-water-swimming') {
    return outputSource === 'speed' && outputUnit === 'm/s';
  }
  return outputSource === 'pool-length-speed' && outputUnit === 'm/s';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function finitePositive(value: unknown): number | null {
  const number = finite(value);
  return number !== null && number > 0 ? number : null;
}

function finiteNonNegative(value: unknown): number | null {
  const number = finite(value);
  return number !== null && number >= 0 ? number : null;
}

function finiteCount(value: unknown): number | null {
  const number = finiteNonNegative(value);
  return number !== null && Number.isInteger(number) ? number : null;
}

function finiteRatio(value: unknown): number | null {
  const number = finite(value);
  return number !== null && number >= 0 && number <= 1 ? number : null;
}

function nullableFinite(value: unknown): number | null | undefined {
  return value === null ? null : (finite(value) ?? undefined);
}

function nullableFinitePositive(value: unknown): number | null | undefined {
  return value === null ? null : (finitePositive(value) ?? undefined);
}

function nullableFiniteNonNegative(value: unknown): number | null | undefined {
  return value === null ? null : (finiteNonNegative(value) ?? undefined);
}

function nullableFiniteRatio(value: unknown): number | null | undefined {
  return value === null ? null : (finiteRatio(value) ?? undefined);
}
