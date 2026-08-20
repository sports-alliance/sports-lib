import { DataCadence } from '../data/data.cadence';
import { DataCadenceAvg } from '../data/data.cadence-avg';
import { DataCadenceMax } from '../data/data.cadence-max';
import { DataCadenceMin } from '../data/data.cadence-min';
import { DataInterface } from '../data/data.interface';
import { DataStrokeRate } from '../data/data.stroke-rate';
import { DataStrokeRateAvg } from '../data/data.stroke-rate-avg';
import { DataStrokeRateMax } from '../data/data.stroke-rate-max';
import { DataStrokeRateMin } from '../data/data.stroke-rate-min';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { Stream } from '../streams/stream';
import { ActivityInterface } from './activity.interface';
import { ActivityTypesHelper } from './activity.types';

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

/**
 * Re-labels cadence-shaped stats as stroke rate while preferring an explicitly supplied
 * stroke-rate value when both semantic families are present.
 */
export function normalizeStrokeRateStats(target: StatsClassInterface): void {
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

  normalizeStrokeRateStats(activity);
  activity.getLaps().forEach(lap => normalizeStrokeRateStats(lap));
}
