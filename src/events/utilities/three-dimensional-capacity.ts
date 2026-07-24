import { ActivityTypesHelper, type ActivityTypes } from '../../activities/activity.types';
import type { PowerCurveSampleLike } from './power-curve-sampling';
import type { ThreeParameterCriticalPowerModel } from './three-dimensional-impulse-response';

/** Version of the dated power-duration capacity estimation contract. */
export const THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION = 1 as const;

/** Standard durations used to identify short-duration maximum-power evidence. */
export const THREE_DIMENSIONAL_CAPACITY_MAXIMUM_POWER_ANCHORS_SECONDS = Object.freeze([
  1, 2, 3, 5, 8, 12, 20, 30
] as const);

/** Standard durations used to identify CP and W′ evidence. */
export const THREE_DIMENSIONAL_CAPACITY_CRITICAL_POWER_ANCHORS_SECONDS = Object.freeze([
  120, 180, 240, 300, 480, 720, 900, 1200
] as const);

const ALL_ANCHORS_SECONDS = [
  ...THREE_DIMENSIONAL_CAPACITY_MAXIMUM_POWER_ANCHORS_SECONDS,
  ...THREE_DIMENSIONAL_CAPACITY_CRITICAL_POWER_ANCHORS_SECONDS
] as const;
const MAXIMUM_BRACKET_DURATION_RATIO = 1.25;
const MINIMUM_SOURCE_COUNT = 3;
const MINIMUM_HISTORY_SPAN_DAYS = 14;
const MINIMUM_CRITICAL_POWER_ANCHOR_COUNT = 5;
const MINIMUM_CRITICAL_POWER_EARLY_ANCHOR_COUNT = 2;
const MINIMUM_CRITICAL_POWER_LONG_ANCHOR_COUNT = 2;
const MINIMUM_MAXIMUM_POWER_ANCHOR_COUNT = 4;
const MAXIMUM_NORMALIZED_RMSE = 0.05;
const MAXIMUM_CRITICAL_POWER_SPREAD_RATIO = 0.05;
const MAXIMUM_W_PRIME_SPREAD_RATIO = 0.2;
const MAXIMUM_MAXIMUM_POWER_SPREAD_RATIO = 0.1;
const MILLISECONDS_PER_DAY = 86_400_000;
const NUMERICAL_EPSILON = 1e-12;

/**
 * One activity's mean-max power curve, dated so a caller can construct
 * chronological capacity snapshots without future-data leakage.
 */
export interface DatedActivityPowerCurve {
  /** Stable caller-owned identifier used for deduplication and provenance. */
  sourceId: string;
  /** Exact canonical activity type. Distinct types are never pooled. */
  activityType: ActivityTypes;
  /** UTC calendar date in `YYYY-MM-DD` form. */
  date: string;
  /** Mean-max power points for this activity. */
  powerCurve: readonly PowerCurveSampleLike[];
}

/** Options shared by envelope construction and capacity fitting. */
export interface BuildPowerDurationEnvelopeOptions {
  /** First UTC date on which the resulting snapshot may be used. */
  effectiveDate: string;
}

/** Options for a dated three-dimensional capacity fit. */
export type FitThreeDimensionalCapacityOptions = BuildPowerDurationEnvelopeOptions;

/** One standard-duration point in a historical maximum envelope. */
export interface PowerDurationEnvelopePoint {
  durationSeconds: number;
  powerWatts: number;
  sourceId: string;
  sourceDate: string;
}

export type PowerDurationEnvelopeStatus = 'ready' | 'insufficient-evidence' | 'invalid-input';

export type ThreeDimensionalCapacityReason =
  | 'no-evidence'
  | 'invalid-effective-date'
  | 'invalid-source'
  | 'duplicate-source'
  | 'invalid-date'
  | 'future-evidence'
  | 'invalid-activity-type'
  | 'mixed-activity-types'
  | 'invalid-power-curve'
  | 'insufficient-history'
  | 'insufficient-critical-power-range'
  | 'insufficient-maximum-power-range'
  | 'poor-critical-power-fit'
  | 'unstable-critical-power-fit'
  | 'poor-maximum-power-fit'
  | 'unstable-maximum-power-fit';

/** A deterministic standard-duration envelope with source provenance. */
export interface PowerDurationEnvelope {
  status: PowerDurationEnvelopeStatus;
  reason: ThreeDimensionalCapacityReason | null;
  estimatorVersion: typeof THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION;
  effectiveDate: string | null;
  activityType: ActivityTypes | null;
  sourceCount: number;
  historyStartDate: string | null;
  historyEndDate: string | null;
  historySpanDays: number;
  rejectedPointCount: number;
  sourceFingerprint: string | null;
  points: readonly PowerDurationEnvelopePoint[];
}

export type ThreeDimensionalCapacityStatus =
  | 'ready'
  | 'partial'
  | 'insufficient-evidence'
  | 'poor-fit'
  | 'unstable'
  | 'invalid-input';

export type ThreeDimensionalCapacityComponentStatus =
  | 'ready'
  | 'insufficient-evidence'
  | 'poor-fit'
  | 'unstable'
  | 'invalid-input';

/** Readiness and value for one capacity component. */
export interface ThreeDimensionalCapacityComponent {
  status: ThreeDimensionalCapacityComponentStatus;
  reason: ThreeDimensionalCapacityReason | null;
  value: number | null;
}

