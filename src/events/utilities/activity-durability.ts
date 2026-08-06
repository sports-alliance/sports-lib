import { ActivityInterface } from '../../activities/activity.interface';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../activities/activity.types';
import {
  DURABILITY_PROTOCOL_ELIGIBILITY_THRESHOLDS,
  DURABILITY_PROTOCOL_VERSION,
  type AerobicDurabilityEvidence,
  type DurabilityDiscipline,
  type DurabilityEligibility,
  type DurabilityEligibilityReason,
  type DurabilityEvidenceValue,
  type DurabilityOutputSource,
  type PoolDurabilityEvidence,
  normalizeComparablePoolStroke
} from '../../data/data.durability-evidence';
import { DataGrade } from '../../data/data.grade';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataHeartRateZoneFiveDuration } from '../../data/data.heart-rate-zone-five-duration';
import { DataHeartRateZoneFourDuration } from '../../data/data.heart-rate-zone-four-duration';
import { DataHeartRateZoneOneDuration } from '../../data/data.heart-rate-zone-one-duration';
import { DataHeartRateZoneSevenDuration } from '../../data/data.heart-rate-zone-seven-duration';
import { DataHeartRateZoneSixDuration } from '../../data/data.heart-rate-zone-six-duration';
import { DataHeartRateZoneThreeDuration } from '../../data/data.heart-rate-zone-three-duration';
import { DataHeartRateZoneTwoDuration } from '../../data/data.heart-rate-zone-two-duration';
import { DataPower } from '../../data/data.power';
import { DataPowerZoneFiveDuration } from '../../data/data.power-zone-five-duration';
import { DataPowerZoneFourDuration } from '../../data/data.power-zone-four-duration';
import { DataPowerZoneOneDuration } from '../../data/data.power-zone-one-duration';
import { DataPowerZoneSevenDuration } from '../../data/data.power-zone-seven-duration';
import { DataPowerZoneSixDuration } from '../../data/data.power-zone-six-duration';
import { DataPowerZoneThreeDuration } from '../../data/data.power-zone-three-duration';
import { DataPowerZoneTwoDuration } from '../../data/data.power-zone-two-duration';
import { DataSpeed } from '../../data/data.speed';
import { SwimLengthInterface } from '../../swim-lengths/swim-length.interface';

export interface DurabilityProtocol {
  smoothingWindowSeconds: number;
  warmupSeconds: number;
  cooldownSeconds: number;
  minimumActivityDurationSeconds: number;
  minimumQualifyingDurationSeconds: number;
  minimumCoverageRatio: number;
  maximumOutputCoefficientOfVariation: number;
  maximumHardZoneRatio: number;
  maximumFlatGradePercent: number;
  minimumFlatGradeCoverageRatio: number;
  minimumPoolComparableLengths: number;
  minimumPoolThirdLengths: number;
}

export const DEFAULT_DURABILITY_PROTOCOL: Readonly<DurabilityProtocol> = Object.freeze({
  smoothingWindowSeconds: 60,
  warmupSeconds: 10 * 60,
  cooldownSeconds: 5 * 60,
  ...DURABILITY_PROTOCOL_ELIGIBILITY_THRESHOLDS,
  maximumFlatGradePercent: 2,
  minimumFlatGradeCoverageRatio: 0.8
});

export interface DurabilityTimelinePoint {
  elapsedSeconds: number;
  sampleDurationSeconds: number;
  output: number;
  heartRateBpm: number;
  aerobicEfficiency: number;
  rawOutput: number;
  rawHeartRateBpm: number;
  inComparisonWindow: boolean;
  comparisonHalf: 'first' | 'second' | null;
}

export interface ActivityDurabilityAnalysis {
  /** Aerobic-only display series. Pool evidence is length-based and intentionally has no 1 Hz timeline. */
  timeline: DurabilityTimelinePoint[];
  summary: DurabilityEvidenceValue | null;
}

export interface AnalyzeActivityDurabilityOptions {
  includeTimeline?: boolean;
}

interface ResolvedOutput {
  discipline: DurabilityDiscipline;
  source: DurabilityOutputSource;
  values: (number | null)[];
  unavailableReason?: DurabilityEligibilityReason;
}

type ActivityDurabilityAdapter =
  | 'cycling-power'
  | 'gravity-mtb-unsupported'
  | 'running-speed'
  | 'open-water-speed'
  | 'pool-consistency';

const GRAVITY_MTB_ACTIVITY_TYPES = new Set<ActivityTypes>([ActivityTypes['Enduro MTB'], ActivityTypes.DownhillCycling]);

interface AerobicSegmentAccumulator {
  count: number;
  outputSum: number;
  outputSquareSum: number;
  heartRateSum: number;
}

interface ProcessedAerobicSamples {
  timeline: DurabilityTimelinePoint[];
  comparison: AerobicSegmentAccumulator;
  early: AerobicSegmentAccumulator;
  late: AerobicSegmentAccumulator;
}

const HEART_RATE_ZONE_TYPES = [
  DataHeartRateZoneOneDuration.type,
  DataHeartRateZoneTwoDuration.type,
  DataHeartRateZoneThreeDuration.type,
  DataHeartRateZoneFourDuration.type,
  DataHeartRateZoneFiveDuration.type,
  DataHeartRateZoneSixDuration.type,
  DataHeartRateZoneSevenDuration.type
];

