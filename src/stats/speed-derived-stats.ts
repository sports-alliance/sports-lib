import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataGradeAdjustedPaceMax } from '../data/data.grade-adjusted-pace-max';
import { DataGradeAdjustedPaceMin } from '../data/data.grade-adjusted-pace-min';
import { DataGradeAdjustedSpeedAvg } from '../data/data.grade-adjusted-speed-avg';
import { DataGradeAdjustedSpeedMax } from '../data/data.grade-adjusted-speed-max';
import { DataGradeAdjustedSpeedMin } from '../data/data.grade-adjusted-speed-min';
import { DataInterface } from '../data/data.interface';
import { DataPaceAvg } from '../data/data.pace-avg';
import { DataPaceMax } from '../data/data.pace-max';
import { DataPaceMin } from '../data/data.pace-min';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataSpeedMax } from '../data/data.speed-max';
import { DataSpeedMin } from '../data/data.speed-min';
import { DataSwimPaceAvg } from '../data/data.swim-pace-avg';
import { DataSwimPaceMax } from '../data/data.swim-pace-max';
import { DataSwimPaceMin } from '../data/data.swim-pace-min';
import { convertSpeedToPace, convertSpeedToSwimPace } from '../events/utilities/helpers';
import { StatsClassInterface } from './stats.class.interface';
import { StatsUtilities } from './stats.utilities';

type SpeedDerivedStatsTarget = Pick<StatsClassInterface, 'addStat' | 'getStat'>;

type NumericDataConstructor = {
  readonly type: string;
  new (value: number): DataInterface<number>;
};

type SpeedDerivedStatRule = {
  readonly sourceType: string;
  readonly target: NumericDataConstructor;
  readonly convert: (speed: number) => number;
  readonly relatedSourceType?: string;
  readonly combineSourceValues?: (source: number, related: number) => number;
};

const SPEED_DERIVED_STAT_RULES: readonly SpeedDerivedStatRule[] = [
  {
    sourceType: DataSpeedMin.type,
    target: DataPaceMax,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataSpeedMax.type,
    target: DataPaceMin,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataSpeedAvg.type,
    target: DataPaceAvg,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataGradeAdjustedSpeedMin.type,
    relatedSourceType: DataSpeedMin.type,
    combineSourceValues: Math.min,
    target: DataGradeAdjustedPaceMax,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataGradeAdjustedSpeedMax.type,
    relatedSourceType: DataSpeedMax.type,
    combineSourceValues: Math.max,
    target: DataGradeAdjustedPaceMin,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataGradeAdjustedSpeedAvg.type,
    relatedSourceType: DataSpeedAvg.type,
    combineSourceValues: Math.max,
    target: DataGradeAdjustedPaceAvg,
    convert: convertSpeedToPace
  },
  {
    sourceType: DataSpeedMin.type,
    target: DataSwimPaceMax,
    convert: convertSpeedToSwimPace
  },
  {
    sourceType: DataSpeedMax.type,
    target: DataSwimPaceMin,
    convert: convertSpeedToSwimPace
  },
  {
    sourceType: DataSpeedAvg.type,
    target: DataSwimPaceAvg,
    convert: convertSpeedToSwimPace
  }
];

/**
 * Fills missing pace-family summary stats from canonical speed-family stats.
 *
 * This is intentionally package-internal. Importers and model hydration paths use it to keep
 * activities, events, and laps consistent without exposing another public calculation API.
 */
export function hydrateMissingSpeedDerivedStats(target: SpeedDerivedStatsTarget): void {
  SPEED_DERIVED_STAT_RULES.forEach(rule => {
    if (target.getStat(rule.target.type)) {
      return;
    }

    const sourceValue = StatsUtilities.getFiniteStatValue(target, rule.sourceType);
    if (sourceValue === null) {
      return;
    }

    const relatedValue = rule.relatedSourceType
      ? StatsUtilities.getFiniteStatValue(target, rule.relatedSourceType)
      : null;
    const valueToConvert =
      relatedValue !== null && rule.combineSourceValues
        ? rule.combineSourceValues(sourceValue, relatedValue)
        : sourceValue;

    target.addStat(new rule.target(rule.convert(valueToConvert)));
  });
}