export type CriticalPowerFitMethod = 'power-reciprocal-time' | 'work-time' | 'duration-domain';

/** One two-parameter CP/W′ challenger fit. */
export interface CriticalPowerFitCandidate {
  method: CriticalPowerFitMethod;
  criticalPowerWatts: number;
  wPrimeJoules: number;
  normalizedRmse: number;
}

/** Diagnostics retained so consumers can audit every readiness gate. */
export interface ThreeDimensionalCapacityDiagnostics {
  sourceCount: number;
  historySpanDays: number;
  criticalPowerAnchorCount: number;
  earlyCriticalPowerAnchorCount: number;
  longCriticalPowerAnchorCount: number;
  maximumPowerAnchorCount: number;
  criticalPowerCandidates: readonly CriticalPowerFitCandidate[];
  criticalPowerNormalizedRmse: number | null;
  criticalPowerSpreadRatio: number | null;
  wPrimeSpreadRatio: number | null;
  criticalPowerLeaveOneOutSpreadRatio: number | null;
  wPrimeLeaveOneOutSpreadRatio: number | null;
  maximumPowerNormalizedRmse: number | null;
  maximumPowerLeaveOneOutSpreadRatio: number | null;
}

/** A confidence-gated CP/W′/Pmax result for one exact activity type. */
export interface ThreeDimensionalCapacityFit {
  status: ThreeDimensionalCapacityStatus;
  reason: ThreeDimensionalCapacityReason | null;
  estimatorVersion: typeof THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION;
  effectiveDate: string | null;
  activityType: ActivityTypes | null;
  sourceFingerprint: string | null;
  criticalPower: ThreeDimensionalCapacityComponent;
  wPrime: ThreeDimensionalCapacityComponent;
  maximumPower: ThreeDimensionalCapacityComponent;
  /** Present only when all three components are ready. */
  model: ThreeParameterCriticalPowerModel | null;
  envelope: PowerDurationEnvelope;
  diagnostics: ThreeDimensionalCapacityDiagnostics;
}

interface NormalizedCurve {
  sourceId: string;
  activityType: ActivityTypes;
  date: string;
  points: readonly NormalizedCurvePoint[];
}

interface NormalizedCurvePoint {
  durationSeconds: number;
  powerWatts: number;
}

interface CriticalPowerCoreFit {
  criticalPowerWatts: number;
  wPrimeJoules: number;
  normalizedRmse: number;
  criticalPowerSpreadRatio: number;
  wPrimeSpreadRatio: number;
  candidates: readonly CriticalPowerFitCandidate[];
}

interface CriticalPowerFitWithStability extends CriticalPowerCoreFit {
  criticalPowerLeaveOneOutSpreadRatio: number;
  wPrimeLeaveOneOutSpreadRatio: number;
}

interface MaximumPowerFit {
  maximumPowerWatts: number;
  normalizedRmse: number;
  leaveOneOutSpreadRatio: number;
}

/**
 * Builds the standard-duration maximum envelope used by the capacity fitter.
 *
 * Curves are normalized once, aliases are canonicalized, and malformed points
 * are ignored when a curve still contains usable evidence. Invalid histories
 * return a typed result and never throw.
 */
export function buildPowerDurationEnvelope(
  curves: readonly DatedActivityPowerCurve[],
  options: BuildPowerDurationEnvelopeOptions
): PowerDurationEnvelope {
  return buildPowerDurationEnvelopeInternal(curves, options);
}

/**
 * Fits a confidence-gated CP/W′/Pmax model from dated activity power curves.
 *
 * The caller owns the trailing-window policy. All supplied curves must belong
 * to one exact activity type and precede `effectiveDate`. A complete model is
 * returned only when the history, duration coverage, fit quality, and
 * leave-one-anchor-out stability gates all pass.
 */