const POWER_ZONE_TYPES = [
  DataPowerZoneOneDuration.type,
  DataPowerZoneTwoDuration.type,
  DataPowerZoneThreeDuration.type,
  DataPowerZoneFourDuration.type,
  DataPowerZoneFiveDuration.type,
  DataPowerZoneSixDuration.type,
  DataPowerZoneSevenDuration.type
];

/**
 * Hashes the effective protocol-v1 source inputs without retaining a second copy of long streams.
 * The digest is an invalidation key, not a security boundary.
 */
export function calculateActivityDurabilitySourceFingerprint(activity: ActivityInterface): string {
  const fingerprint = new DurabilityFingerprint();
  fingerprint.add('protocol-version', DURABILITY_PROTOCOL_VERSION);
  Object.keys(DEFAULT_DURABILITY_PROTOCOL)
    .sort()
    .forEach(key => fingerprint.add(`protocol-${key}`, DEFAULT_DURABILITY_PROTOCOL[key as keyof DurabilityProtocol]));
  fingerprint.add('activity-type', activity.type);
  fingerprint.add('duration-seconds', resolveActivityDurationSeconds(activity));

  const adapter = resolveActivityDurabilityAdapter(activity.type);
  if (adapter === 'gravity-mtb-unsupported') {
    // Gravity MTB used to inherit the general cycling adapter. This policy key
    // invalidates that evidence without changing the protocol-v1 payload.
    fingerprint.add('durability-adapter', adapter);
  } else if (adapter === 'cycling-power') {
    addStreamFingerprint(fingerprint, activity, DataPower.type);
    addStreamFingerprint(fingerprint, activity, DataHeartRate.type);
    addStatFingerprints(fingerprint, activity, POWER_ZONE_TYPES);
    addStatFingerprints(fingerprint, activity, HEART_RATE_ZONE_TYPES);
  } else if (adapter === 'running-speed') {
    addStreamFingerprint(fingerprint, activity, DataGradeAdjustedSpeed.type);
    addStreamFingerprint(fingerprint, activity, DataSpeed.type);
    addStreamFingerprint(fingerprint, activity, DataGrade.type);
    addStreamFingerprint(fingerprint, activity, DataHeartRate.type);
    addStatFingerprints(fingerprint, activity, HEART_RATE_ZONE_TYPES);
  } else if (adapter === 'open-water-speed') {
    addStreamFingerprint(fingerprint, activity, DataSpeed.type);
    addStreamFingerprint(fingerprint, activity, DataHeartRate.type);
    addStatFingerprints(fingerprint, activity, HEART_RATE_ZONE_TYPES);
  } else if (adapter === 'pool-consistency') {
    addSwimLengthFingerprints(fingerprint, activity);
    addStatFingerprints(fingerprint, activity, HEART_RATE_ZONE_TYPES);
  }
  return fingerprint.digest();
}

/**
 * True when the activity still contains the inputs needed to recalculate durability.
 * Policy-only adapters can recalculate explicit ineligibility from type and duration
 * even when long source streams are no longer retained.
 */
export function hasActivityDurabilitySourceData(activity: ActivityInterface): boolean {
  const adapter = resolveActivityDurabilityAdapter(activity.type);
  if (adapter === 'gravity-mtb-unsupported') {
    return true;
  }
  if (adapter === 'cycling-power') {
    return hasAnyStreamValues(activity, [DataPower.type, DataHeartRate.type]);
  }
  if (adapter === 'running-speed') {
    return hasAnyStreamValues(activity, [
      DataGradeAdjustedSpeed.type,
      DataSpeed.type,
      DataGrade.type,
      DataHeartRate.type
    ]);
  }
  if (adapter === 'open-water-speed') {
    return hasAnyStreamValues(activity, [DataSpeed.type, DataHeartRate.type]);
  }
  if (adapter === 'pool-consistency') {
    return safeGetSwimLengths(activity).length > 0;
  }
  return false;
}

function resolveActivityDurabilityAdapter(activityType: ActivityTypes): ActivityDurabilityAdapter | null {
  if (GRAVITY_MTB_ACTIVITY_TYPES.has(activityType)) {
    return 'gravity-mtb-unsupported';
  }

  const group = ActivityTypesHelper.getActivityGroupForActivityType(activityType);
  if (group === ActivityTypeGroups.CyclingGroup || group === ActivityTypeGroups.MountainBikingGroup) {
    return 'cycling-power';
  }
  if (group === ActivityTypeGroups.RunningGroup || group === ActivityTypeGroups.TrailRunningGroup) {
    return 'running-speed';
  }
  if (group === ActivityTypeGroups.SwimmingGroup) {
    return activityType === ActivityTypes.OpenWaterSwimming ? 'open-water-speed' : 'pool-consistency';
  }
  return null;
}

class DurabilityFingerprint {
  private first = 0x811c9dc5;
  private second = 0x9e3779b9;

  add(label: string, value: unknown): void {
    this.update(`${label.length}:${label}${fingerprintValue(value)}`);
  }

