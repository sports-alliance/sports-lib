import { DataAltitudeAvg } from '../data/data.altitude-avg';
import { DataAltitudeMax } from '../data/data.altitude-max';
import { DataAltitudeMin } from '../data/data.altitude-min';
import { DataAscent } from '../data/data.ascent';
import { DataCadence } from '../data/data.cadence';
import { DataCadenceAvg } from '../data/data.cadence-avg';
import { DataCadenceMax } from '../data/data.cadence-max';
import { DataCadenceMin } from '../data/data.cadence-min';
import { DataDescent } from '../data/data.descent';
import { DataGradeAvg } from '../data/data.grade-avg';
import { DataGradeMax } from '../data/data.grade-max';
import { DataGradeMin } from '../data/data.grade-min';
import { DataInterface } from '../data/data.interface';
import { DataStrokeRate } from '../data/data.stroke-rate';
import { DataStrokeRateAvg } from '../data/data.stroke-rate-avg';
import { DataStrokeRateMax } from '../data/data.stroke-rate-max';
import { DataStrokeRateMin } from '../data/data.stroke-rate-min';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { Stream } from '../streams/stream';
import { ActivityInterface } from './activity.interface';
import { ActivityTypes, ActivityTypesHelper } from './activity.types';

type NumericDataConstructor = {
  new (value: number): DataInterface<number>;
  type: string;
};

interface MetricSemanticMapping {
  source: NumericDataConstructor;
  target: NumericDataConstructor;
}

const CADENCE_TO_STROKE_RATE_STATS: MetricSemanticMapping[] = [
  { source: DataCadence, target: DataStrokeRate },
  { source: DataCadenceAvg, target: DataStrokeRateAvg },
  { source: DataCadenceMin, target: DataStrokeRateMin },
  { source: DataCadenceMax, target: DataStrokeRateMax }
];

const DIVING_TERRAIN_SUMMARY_DATA_TYPES = [
  DataAscent.type,
  DataDescent.type,
  DataAltitudeMin.type,
  DataAltitudeMax.type,
  DataAltitudeAvg.type,
  DataGradeMin.type,
  DataGradeMax.type,
  DataGradeAvg.type
] as const;

/**
 * Re-labels cadence-shaped stats as stroke rate while preferring an explicitly supplied
 * stroke-rate value when both semantic families are present.
 */
function normalizeStrokeRateStats(target: StatsClassInterface): void {
  CADENCE_TO_STROKE_RATE_STATS.forEach(mapping => {
    const sourceStat = target.getStat<number>(mapping.source.type);
    if (!sourceStat) {
      return;
    }

    if (!target.getStat(mapping.target.type)) {
      target.addStat(new mapping.target(sourceStat.getValue()));
    }
    target.removeStat(mapping.source.type);
  });
}

/**
 * Canonicalizes summary metric semantics using every activity type represented by the stats.
 *
 * The target is mutated only when the supplied activity types are non-empty and all resolve to
 * canonical Sports Lib activity types. Homogeneous stroke-rate summaries convert cadence-shaped
 * values, while homogeneous Diving-group summaries remove terrain values that misrepresent dive
 * vertical movement. Empty, unknown, and mixed-family inputs are preserved because their
 * semantics are ambiguous. Explicit stroke-rate stats take precedence over cadence-shaped
 * compatibility values.
 *
 * Host applications that persist summary-only projections can call this after restoring the
 * projection and determining the activity types that contributed to it.
 *
 * @param target Stats-bearing model whose summary values should be canonicalized.
 * @param activityTypes Activity types represented by the target summary.
 * @category Activities and events
 */
export function normalizeActivityMetricSemanticsForStats(
  target: StatsClassInterface,
  activityTypes: readonly unknown[]
): void {
  const resolvedActivityTypes = resolveActivityTypes(activityTypes);

  if (resolvedActivityTypes.length === 0 || resolvedActivityTypes.length !== activityTypes.length) {
    return;
  }

  if (resolvedActivityTypes.every(activityType => ActivityTypesHelper.usesStrokeRate(activityType))) {
    normalizeStrokeRateStats(target);
  }
  removeExcludedTerrainSummaryMetricsForResolvedActivityTypes(target, resolvedActivityTypes);
}

/**
 * Applies activity-aware stream and summary semantics to an activity and its laps. Source
 * importers can remain protocol-focused and emit cadence-shaped fields; adding another supported
 * stroke-rate sport only requires extending ActivityTypesHelper.usesStrokeRate().
 */
export function normalizeActivityMetricSemanticsForActivity(activity: ActivityInterface): void {
  normalizeStrokeRateSemanticsForActivity(activity);
  removeExcludedTerrainSummaryMetricsForStats(activity, [activity.type]);
  activity.getLaps().forEach(lap => removeExcludedTerrainSummaryMetricsForStats(lap, [activity.type]));
}

/**
 * Removes terrain summaries that would misrepresent a homogeneous Diving-group
 * summary. Source streams are deliberately left untouched.
 */
export function removeExcludedTerrainSummaryMetricsForStats(
  target: StatsClassInterface,
  activityTypes: readonly unknown[]
): void {
  const resolvedActivityTypes = resolveActivityTypes(activityTypes);
  if (resolvedActivityTypes.length === 0 || resolvedActivityTypes.length !== activityTypes.length) {
    return;
  }
  removeExcludedTerrainSummaryMetricsForResolvedActivityTypes(target, resolvedActivityTypes);
}

/**
 * Applies activity-aware cadence semantics to streams, activity stats, and lap stats.
 * Source importers can remain protocol-focused and emit cadence-shaped fields; adding another
 * supported sport only requires extending ActivityTypesHelper.usesStrokeRate().
 */
export function normalizeStrokeRateSemanticsForActivity(activity: ActivityInterface): void {
  if (!ActivityTypesHelper.usesStrokeRate(activity.type)) {
    return;
  }

  const cadenceStream = activity.getAllStreams().find(stream => stream.type === DataCadence.type);
  const strokeRateStream = activity.getAllStreams().find(stream => stream.type === DataStrokeRate.type);

  if (cadenceStream) {
    const normalizedStreams = activity
      .getAllStreams()
      .filter(stream => stream !== cadenceStream || !strokeRateStream)
      .map(stream => {
        return stream === cadenceStream ? new Stream(DataStrokeRate.type, cadenceStream.toJSON().data) : stream;
      });
    activity.clearStreams();
    activity.addStreams(normalizedStreams);
  }

  normalizeActivityMetricSemanticsForStats(activity, [activity.type]);
  activity.getLaps().forEach(lap => normalizeActivityMetricSemanticsForStats(lap, [activity.type]));
}

function resolveActivityTypes(activityTypes: readonly unknown[]): ActivityTypes[] {
  return activityTypes
    .map(activityType => ActivityTypesHelper.resolveActivityType(activityType))
    .filter((activityType): activityType is ActivityTypes => activityType !== null);
}

function removeExcludedTerrainSummaryMetricsForResolvedActivityTypes(
  target: StatsClassInterface,
  activityTypes: readonly ActivityTypes[]
): void {
  if (!activityTypes.every(activityType => ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activityType))) {
    return;
  }
  DIVING_TERRAIN_SUMMARY_DATA_TYPES.forEach(dataType => target.removeStat(dataType));
}