export function fitThreeDimensionalCapacityModel(
  curves: readonly DatedActivityPowerCurve[],
  options: FitThreeDimensionalCapacityOptions
): ThreeDimensionalCapacityFit {
  const envelope = buildPowerDurationEnvelopeInternal(curves, options);
  const diagnostics = createEmptyDiagnostics(envelope);

  if (envelope.status === 'invalid-input') {
    return createUnavailableCapacity('invalid-input', envelope.reason, envelope, diagnostics);
  }
  if (envelope.status === 'insufficient-evidence') {
    return createUnavailableCapacity('insufficient-evidence', envelope.reason, envelope, diagnostics);
  }
  if (envelope.sourceCount < MINIMUM_SOURCE_COUNT || envelope.historySpanDays < MINIMUM_HISTORY_SPAN_DAYS) {
    return createUnavailableCapacity('insufficient-evidence', 'insufficient-history', envelope, diagnostics);
  }

  const criticalPowerPoints = envelope.points.filter(point =>
    THREE_DIMENSIONAL_CAPACITY_CRITICAL_POWER_ANCHORS_SECONDS.includes(
      point.durationSeconds as (typeof THREE_DIMENSIONAL_CAPACITY_CRITICAL_POWER_ANCHORS_SECONDS)[number]
    )
  );
  const earlyCriticalPowerAnchorCount = criticalPowerPoints.filter(
    point => point.durationSeconds >= 120 && point.durationSeconds <= 300
  ).length;
  const longCriticalPowerAnchorCount = criticalPowerPoints.filter(
    point => point.durationSeconds >= 720 && point.durationSeconds <= 1200
  ).length;
  diagnostics.criticalPowerAnchorCount = criticalPowerPoints.length;
  diagnostics.earlyCriticalPowerAnchorCount = earlyCriticalPowerAnchorCount;
  diagnostics.longCriticalPowerAnchorCount = longCriticalPowerAnchorCount;
  if (
    criticalPowerPoints.length < MINIMUM_CRITICAL_POWER_ANCHOR_COUNT ||
    earlyCriticalPowerAnchorCount < MINIMUM_CRITICAL_POWER_EARLY_ANCHOR_COUNT ||
    longCriticalPowerAnchorCount < MINIMUM_CRITICAL_POWER_LONG_ANCHOR_COUNT
  ) {
    return createUnavailableCapacity(
      'insufficient-evidence',
      'insufficient-critical-power-range',
      envelope,
      diagnostics
    );
  }

  const criticalPowerFit = fitCriticalPowerWithStability(criticalPowerPoints);
  if (!criticalPowerFit) {
    return createUnavailableCapacity('poor-fit', 'poor-critical-power-fit', envelope, diagnostics);
  }
  applyCriticalPowerDiagnostics(diagnostics, criticalPowerFit);
  if (criticalPowerFit.normalizedRmse > MAXIMUM_NORMALIZED_RMSE) {
    return createUnavailableCapacity('poor-fit', 'poor-critical-power-fit', envelope, diagnostics);
  }
  if (
    criticalPowerFit.criticalPowerSpreadRatio > MAXIMUM_CRITICAL_POWER_SPREAD_RATIO ||
    criticalPowerFit.wPrimeSpreadRatio > MAXIMUM_W_PRIME_SPREAD_RATIO ||
    criticalPowerFit.criticalPowerLeaveOneOutSpreadRatio > MAXIMUM_CRITICAL_POWER_SPREAD_RATIO ||
    criticalPowerFit.wPrimeLeaveOneOutSpreadRatio > MAXIMUM_W_PRIME_SPREAD_RATIO
  ) {
    return createUnavailableCapacity('unstable', 'unstable-critical-power-fit', envelope, diagnostics);
  }

  const criticalPower = readyComponent(criticalPowerFit.criticalPowerWatts);
  const wPrime = readyComponent(criticalPowerFit.wPrimeJoules);
  const maximumPowerPoints = envelope.points.filter(point =>
    THREE_DIMENSIONAL_CAPACITY_MAXIMUM_POWER_ANCHORS_SECONDS.includes(
      point.durationSeconds as (typeof THREE_DIMENSIONAL_CAPACITY_MAXIMUM_POWER_ANCHORS_SECONDS)[number]
    )
  );
  diagnostics.maximumPowerAnchorCount = maximumPowerPoints.length;
  const hasEarliestMaximumPowerEvidence = maximumPowerPoints.some(point => point.durationSeconds <= 5);
  const hasLaterMaximumPowerEvidence = maximumPowerPoints.some(point => point.durationSeconds >= 15);
  if (
    maximumPowerPoints.length < MINIMUM_MAXIMUM_POWER_ANCHOR_COUNT ||
    !hasEarliestMaximumPowerEvidence ||
    !hasLaterMaximumPowerEvidence
  ) {
    return createPartialCapacity(
      'insufficient-maximum-power-range',
      envelope,
      diagnostics,
      criticalPower,
      wPrime,
      'insufficient-evidence'
    );
  }

  const maximumPowerFit = fitMaximumPowerWithStability(
    maximumPowerPoints,
    criticalPowerFit.criticalPowerWatts,
    criticalPowerFit.wPrimeJoules
  );
  if (!maximumPowerFit) {
    return createPartialCapacity('poor-maximum-power-fit', envelope, diagnostics, criticalPower, wPrime, 'poor-fit');
  }
  diagnostics.maximumPowerNormalizedRmse = maximumPowerFit.normalizedRmse;
  diagnostics.maximumPowerLeaveOneOutSpreadRatio = maximumPowerFit.leaveOneOutSpreadRatio;
  if (maximumPowerFit.normalizedRmse > MAXIMUM_NORMALIZED_RMSE) {
    return createPartialCapacity('poor-maximum-power-fit', envelope, diagnostics, criticalPower, wPrime, 'poor-fit');
  }
  if (maximumPowerFit.leaveOneOutSpreadRatio > MAXIMUM_MAXIMUM_POWER_SPREAD_RATIO) {
    return createPartialCapacity(
      'unstable-maximum-power-fit',
      envelope,
      diagnostics,
      criticalPower,
      wPrime,
      'unstable'
    );
  }

  const maximumObservedPower = Math.max(...maximumPowerPoints.map(point => point.powerWatts));
  if (
    !Number.isFinite(maximumPowerFit.maximumPowerWatts) ||
    maximumPowerFit.maximumPowerWatts <= maximumObservedPower ||
    maximumPowerFit.maximumPowerWatts <= criticalPowerFit.criticalPowerWatts
  ) {
    return createPartialCapacity(
      'unstable-maximum-power-fit',
      envelope,
      diagnostics,
      criticalPower,
      wPrime,
      'unstable'
    );
  }

  const maximumPower = readyComponent(maximumPowerFit.maximumPowerWatts);
  return {
    status: 'ready',
    reason: null,
    estimatorVersion: THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION,
    effectiveDate: envelope.effectiveDate,
    activityType: envelope.activityType,
    sourceFingerprint: envelope.sourceFingerprint,
    criticalPower,
    wPrime,
    maximumPower,
    model: {
      criticalPowerWatts: criticalPowerFit.criticalPowerWatts,
      wPrimeJoules: criticalPowerFit.wPrimeJoules,
      maximumPowerWatts: maximumPowerFit.maximumPowerWatts
    },
    envelope,
    diagnostics
  };
}