  addStream(type: string, values: (number | null)[]): void {
    this.add(`${type}-length`, values.length);

    let chunk = '';
    const valuesLength = values.length;
    for (let index = 0; index < valuesLength; index++) {
      if (!(index in values)) {
        continue;
      }
      const indexText = `${index}`;
      const labelLength = type.length + 1 + indexText.length;
      chunk += `${labelLength}:${type}-${indexText}${fingerprintValue(values[index])}`;

      if (chunk.length >= 16_384) {
        this.update(chunk);
        chunk = '';
      }
    }
    if (chunk.length) {
      this.update(chunk);
    }
  }

  digest(): string {
    return `durability-v1:${toHex(this.first)}${toHex(this.second)}`;
  }

  private update(value: string): void {
    let first = this.first;
    let second = this.second;
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      first = Math.imul(first ^ code, 0x01000193);
      second = Math.imul(second ^ code, 0x85ebca6b);
      second ^= second >>> 13;
    }
    this.first = first;
    this.second = second;
  }
}

function addStreamFingerprint(fingerprint: DurabilityFingerprint, activity: ActivityInterface, type: string): void {
  fingerprint.addStream(type, safeGetStream(activity, type));
}

function addStatFingerprints(
  fingerprint: DurabilityFingerprint,
  activity: ActivityInterface,
  types: readonly string[]
): void {
  types.forEach(type => fingerprint.add(type, safeGetStatValue(activity, type)));
}

function addSwimLengthFingerprints(fingerprint: DurabilityFingerprint, activity: ActivityInterface): void {
  const lengths = safeGetSwimLengths(activity);
  fingerprint.add('swim-length-count', lengths.length);
  lengths.forEach((length, position) => {
    const prefix = `swim-length-${position}`;
    fingerprint.add(`${prefix}-index`, length.index);
    fingerprint.add(`${prefix}-type`, length.type);
    fingerprint.add(`${prefix}-stroke`, length.stroke);
    fingerprint.add(`${prefix}-pool-length`, safeReadDataValue(length.poolLength));
    fingerprint.add(`${prefix}-distance`, safeReadDataValue(length.distance));
    fingerprint.add(`${prefix}-timer-time`, safeReadDataValue(length.timerTime));
    fingerprint.add(`${prefix}-elapsed-time`, safeReadDataValue(length.elapsedTime));
    fingerprint.add(`${prefix}-average-speed`, safeReadDataValue(length.avgSpeed));
    fingerprint.add(`${prefix}-swolf`, length.swolf);
  });
}

function hasAnyStreamValues(activity: ActivityInterface, types: readonly string[]): boolean {
  return types.some(type => safeGetStream(activity, type).length > 0);
}

function safeGetSwimLengths(activity: ActivityInterface): SwimLengthInterface[] {
  try {
    const lengths = activity.getSwimLengths?.();
    return Array.isArray(lengths) ? lengths : [];
  } catch (_error) {
    return [];
  }
}

function safeGetStatValue(activity: ActivityInterface, type: string): unknown {
  try {
    return activity.getStat?.(type)?.getValue?.();
  } catch (_error) {
    return null;
  }
}

function safeReadDataValue(value: { getValue(): unknown } | null | undefined): unknown {
  try {
    return value?.getValue() ?? null;
  } catch (_error) {
    return null;
  }
}

function fingerprintValue(value: unknown): string {
  if (value === null) {
    return '4:null';
  }
  if (value === undefined) {
    return '9:undefined';
  }
  if (typeof value === 'number') {
    const normalized = Number.isNaN(value)
      ? 'NaN'
      : value === Infinity
        ? 'Infinity'
        : value === -Infinity
          ? '-Infinity'
          : Object.is(value, -0)
            ? '-0'
            : `${value}`;
    return `${normalized.length + 2}:n:${normalized}`;
  }
  if (typeof value === 'string') {
    return `${value.length + 2}:s:${value}`;
  }
  if (typeof value === 'boolean') {
    return value ? '3:b:1' : '3:b:0';
  }
  return `${typeof value}`;
}

function toHex(value: number): string {
  return (value >>> 0).toString(16).padStart(8, '0');
}

export function calculateAerobicEfficiency(
  output: number | null | undefined,
  heartRateBpm: number | null | undefined
): number | null {
  if (!Number.isFinite(output) || !Number.isFinite(heartRateBpm) || Number(output) <= 0 || Number(heartRateBpm) <= 0) {
    return null;
  }
  return Number(output) / Number(heartRateBpm);
}

export function analyzeActivityDurability(
  activity: ActivityInterface,
  options: AnalyzeActivityDurabilityOptions = {}
): ActivityDurabilityAnalysis {
  const protocol = DEFAULT_DURABILITY_PROTOCOL;
  const sourceFingerprint = calculateActivityDurabilitySourceFingerprint(activity);
  const adapter = resolveActivityDurabilityAdapter(activity.type);
  if (adapter === 'pool-consistency') {
    return analyzePoolDurability(activity, protocol, sourceFingerprint);
  }

  const resolvedOutput = resolveAerobicOutput(activity, protocol, adapter);
  if (!resolvedOutput) {
    return { timeline: [], summary: null };
  }
  return analyzeAerobicDurability(
    activity,
    resolvedOutput,
    protocol,
    options.includeTimeline !== false,
    sourceFingerprint
  );
}

function analyzeAerobicDurability(
  activity: ActivityInterface,
  resolvedOutput: ResolvedOutput,
  protocol: DurabilityProtocol,
  includeTimeline: boolean,
  sourceFingerprint: string
): ActivityDurabilityAnalysis {
  const durationSeconds = resolveActivityDurationSeconds(activity);
  const heartRate = safeGetStream(activity, DataHeartRate.type);
  const streamLength = Math.max(resolvedOutput.values.length, heartRate.length);
  const comparisonStart = protocol.warmupSeconds;
  const boundedStreamLength = durationSeconds > 0 ? Math.min(streamLength, Math.ceil(durationSeconds)) : streamLength;
  const comparisonEnd = Math.max(comparisonStart, boundedStreamLength - protocol.cooldownSeconds);
  const comparisonMidpoint = comparisonStart + (comparisonEnd - comparisonStart) / 2;

  if (resolvedOutput.unavailableReason || !resolvedOutput.values.some(isPositiveFinite)) {
    return buildIneligibleAerobicResult(
      resolvedOutput,
      durationSeconds,
      resolvedOutput.unavailableReason || 'missing-output',
      sourceFingerprint
    );
  }
  if (!heartRate.some(isPositiveFinite)) {
    return buildIneligibleAerobicResult(resolvedOutput, durationSeconds, 'missing-heart-rate', sourceFingerprint);
  }

  const processed = processAerobicSamples(
    resolvedOutput.values,
    heartRate,
    boundedStreamLength,
    protocol.smoothingWindowSeconds,
    comparisonStart,
    comparisonEnd,
    comparisonMidpoint,
    includeTimeline
  );
  const eligibleSpanSeconds = Math.max(0, comparisonEnd - comparisonStart);
  const coverageRatio = eligibleSpanSeconds > 0 ? Math.min(1, processed.comparison.count / eligibleSpanSeconds) : 0;
  const earlySpanSeconds = Math.max(0, comparisonMidpoint - comparisonStart);
  const lateSpanSeconds = Math.max(0, comparisonEnd - comparisonMidpoint);
  const earlyCoverageRatio = earlySpanSeconds > 0 ? processed.early.count / earlySpanSeconds : 0;
  const lateCoverageRatio = lateSpanSeconds > 0 ? processed.late.count / lateSpanSeconds : 0;
  const hardZoneRatio = resolveHardZoneRatio(activity, resolvedOutput.source);
  const coefficientOfVariation = resolveAccumulatorCoefficientOfVariation(processed.comparison);

  let reason: DurabilityEligibilityReason = 'eligible';
  if (durationSeconds < protocol.minimumActivityDurationSeconds) {
    reason = 'insufficient-duration';
  } else if (
    processed.comparison.count < protocol.minimumQualifyingDurationSeconds ||
    coverageRatio < protocol.minimumCoverageRatio
  ) {
    reason = 'insufficient-coverage';
  } else if (earlyCoverageRatio < protocol.minimumCoverageRatio || lateCoverageRatio < protocol.minimumCoverageRatio) {
    reason = 'insufficient-halves';
  } else if (hardZoneRatio !== null && hardZoneRatio > protocol.maximumHardZoneRatio) {
    reason = 'too-intense';
  } else if (coefficientOfVariation !== null && coefficientOfVariation > protocol.maximumOutputCoefficientOfVariation) {
    reason = 'too-variable';
  }

  if (reason === 'eligible' && (processed.early.count <= 0 || processed.late.count <= 0)) {
    reason = 'insufficient-halves';
  }

  const eligibility = buildEligibility(
    reason,
    processed.comparison.count,
    processed.early.count,
    processed.late.count,
    coefficientOfVariation,
    hardZoneRatio,
    'halves'
  );
  const evidence = reason === 'eligible' ? buildAerobicEvidence(processed.early, processed.late) : null;
  if (reason === 'eligible' && !evidence) {
    eligibility.eligible = false;
    eligibility.reason = 'insufficient-halves';
  }

  return {
    timeline: processed.timeline,
    summary: {
      protocolVersion: DURABILITY_PROTOCOL_VERSION,
      sourceFingerprint,
      discipline: resolvedOutput.discipline,
      outputSource: resolvedOutput.source,
      outputUnit: resolvedOutput.source === 'power' ? 'W' : 'm/s',
      context: null,
      durationSeconds: round(durationSeconds, 2),
      qualifyingDurationSeconds: processed.comparison.count,
      coverageRatio: round(coverageRatio, 4),
      eligibility,
      evidence
    }
  };
}