function buildPowerDurationEnvelopeInternal(
  curvesInput: readonly DatedActivityPowerCurve[],
  options: BuildPowerDurationEnvelopeOptions
): PowerDurationEnvelope {
  const empty = (reason: ThreeDimensionalCapacityReason, status: PowerDurationEnvelopeStatus): PowerDurationEnvelope =>
    createEmptyEnvelope(status, reason);

  try {
    const effectiveDate = normalizeDateKey(options?.effectiveDate);
    if (!effectiveDate) {
      return empty('invalid-effective-date', 'invalid-input');
    }
    if (!Array.isArray(curvesInput) || !curvesInput.length) {
      const result = empty('no-evidence', 'insufficient-evidence');
      result.effectiveDate = effectiveDate;
      return result;
    }

    const seenSourceIds = new Set<string>();
    const normalizedCurves: NormalizedCurve[] = [];
    let rejectedPointCount = 0;
    let hasInvalidSource = false;
    let hasDuplicateSource = false;
    let hasInvalidDate = false;
    let hasFutureEvidence = false;
    let hasInvalidActivityType = false;
    let hasInvalidPowerCurve = false;
    for (const curveInput of curvesInput) {
      if (!curveInput || typeof curveInput !== 'object') {
        hasInvalidSource = true;
        continue;
      }
      try {
        const sourceId = normalizeSourceId(curveInput.sourceId);
        if (!sourceId) {
          hasInvalidSource = true;
          continue;
        }
        if (seenSourceIds.has(sourceId)) {
          hasDuplicateSource = true;
        } else {
          seenSourceIds.add(sourceId);
        }

        const date = normalizeDateKey(curveInput.date);
        if (!date) {
          hasInvalidDate = true;
        } else if (date >= effectiveDate) {
          hasFutureEvidence = true;
        }
        const activityType = normalizeActivityType(curveInput.activityType);
        if (!activityType) {
          hasInvalidActivityType = true;
        }
        const normalizedPoints = normalizePowerCurve(curveInput.powerCurve);
        rejectedPointCount += normalizedPoints.rejectedPointCount;
        if (!normalizedPoints.points.length) {
          hasInvalidPowerCurve = true;
        }
        if (date && date < effectiveDate && activityType && normalizedPoints.points.length) {
          normalizedCurves.push({ sourceId, activityType, date, points: normalizedPoints.points });
        }
      } catch {
        hasInvalidSource = true;
      }
    }

    const invalidReason: ThreeDimensionalCapacityReason | null = hasInvalidSource
      ? 'invalid-source'
      : hasDuplicateSource
        ? 'duplicate-source'
        : hasInvalidDate
          ? 'invalid-date'
          : hasFutureEvidence
            ? 'future-evidence'
            : hasInvalidActivityType
              ? 'invalid-activity-type'
              : hasInvalidPowerCurve
                ? 'invalid-power-curve'
                : null;
    if (invalidReason) {
      return emptyWithDate(invalidReason, effectiveDate);
    }

    const activityTypes = new Set(normalizedCurves.map(curve => curve.activityType));
    if (activityTypes.size !== 1) {
      return emptyWithDate('mixed-activity-types', effectiveDate);
    }
    const activityType = normalizedCurves[0].activityType;
    const curves = normalizedCurves.filter(curve =>
      ALL_ANCHORS_SECONDS.some(durationSeconds => sampleNormalizedPowerCurve(curve.points, durationSeconds) !== null)
    );
    if (!curves.length) {
      return {
        ...createEmptyEnvelope('insufficient-evidence', 'no-evidence'),
        effectiveDate,
        activityType,
        rejectedPointCount
      };
    }
    curves.sort(compareNormalizedCurves);
    const dates = curves.map(curve => curve.date);
    const historyStartDate = dates.reduce((minimum, date) => (date < minimum ? date : minimum));
    const historyEndDate = dates.reduce((maximum, date) => (date > maximum ? date : maximum));
    const historySpanDays = differenceInDays(historyStartDate, historyEndDate);
    const points = buildAnchorEnvelope(curves);
    const fingerprint = calculateCapacityFingerprint(curves, effectiveDate, activityType);
    return {
      status: points.length ? 'ready' : 'insufficient-evidence',
      reason: points.length ? null : 'no-evidence',
      estimatorVersion: THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION,
      effectiveDate,
      activityType,
      sourceCount: curves.length,
      historyStartDate,
      historyEndDate,
      historySpanDays,
      rejectedPointCount,
      sourceFingerprint: fingerprint,
      points
    };
  } catch {
    return empty('invalid-source', 'invalid-input');
  }
}