function analyzePoolDurability(
  activity: ActivityInterface,
  protocol: DurabilityProtocol,
  sourceFingerprint: string
): ActivityDurabilityAnalysis {
  const durationSeconds = resolveActivityDurationSeconds(activity);
  const rawActiveLengths = (activity.getSwimLengths?.() || []).filter(
    length => `${length.type}`.toLowerCase() === 'active'
  );
  const comparableLengths = rawActiveLengths.filter(
    length =>
      !!normalizeComparablePoolStroke(length.stroke) &&
      resolveLengthPoolMeters(length) !== null &&
      resolveLengthPaceSecondsPer100m(length) !== null &&
      resolveLengthDurationSeconds(length) !== null
  );

  const grouped = new Map<string, SwimLengthInterface[]>();
  comparableLengths.forEach(length => {
    const poolLength = resolveLengthPoolMeters(length) as number;
    const stroke = normalizeComparablePoolStroke(length.stroke) as string;
    const key = `${round(poolLength, 3)}:${stroke}`;
    const values = grouped.get(key) || [];
    values.push(length);
    grouped.set(key, values);
  });
  const selected =
    [...grouped.entries()].sort(
      (left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0])
    )[0]?.[1] || [];
  const context = selected.length
    ? {
        poolLengthMeters: round(resolveLengthPoolMeters(selected[0]) as number, 3),
        stroke: normalizeComparablePoolStroke(selected[0].stroke) as string
      }
    : null;
  const thirdCount = Math.floor(selected.length / 3);
  const selectedDurationSeconds = sumLengthDurations(selected);
  const rawActiveDurationSeconds = sumLengthDurations(rawActiveLengths);
  const coverageRatio =
    rawActiveDurationSeconds > 0
      ? Math.min(1, selectedDurationSeconds / rawActiveDurationSeconds)
      : rawActiveLengths.length > 0
        ? selected.length / rawActiveLengths.length
        : 0;
  const coefficientOfVariation = resolveCoefficientOfVariation(
    selected.flatMap(length => {
      const pace = resolveLengthPaceSecondsPer100m(length);
      return pace === null ? [] : [pace];
    })
  );
  const hardZoneRatio = resolveHardZoneRatio(activity, 'pool-length-speed');
  let reason: DurabilityEligibilityReason = 'eligible';
  if (!rawActiveLengths.length) {
    reason = 'missing-output';
  } else if (!context) {
    reason = comparableLengths.length ? 'unsupported-context' : resolveMissingPoolReason(rawActiveLengths);
  } else if (durationSeconds < protocol.minimumActivityDurationSeconds) {
    reason = 'insufficient-duration';
  } else if (
    selectedDurationSeconds < protocol.minimumQualifyingDurationSeconds ||
    coverageRatio < protocol.minimumCoverageRatio
  ) {
    reason = 'insufficient-coverage';
  } else if (selected.length < protocol.minimumPoolComparableLengths || thirdCount < protocol.minimumPoolThirdLengths) {
    reason = 'insufficient-halves';
  } else if (hardZoneRatio !== null && hardZoneRatio > protocol.maximumHardZoneRatio) {
    reason = 'too-intense';
  } else if (coefficientOfVariation !== null && coefficientOfVariation > protocol.maximumOutputCoefficientOfVariation) {
    reason = 'too-variable';
  }

  return {
    timeline: [],
    summary: buildPoolSummary(
      durationSeconds,
      context,
      selected,
      selectedDurationSeconds,
      coverageRatio,
      coefficientOfVariation,
      hardZoneRatio,
      reason,
      sourceFingerprint
    )
  };
}

function buildPoolSummary(
  durationSeconds: number,
  context: { poolLengthMeters: number; stroke: string } | null,
  lengths: SwimLengthInterface[],
  qualifyingDurationSeconds: number,
  coverageRatio: number,
  coefficientOfVariation: number | null,
  hardZoneRatio: number | null,
  reason: DurabilityEligibilityReason,
  sourceFingerprint: string
): DurabilityEvidenceValue {
  const thirdCount = Math.floor(lengths.length / 3);
  const first = thirdCount > 0 ? lengths.slice(0, thirdCount) : [];
  const final = thirdCount > 0 ? lengths.slice(lengths.length - thirdCount) : [];
  const evidence = reason === 'eligible' && context ? buildPoolEvidence(context, lengths.length, first, final) : null;
  const eligible = reason === 'eligible' && !!evidence;
  return {
    protocolVersion: DURABILITY_PROTOCOL_VERSION,
    sourceFingerprint,
    discipline: 'pool-swimming',
    outputSource: 'pool-length-speed',
    outputUnit: 'm/s',
    context,
    durationSeconds: round(durationSeconds, 2),
    qualifyingDurationSeconds: round(Math.min(durationSeconds, qualifyingDurationSeconds), 2),
    coverageRatio: round(coverageRatio, 4),
    eligibility: buildEligibility(
      eligible ? 'eligible' : reason === 'eligible' ? 'insufficient-halves' : reason,
      lengths.length,
      first.length,
      final.length,
      coefficientOfVariation,
      hardZoneRatio,
      'outer-thirds'
    ),
    evidence
  };
}

function buildPoolEvidence(
  context: { poolLengthMeters: number; stroke: string },
  comparableLengthCount: number,
  first: SwimLengthInterface[],
  final: SwimLengthInterface[]
): PoolDurabilityEvidence | null {
  const firstPace = average(first.map(resolveLengthPaceSecondsPer100m));
  const finalPace = average(final.map(resolveLengthPaceSecondsPer100m));
  if (firstPace === null || finalPace === null || finalPace <= 0) {
    return null;
  }
  const firstSwolf = average(first.map(length => toPositiveFinite(length.swolf)));
  const finalSwolf = average(final.map(length => toPositiveFinite(length.swolf)));
  return {
    kind: 'pool-consistency',
    poolLengthMeters: round(context.poolLengthMeters, 3),
    stroke: context.stroke,
    comparableLengthCount,
    firstPaceSecondsPer100m: round(firstPace, 3),
    finalPaceSecondsPer100m: round(finalPace, 3),
    paceRetentionPercent: round((firstPace / finalPace) * 100, 3),
    firstSwolf: firstSwolf === null ? null : round(firstSwolf, 3),
    finalSwolf: finalSwolf === null ? null : round(finalSwolf, 3),
    swolfChange: firstSwolf === null || finalSwolf === null ? null : round(finalSwolf - firstSwolf, 3)
  };
}

function resolveAerobicOutput(
  activity: ActivityInterface,
  protocol: DurabilityProtocol,
  adapter: ActivityDurabilityAdapter | null
): ResolvedOutput | null {
  if (adapter === 'gravity-mtb-unsupported') {
    return {
      discipline: 'cycling',
      source: 'power',
      values: [],
      unavailableReason: 'unsupported-context'
    };
  }
  if (adapter === 'cycling-power') {
    return { discipline: 'cycling', source: 'power', values: safeGetStream(activity, DataPower.type) };
  }
  if (adapter === 'running-speed') {
    const gradeAdjusted = safeGetStream(activity, DataGradeAdjustedSpeed.type);
    if (hasComparisonWindowCoverage(gradeAdjusted, resolveActivityDurationSeconds(activity), protocol)) {
      return { discipline: 'running', source: 'grade-adjusted-speed', values: gradeAdjusted };
    }
    if (canUseRawRunningSpeed(activity, protocol)) {
      return { discipline: 'running', source: 'speed', values: safeGetStream(activity, DataSpeed.type) };
    }
    return {
      discipline: 'running',
      source: 'grade-adjusted-speed',
      values: [],
      unavailableReason: 'unsupported-context'
    };
  }
  if (adapter === 'open-water-speed') {
    return { discipline: 'open-water-swimming', source: 'speed', values: safeGetStream(activity, DataSpeed.type) };
  }
  return null;
}

function canUseRawRunningSpeed(activity: ActivityInterface, protocol: DurabilityProtocol): boolean {
  const speed = safeGetStream(activity, DataSpeed.type);
  if (!hasComparisonWindowCoverage(speed, resolveActivityDurationSeconds(activity), protocol)) {
    return false;
  }
  if ([ActivityTypes.Treadmill, ActivityTypes.IndoorRunning, ActivityTypes.VirtualRunning].includes(activity.type)) {
    return true;
  }
  const grades = safeGetStream(activity, DataGrade.type);
  const [comparisonStart, comparisonEnd] = resolveComparisonWindow(
    grades.length,
    resolveActivityDurationSeconds(activity),
    protocol
  );
  const comparisonSpan = comparisonEnd - comparisonStart;
  if (comparisonSpan <= 0) {
    return false;
  }
  let flatCount = 0;
  for (let index = comparisonStart; index < comparisonEnd; index += 1) {
    const grade = toFinite(grades[index]);
    if (grade !== null && Math.abs(grade) <= protocol.maximumFlatGradePercent) {
      flatCount += 1;
    }
  }
  return flatCount / comparisonSpan >= protocol.minimumFlatGradeCoverageRatio;
}

function processAerobicSamples(
  outputs: (number | null)[],
  heartRates: (number | null)[],
  streamLength: number,
  smoothingWindowSeconds: number,
  comparisonStart: number,
  comparisonEnd: number,
  comparisonMidpoint: number,
  includeTimeline: boolean
): ProcessedAerobicSamples {
  const timeline: DurabilityTimelinePoint[] = [];
  const queue: Array<{ elapsedSeconds: number; output: number; heartRateBpm: number }> = [];
  let queueStart = 0;
  let outputSum = 0;
  let heartRateSum = 0;
  const comparison = createAerobicAccumulator();
  const early = createAerobicAccumulator();
  const late = createAerobicAccumulator();
  for (let elapsedSeconds = 0; elapsedSeconds < streamLength; elapsedSeconds += 1) {
    const outputValue = toPositiveFinite(outputs[elapsedSeconds]);
    const heartRateValue = toPositiveFinite(heartRates[elapsedSeconds]);
    if (outputValue === null || heartRateValue === null) {
      continue;
    }
    const sample = { elapsedSeconds, output: outputValue, heartRateBpm: heartRateValue };
    queue.push(sample);
    outputSum += sample.output;
    heartRateSum += sample.heartRateBpm;
    while (
      queueStart < queue.length - 1 &&
      sample.elapsedSeconds - queue[queueStart].elapsedSeconds >= smoothingWindowSeconds
    ) {
      outputSum -= queue[queueStart].output;
      heartRateSum -= queue[queueStart].heartRateBpm;
      queueStart += 1;
    }
    const count = queue.length - queueStart;
    const output = outputSum / count;
    const heartRateBpm = heartRateSum / count;
    const aerobicEfficiency = calculateAerobicEfficiency(output, heartRateBpm);
    if (aerobicEfficiency === null) {
      continue;
    }
    const inComparisonWindow = elapsedSeconds >= comparisonStart && elapsedSeconds < comparisonEnd;
    const comparisonHalf = !inComparisonWindow ? null : elapsedSeconds < comparisonMidpoint ? 'first' : 'second';
    if (inComparisonWindow) {
      addAerobicAccumulatorSample(comparison, output, heartRateBpm);
      addAerobicAccumulatorSample(comparisonHalf === 'first' ? early : late, output, heartRateBpm);
    }
    if (includeTimeline) {
      timeline.push({
        elapsedSeconds,
        sampleDurationSeconds: elapsedSeconds - queue[queueStart].elapsedSeconds + 1,
        output,
        heartRateBpm,
        aerobicEfficiency,
        rawOutput: sample.output,
        rawHeartRateBpm: sample.heartRateBpm,
        inComparisonWindow,
        comparisonHalf
      });
    }
    if (queueStart > smoothingWindowSeconds * 2) {
      queue.splice(0, queueStart);
      queueStart = 0;
    }
  }
  return { timeline, comparison, early, late };
}