function emptyWithDate(reason: ThreeDimensionalCapacityReason, effectiveDate: string): PowerDurationEnvelope {
  const envelope = createEmptyEnvelope('invalid-input', reason);
  envelope.effectiveDate = effectiveDate;
  return envelope;
}

function createEmptyEnvelope(
  status: PowerDurationEnvelopeStatus,
  reason: ThreeDimensionalCapacityReason
): PowerDurationEnvelope {
  return {
    status,
    reason,
    estimatorVersion: THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION,
    effectiveDate: null,
    activityType: null,
    sourceCount: 0,
    historyStartDate: null,
    historyEndDate: null,
    historySpanDays: 0,
    rejectedPointCount: 0,
    sourceFingerprint: null,
    points: []
  };
}

function normalizeSourceId(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeDateKey(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return new Date(timestamp).toISOString().slice(0, 10) === value ? value : null;
}

function normalizeActivityType(value: unknown): ActivityTypes | null {
  if (typeof value !== 'string') {
    return null;
  }
  try {
    return ActivityTypesHelper.resolveActivityType(value) || null;
  } catch {
    return null;
  }
}

function normalizePowerCurve(pointsInput: readonly PowerCurveSampleLike[]): {
  points: readonly NormalizedCurvePoint[];
  rejectedPointCount: number;
} {
  if (!Array.isArray(pointsInput)) {
    return { points: [], rejectedPointCount: 1 };
  }
  const strongestByDuration = new Map<number, number>();
  let rejectedPointCount = 0;
  pointsInput.forEach(point => {
    const durationSeconds = unwrapFiniteNumber(point?.duration);
    const powerWatts = unwrapFiniteNumber(point?.power);
    if (durationSeconds === null || powerWatts === null || durationSeconds <= 0 || powerWatts <= 0) {
      rejectedPointCount += 1;
      return;
    }
    strongestByDuration.set(durationSeconds, Math.max(strongestByDuration.get(durationSeconds) || 0, powerWatts));
  });
  return {
    rejectedPointCount,
    points: [...strongestByDuration.entries()]
      .map(([durationSeconds, powerWatts]) => ({ durationSeconds, powerWatts }))
      .sort((left, right) => left.durationSeconds - right.durationSeconds)
  };
}

function unwrapFiniteNumber(value: unknown, seen = new Set<object>()): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return null;
  }
  const getter = (value as { getValue?: unknown }).getValue;
  if (typeof getter !== 'function') {
    return null;
  }
  seen.add(value);
  try {
    return unwrapFiniteNumber(getter.call(value), seen);
  } catch {
    return null;
  }
}

function compareNormalizedCurves(left: NormalizedCurve, right: NormalizedCurve): number {
  return left.date.localeCompare(right.date) || left.sourceId.localeCompare(right.sourceId);
}

function buildAnchorEnvelope(curves: readonly NormalizedCurve[]): PowerDurationEnvelopePoint[] {
  return ALL_ANCHORS_SECONDS.flatMap(durationSeconds => {
    let strongest: PowerDurationEnvelopePoint | null = null;
    curves.forEach(curve => {
      const powerWatts = sampleNormalizedPowerCurve(curve.points, durationSeconds);
      if (powerWatts === null) {
        return;
      }
      const candidate: PowerDurationEnvelopePoint = {
        durationSeconds,
        powerWatts,
        sourceId: curve.sourceId,
        sourceDate: curve.date
      };
      if (
        !strongest ||
        candidate.powerWatts > strongest.powerWatts ||
        (candidate.powerWatts === strongest.powerWatts &&
          (candidate.sourceDate < strongest.sourceDate ||
            (candidate.sourceDate === strongest.sourceDate && candidate.sourceId < strongest.sourceId)))
      ) {
        strongest = candidate;
      }
    });
    return strongest ? [strongest] : [];
  });
}

function sampleNormalizedPowerCurve(points: readonly NormalizedCurvePoint[], durationSeconds: number): number | null {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (points[middle].durationSeconds < durationSeconds) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  if (low < points.length && points[low].durationSeconds === durationSeconds) {
    return points[low].powerWatts;
  }
  if (low <= 0 || low >= points.length) {
    return null;
  }
  const left = points[low - 1];
  const right = points[low];
  if (right.durationSeconds / left.durationSeconds > MAXIMUM_BRACKET_DURATION_RATIO) {
    return null;
  }
  const leftX = 1 / left.durationSeconds;
  const rightX = 1 / right.durationSeconds;
  const targetX = 1 / durationSeconds;
  const ratio = (targetX - leftX) / (rightX - leftX);
  return left.powerWatts + (right.powerWatts - left.powerWatts) * ratio;
}