function buildAerobicEvidence(
  firstHalf: AerobicSegmentAccumulator,
  secondHalf: AerobicSegmentAccumulator
): AerobicDurabilityEvidence | null {
  const firstOutput = averageAccumulatorOutput(firstHalf);
  const secondOutput = averageAccumulatorOutput(secondHalf);
  const firstHeartRate = averageAccumulatorHeartRate(firstHalf);
  const secondHeartRate = averageAccumulatorHeartRate(secondHalf);
  if (firstOutput === null || secondOutput === null || firstHeartRate === null || secondHeartRate === null) {
    return null;
  }
  // Persist canonical base values first, then calculate every derived value from those
  // rounded bases. Calculating each field independently from full-precision values can
  // produce a compact summary that fails its own arithmetic validation after rounding,
  // especially for low speed values such as open-water swimming.
  const firstHalfOutput = round(firstOutput, 4);
  const secondHalfOutput = round(secondOutput, 4);
  const firstHalfHeartRateBpm = round(firstHeartRate, 3);
  const secondHalfHeartRateBpm = round(secondHeartRate, 3);
  const canonicalFirstEfficiency = calculateAerobicEfficiency(firstHalfOutput, firstHalfHeartRateBpm);
  const canonicalSecondEfficiency = calculateAerobicEfficiency(secondHalfOutput, secondHalfHeartRateBpm);
  if (canonicalFirstEfficiency === null || canonicalSecondEfficiency === null) {
    return null;
  }
  const firstHalfEfficiency = round(canonicalFirstEfficiency, 6);
  const secondHalfEfficiency = round(canonicalSecondEfficiency, 6);
  return {
    kind: 'aerobic-efficiency',
    firstHalfEfficiency,
    secondHalfEfficiency,
    decouplingPercent: round(((firstHalfEfficiency - secondHalfEfficiency) / firstHalfEfficiency) * 100, 3),
    firstHalfOutput,
    secondHalfOutput,
    outputRetentionPercent: round((secondHalfOutput / firstHalfOutput) * 100, 3),
    firstHalfHeartRateBpm,
    secondHalfHeartRateBpm,
    heartRateDriftBpm: round(secondHalfHeartRateBpm - firstHalfHeartRateBpm, 3)
  };
}

function buildIneligibleAerobicResult(
  resolvedOutput: ResolvedOutput,
  durationSeconds: number,
  reason: DurabilityEligibilityReason,
  sourceFingerprint: string
): ActivityDurabilityAnalysis {
  return {
    timeline: [],
    summary: {
      protocolVersion: DURABILITY_PROTOCOL_VERSION,
      sourceFingerprint,
      discipline: resolvedOutput.discipline,
      outputSource: resolvedOutput.source,
      outputUnit: resolvedOutput.source === 'power' ? 'W' : 'm/s',
      context: null,
      durationSeconds: round(durationSeconds, 2),
      qualifyingDurationSeconds: 0,
      coverageRatio: 0,
      eligibility: buildEligibility(reason, 0, 0, 0, null, null, 'halves'),
      evidence: null
    }
  };
}

function buildEligibility(
  reason: DurabilityEligibilityReason,
  validSampleCount: number,
  earlySampleCount: number,
  lateSampleCount: number,
  outputCoefficientOfVariation: number | null,
  hardZoneRatio: number | null,
  comparisonSegments: DurabilityEligibility['comparisonSegments']
): DurabilityEligibility {
  return {
    eligible: reason === 'eligible',
    reason,
    validSampleCount,
    comparisonSegments,
    earlySampleCount,
    lateSampleCount,
    outputCoefficientOfVariation: outputCoefficientOfVariation === null ? null : round(outputCoefficientOfVariation, 6),
    hardZoneRatio: hardZoneRatio === null ? null : round(hardZoneRatio, 6)
  };
}

function resolveHardZoneRatio(activity: ActivityInterface, outputSource: DurabilityOutputSource): number | null {
  const readZones = (types: string[]) =>
    types.map(type => {
      const value = activity.getStat?.(type)?.getValue?.();
      return toPositiveFinite(value) || 0;
    });
  const powerDurations = outputSource === 'power' ? readZones(POWER_ZONE_TYPES) : [];
  const durations =
    powerDurations.reduce((sum, value) => sum + value, 0) > 0 ? powerDurations : readZones(HEART_RATE_ZONE_TYPES);
  const total = durations.reduce((sum, value) => sum + value, 0);
  return total > 0 ? (durations[3] + durations[4] + durations[5] + durations[6]) / total : null;
}

function resolveCoefficientOfVariation(values: readonly number[]): number | null {
  const mean = average(values);
  if (mean === null || mean <= 0 || !values.length) {
    return null;
  }
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function resolveAccumulatorCoefficientOfVariation(accumulator: AerobicSegmentAccumulator): number | null {
  if (accumulator.count <= 0) {
    return null;
  }
  const mean = accumulator.outputSum / accumulator.count;
  if (!Number.isFinite(mean) || mean <= 0) {
    return null;
  }
  const variance = Math.max(0, accumulator.outputSquareSum / accumulator.count - mean ** 2);
  return Math.sqrt(variance) / mean;
}

function createAerobicAccumulator(): AerobicSegmentAccumulator {
  return { count: 0, outputSum: 0, outputSquareSum: 0, heartRateSum: 0 };
}

function addAerobicAccumulatorSample(
  accumulator: AerobicSegmentAccumulator,
  output: number,
  heartRateBpm: number
): void {
  accumulator.count += 1;
  accumulator.outputSum += output;
  accumulator.outputSquareSum += output ** 2;
  accumulator.heartRateSum += heartRateBpm;
}

function averageAccumulatorOutput(accumulator: AerobicSegmentAccumulator): number | null {
  return accumulator.count > 0 ? accumulator.outputSum / accumulator.count : null;
}

function averageAccumulatorHeartRate(accumulator: AerobicSegmentAccumulator): number | null {
  return accumulator.count > 0 ? accumulator.heartRateSum / accumulator.count : null;
}

function resolveComparisonWindow(
  streamLength: number,
  durationSeconds: number,
  protocol: DurabilityProtocol
): [number, number] {
  const boundedLength = durationSeconds > 0 ? Math.min(streamLength, Math.ceil(durationSeconds)) : streamLength;
  const start = Math.min(boundedLength, protocol.warmupSeconds);
  return [start, Math.max(start, boundedLength - protocol.cooldownSeconds)];
}

function hasComparisonWindowCoverage(
  values: readonly (number | null)[],
  durationSeconds: number,
  protocol: DurabilityProtocol
): boolean {
  const [start, end] = resolveComparisonWindow(values.length, durationSeconds, protocol);
  const span = end - start;
  if (span <= 0) {
    return false;
  }
  let validCount = 0;
  for (let index = start; index < end; index += 1) {
    if (isPositiveFinite(values[index])) {
      validCount += 1;
    }
  }
  return validCount >= protocol.minimumQualifyingDurationSeconds && validCount / span >= protocol.minimumCoverageRatio;
}

function resolveMissingPoolReason(lengths: readonly SwimLengthInterface[]): DurabilityEligibilityReason {
  const hasComparableContext = lengths.some(
    length => !!normalizeComparablePoolStroke(length.stroke) && resolveLengthPoolMeters(length) !== null
  );
  return hasComparableContext ? 'missing-output' : 'unsupported-context';
}

function sumLengthDurations(lengths: readonly SwimLengthInterface[]): number {
  return lengths.reduce((sum, length) => sum + (resolveLengthDurationSeconds(length) || 0), 0);
}

function resolveActivityDurationSeconds(activity: ActivityInterface): number {
  const statDuration = toPositiveFinite(activity.getDuration?.()?.getValue?.());
  if (statDuration !== null) {
    return statDuration;
  }
  const elapsed = (+activity.endDate - +activity.startDate) / 1000;
  return Number.isFinite(elapsed) && elapsed > 0 ? elapsed : 0;
}

function safeGetStream(activity: ActivityInterface, type: string): (number | null)[] {
  try {
    const values = activity.getStreamData?.(type);
    return Array.isArray(values) ? values : [];
  } catch (_error) {
    return [];
  }
}

function resolveLengthPoolMeters(length: SwimLengthInterface): number | null {
  return toPositiveFinite(length.poolLength?.getValue()) || toPositiveFinite(length.distance?.getValue());
}

function resolveLengthDurationSeconds(length: SwimLengthInterface): number | null {
  return toPositiveFinite(length.timerTime?.getValue()) || toPositiveFinite(length.elapsedTime?.getValue());
}

function resolveLengthPaceSecondsPer100m(length: SwimLengthInterface): number | null {
  const speed = toPositiveFinite(length.avgSpeed?.getValue());
  if (speed !== null) {
    return 100 / speed;
  }
  const duration = resolveLengthDurationSeconds(length);
  const distance = toPositiveFinite(length.distance?.getValue()) || resolveLengthPoolMeters(length);
  return duration !== null && distance !== null ? (duration / distance) * 100 : null;
}

function average(values: readonly (number | null)[]): number | null {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function isPositiveFinite(value: unknown): boolean {
  return toPositiveFinite(value) !== null;
}

function toPositiveFinite(value: unknown): number | null {
  const numeric = toFinite(value);
  return numeric !== null && numeric > 0 ? numeric : null;
}

function toFinite(value: unknown): number | null {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return null;
  }
  if (typeof value === 'string' && !value.trim()) {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