function differenceInDays(startDate: string, endDate: string): number {
  return Math.round(
    (Date.parse(`${endDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / MILLISECONDS_PER_DAY
  );
}

function fitCriticalPowerWithStability(
  points: readonly PowerDurationEnvelopePoint[]
): CriticalPowerFitWithStability | null {
  const core = fitCriticalPowerCore(points);
  if (!core) {
    return null;
  }
  const leaveOneOut = points
    .map((_point, omittedIndex) => fitCriticalPowerCore(points.filter((_candidate, index) => index !== omittedIndex)))
    .filter((candidate): candidate is CriticalPowerCoreFit => candidate !== null);
  if (leaveOneOut.length !== points.length) {
    return null;
  }
  const criticalPowerLeaveOneOutSpreadRatio = maximumRelativeDeviation(
    leaveOneOut.map(candidate => candidate.criticalPowerWatts),
    core.criticalPowerWatts
  );
  const wPrimeLeaveOneOutSpreadRatio = maximumRelativeDeviation(
    leaveOneOut.map(candidate => candidate.wPrimeJoules),
    core.wPrimeJoules
  );
  if (!Number.isFinite(criticalPowerLeaveOneOutSpreadRatio) || !Number.isFinite(wPrimeLeaveOneOutSpreadRatio)) {
    return null;
  }
  return {
    ...core,
    criticalPowerLeaveOneOutSpreadRatio,
    wPrimeLeaveOneOutSpreadRatio
  };
}

function fitCriticalPowerCore(points: readonly PowerDurationEnvelopePoint[]): CriticalPowerCoreFit | null {
  if (points.length < 4) {
    return null;
  }
  const candidates = [fitPowerReciprocalTime(points), fitWorkTime(points), fitDurationDomain(points)].filter(
    (candidate): candidate is CriticalPowerFitCandidate => candidate !== null
  );
  if (candidates.length !== 3) {
    return null;
  }
  const criticalPowerWatts = median(candidates.map(candidate => candidate.criticalPowerWatts));
  const wPrimeJoules = median(candidates.map(candidate => candidate.wPrimeJoules));
  const minimumLongPower = Math.min(...points.map(point => point.powerWatts));
  if (
    !isFinitePositive(criticalPowerWatts) ||
    !isFinitePositive(wPrimeJoules) ||
    criticalPowerWatts >= minimumLongPower
  ) {
    return null;
  }
  const normalizedRmse = powerModelNormalizedRmse(points, criticalPowerWatts, wPrimeJoules);
  const criticalPowerSpreadRatio = relativeRange(
    candidates.map(candidate => candidate.criticalPowerWatts),
    criticalPowerWatts
  );
  const wPrimeSpreadRatio = relativeRange(
    candidates.map(candidate => candidate.wPrimeJoules),
    wPrimeJoules
  );
  if (
    !Number.isFinite(normalizedRmse) ||
    !Number.isFinite(criticalPowerSpreadRatio) ||
    !Number.isFinite(wPrimeSpreadRatio)
  ) {
    return null;
  }
  return {
    criticalPowerWatts,
    wPrimeJoules,
    normalizedRmse,
    criticalPowerSpreadRatio,
    wPrimeSpreadRatio,
    candidates
  };
}

function fitPowerReciprocalTime(points: readonly PowerDurationEnvelopePoint[]): CriticalPowerFitCandidate | null {
  const regression = linearRegression(points.map(point => ({ x: 1 / point.durationSeconds, y: point.powerWatts })));
  return createCriticalPowerCandidate('power-reciprocal-time', regression?.intercept, regression?.slope, points);
}

function fitWorkTime(points: readonly PowerDurationEnvelopePoint[]): CriticalPowerFitCandidate | null {
  const regression = linearRegression(
    points.map(point => ({
      x: point.durationSeconds,
      y: point.durationSeconds * point.powerWatts
    }))
  );
  return createCriticalPowerCandidate('work-time', regression?.slope, regression?.intercept, points);
}

function fitDurationDomain(points: readonly PowerDurationEnvelopePoint[]): CriticalPowerFitCandidate | null {
  const minimumPower = Math.min(...points.map(point => point.powerWatts));
  const upperCriticalPower = minimumPower * (1 - 1e-9);
  if (!isFinitePositive(upperCriticalPower)) {
    return null;
  }
  const objective = (criticalPowerWatts: number): { error: number; wPrimeJoules: number } | null => {
    if (!isFinitePositive(criticalPowerWatts) || criticalPowerWatts >= minimumPower) {
      return null;
    }
    const reciprocalPowerMargins = points.map(point => 1 / (point.powerWatts - criticalPowerWatts));
    const denominator = reciprocalPowerMargins.reduce((sum, value) => sum + value * value, 0);
    if (!isFinitePositive(denominator)) {
      return null;
    }
    const wPrimeJoules =
      reciprocalPowerMargins.reduce((sum, value, index) => sum + value * points[index].durationSeconds, 0) /
      denominator;
    if (!isFinitePositive(wPrimeJoules)) {
      return null;
    }
    const error = points.reduce((sum, point) => {
      const predictedDuration = wPrimeJoules / (point.powerWatts - criticalPowerWatts);
      return sum + Math.pow(predictedDuration - point.durationSeconds, 2);
    }, 0);
    return Number.isFinite(error) ? { error, wPrimeJoules } : null;
  };
  const optimized = goldenSectionMinimum(
    Math.max(upperCriticalPower * 1e-6, Number.EPSILON),
    upperCriticalPower,
    criticalPowerWatts => objective(criticalPowerWatts)?.error ?? Number.POSITIVE_INFINITY
  );
  const result = objective(optimized);
  return createCriticalPowerCandidate('duration-domain', optimized, result?.wPrimeJoules, points);
}

function createCriticalPowerCandidate(
  method: CriticalPowerFitMethod,
  criticalPowerWatts: number | null | undefined,
  wPrimeJoules: number | null | undefined,
  points: readonly PowerDurationEnvelopePoint[]
): CriticalPowerFitCandidate | null {
  if (
    !isFinitePositive(criticalPowerWatts) ||
    !isFinitePositive(wPrimeJoules) ||
    criticalPowerWatts >= Math.min(...points.map(point => point.powerWatts))
  ) {
    return null;
  }
  const normalizedRmse = powerModelNormalizedRmse(points, criticalPowerWatts, wPrimeJoules);
  if (!Number.isFinite(normalizedRmse)) {
    return null;
  }
  return {
    method,
    criticalPowerWatts,
    wPrimeJoules,
    normalizedRmse
  };
}

function linearRegression(points: readonly { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} | null {
  const count = points.length;
  if (count < 2 || points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    return null;
  }
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denominator = count * sumXX - sumX * sumX;
  if (Math.abs(denominator) <= NUMERICAL_EPSILON) {
    return null;
  }
  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;
  return Number.isFinite(slope) && Number.isFinite(intercept) ? { slope, intercept } : null;
}

function powerModelNormalizedRmse(
  points: readonly PowerDurationEnvelopePoint[],
  criticalPowerWatts: number,
  wPrimeJoules: number
): number {
  const meanPower = points.reduce((sum, point) => sum + point.powerWatts, 0) / points.length;
  const squaredError = points.reduce((sum, point) => {
    const predicted = criticalPowerWatts + wPrimeJoules / point.durationSeconds;
    return sum + Math.pow(predicted - point.powerWatts, 2);
  }, 0);
  return Math.sqrt(squaredError / points.length) / meanPower;
}

function fitMaximumPowerWithStability(
  points: readonly PowerDurationEnvelopePoint[],
  criticalPowerWatts: number,
  wPrimeJoules: number
): MaximumPowerFit | null {
  const core = fitMaximumPowerCore(points, criticalPowerWatts, wPrimeJoules);
  if (!core) {
    return null;
  }
  const leaveOneOut = points
    .map((_point, omittedIndex) =>
      fitMaximumPowerCore(
        points.filter((_candidate, index) => index !== omittedIndex),
        criticalPowerWatts,
        wPrimeJoules
      )
    )
    .filter((candidate): candidate is Omit<MaximumPowerFit, 'leaveOneOutSpreadRatio'> => candidate !== null);
  if (leaveOneOut.length !== points.length) {
    return null;
  }
  const leaveOneOutSpreadRatio = maximumRelativeDeviation(
    leaveOneOut.map(candidate => candidate.maximumPowerWatts),
    core.maximumPowerWatts
  );
  if (!Number.isFinite(leaveOneOutSpreadRatio)) {
    return null;
  }
  return {
    ...core,
    leaveOneOutSpreadRatio
  };
}

function fitMaximumPowerCore(
  points: readonly PowerDurationEnvelopePoint[],
  criticalPowerWatts: number,
  wPrimeJoules: number
): Omit<MaximumPowerFit, 'leaveOneOutSpreadRatio'> | null {
  const timeOffsets = points
    .map(point => {
      const powerMargin = point.powerWatts - criticalPowerWatts;
      return powerMargin > 0 ? wPrimeJoules / powerMargin - point.durationSeconds : null;
    })
    .filter((value): value is number => isFinitePositive(value));
  if (timeOffsets.length !== points.length || !timeOffsets.length) {
    return null;
  }
  const timeOffsetSeconds = median(timeOffsets);
  const maximumPowerWatts = criticalPowerWatts + wPrimeJoules / timeOffsetSeconds;
  if (!isFinitePositive(maximumPowerWatts)) {
    return null;
  }
  const meanPower = points.reduce((sum, point) => sum + point.powerWatts, 0) / points.length;
  const squaredError = points.reduce((sum, point) => {
    const predicted = criticalPowerWatts + wPrimeJoules / (point.durationSeconds + timeOffsetSeconds);
    return sum + Math.pow(predicted - point.powerWatts, 2);
  }, 0);
  const normalizedRmse = Math.sqrt(squaredError / points.length) / meanPower;
  if (!Number.isFinite(normalizedRmse)) {
    return null;
  }
  return {
    maximumPowerWatts,
    normalizedRmse
  };
}

function goldenSectionMinimum(lowerBound: number, upperBound: number, objective: (value: number) => number): number {
  const ratio = (Math.sqrt(5) - 1) / 2;
  let lower = lowerBound;
  let upper = upperBound;
  let left = upper - ratio * (upper - lower);
  let right = lower + ratio * (upper - lower);
  let leftValue = objective(left);
  let rightValue = objective(right);
  for (let iteration = 0; iteration < 100; iteration += 1) {
    if (leftValue <= rightValue) {
      upper = right;
      right = left;
      rightValue = leftValue;
      left = upper - ratio * (upper - lower);
      leftValue = objective(left);
    } else {
      lower = left;
      left = right;
      leftValue = rightValue;
      right = lower + ratio * (upper - lower);
      rightValue = objective(right);
    }
  }
  return (lower + upper) / 2;
}

function relativeRange(values: readonly number[], reference: number): number {
  return isFinitePositive(reference)
    ? (Math.max(...values) - Math.min(...values)) / reference
    : Number.POSITIVE_INFINITY;
}

function maximumRelativeDeviation(values: readonly number[], reference: number): number {
  return isFinitePositive(reference)
    ? Math.max(...values.map(value => Math.abs(value - reference) / reference))
    : Number.POSITIVE_INFINITY;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function calculateCapacityFingerprint(
  curves: readonly NormalizedCurve[],
  effectiveDate: string,
  activityType: ActivityTypes
): string {
  const hash = new CapacityFingerprint();
  hash.add('version', THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION);
  hash.add('effective-date', effectiveDate);
  hash.add('activity-type', activityType);
  curves.forEach(curve => {
    hash.add('source-id', curve.sourceId);
    hash.add('source-date', curve.date);
    curve.points.forEach(point => {
      hash.add('duration', point.durationSeconds);
      hash.add('power', point.powerWatts);
    });
  });
  return hash.digest();
}

class CapacityFingerprint {
  private first = 0x811c9dc5;
  private second = 0x9e3779b9;

  add(label: string, value: unknown): void {
    const encodedValue =
      typeof value === 'number' && Number.isFinite(value)
        ? `n:${value};`
        : `s:${String(value).length}:${String(value)};`;
    this.update(`${label.length}:${label}${encodedValue}`);
  }

  digest(): string {
    return `three-dimensional-capacity-v${THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION}:${toHex(
      this.first
    )}${toHex(this.second)}`;
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

function toHex(value: number): string {
  return (value >>> 0).toString(16).padStart(8, '0');
}

function createEmptyDiagnostics(envelope: PowerDurationEnvelope): ThreeDimensionalCapacityDiagnostics {
  return {
    sourceCount: envelope.sourceCount,
    historySpanDays: envelope.historySpanDays,
    criticalPowerAnchorCount: 0,
    earlyCriticalPowerAnchorCount: 0,
    longCriticalPowerAnchorCount: 0,
    maximumPowerAnchorCount: 0,
    criticalPowerCandidates: [],
    criticalPowerNormalizedRmse: null,
    criticalPowerSpreadRatio: null,
    wPrimeSpreadRatio: null,
    criticalPowerLeaveOneOutSpreadRatio: null,
    wPrimeLeaveOneOutSpreadRatio: null,
    maximumPowerNormalizedRmse: null,
    maximumPowerLeaveOneOutSpreadRatio: null
  };
}

function applyCriticalPowerDiagnostics(
  diagnostics: ThreeDimensionalCapacityDiagnostics,
  fit: CriticalPowerFitWithStability
): void {
  diagnostics.criticalPowerCandidates = fit.candidates;
  diagnostics.criticalPowerNormalizedRmse = fit.normalizedRmse;
  diagnostics.criticalPowerSpreadRatio = fit.criticalPowerSpreadRatio;
  diagnostics.wPrimeSpreadRatio = fit.wPrimeSpreadRatio;
  diagnostics.criticalPowerLeaveOneOutSpreadRatio = fit.criticalPowerLeaveOneOutSpreadRatio;
  diagnostics.wPrimeLeaveOneOutSpreadRatio = fit.wPrimeLeaveOneOutSpreadRatio;
}

function readyComponent(value: number): ThreeDimensionalCapacityComponent {
  return { status: 'ready', reason: null, value };
}

function unavailableComponent(
  status: ThreeDimensionalCapacityComponentStatus,
  reason: ThreeDimensionalCapacityReason | null
): ThreeDimensionalCapacityComponent {
  return { status, reason, value: null };
}

function createUnavailableCapacity(
  status: Exclude<ThreeDimensionalCapacityStatus, 'ready' | 'partial'>,
  reason: ThreeDimensionalCapacityReason | null,
  envelope: PowerDurationEnvelope,
  diagnostics: ThreeDimensionalCapacityDiagnostics
): ThreeDimensionalCapacityFit {
  const componentStatus: ThreeDimensionalCapacityComponentStatus =
    status === 'invalid-input'
      ? 'invalid-input'
      : status === 'poor-fit'
        ? 'poor-fit'
        : status === 'unstable'
          ? 'unstable'
          : 'insufficient-evidence';
  const component = unavailableComponent(componentStatus, reason);
  return {
    status,
    reason,
    estimatorVersion: THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION,
    effectiveDate: envelope.effectiveDate,
    activityType: envelope.activityType,
    sourceFingerprint: envelope.sourceFingerprint,
    criticalPower: component,
    wPrime: { ...component },
    maximumPower: { ...component },
    model: null,
    envelope,
    diagnostics
  };
}

function createPartialCapacity(
  reason: ThreeDimensionalCapacityReason,
  envelope: PowerDurationEnvelope,
  diagnostics: ThreeDimensionalCapacityDiagnostics,
  criticalPower: ThreeDimensionalCapacityComponent,
  wPrime: ThreeDimensionalCapacityComponent,
  maximumPowerStatus: Exclude<ThreeDimensionalCapacityComponentStatus, 'ready' | 'invalid-input'>
): ThreeDimensionalCapacityFit {
  return {
    status: 'partial',
    reason,
    estimatorVersion: THREE_DIMENSIONAL_CAPACITY_ESTIMATOR_VERSION,
    effectiveDate: envelope.effectiveDate,
    activityType: envelope.activityType,
    sourceFingerprint: envelope.sourceFingerprint,
    criticalPower,
    wPrime,
    maximumPower: unavailableComponent(maximumPowerStatus, reason),
    model: null,
    envelope,
    diagnostics
  };
}
