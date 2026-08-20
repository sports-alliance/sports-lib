import { DataAltitude } from '../data/data.altitude';
import { DataAltitudeSmooth } from '../data/data.altitude-smooth';
import { DataDistance } from '../data/data.distance';
import { DataGNSSDistance } from '../data/data.gnss-distance';
import { DataGrade } from '../data/data.grade';
import { DataGradeAdjustedPace } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedSpeed } from '../data/data.grade-adjusted-speed';
import { DataGradeSmooth } from '../data/data.grade-smooth';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPace } from '../data/data.pace';
import { DataPower } from '../data/data.power';
import { DataPowerBalanceLeft } from '../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../data/data.power-balance-right';
import { DataPowerLeft } from '../data/data.power-left';
import { DataPowerRight } from '../data/data.power-right';
import { DataSpeed } from '../data/data.speed';
import { DataStanceTimeBalanceLeft } from '../data/data-stance-time-balance-left';
import { DataStanceTimeBalanceRight } from '../data/data-stance-time-balance-right';
import { DataSwimPace } from '../data/data.swim-pace';
import { DataCadence } from '../data/data.cadence';
import { DataStrokeRate } from '../data/data.stroke-rate';

export interface StreamDerivationRule {
  provides: string;
  requiresAll?: string[];
  requiresOneOf?: string[];
}

const STREAM_DERIVATION_RULES: StreamDerivationRule[] = [
  {
    // Source protocols commonly name this field cadence; activity semantics perform the relabel.
    provides: DataStrokeRate.type,
    requiresAll: [DataCadence.type]
  },
  {
    provides: DataAltitudeSmooth.type,
    requiresAll: [DataAltitude.type]
  },
  {
    provides: DataDistance.type,
    requiresAll: [DataLatitudeDegrees.type, DataLongitudeDegrees.type]
  },
  {
    provides: DataGNSSDistance.type,
    requiresAll: [DataLatitudeDegrees.type, DataLongitudeDegrees.type]
  },
  {
    provides: DataSpeed.type,
    requiresAll: [DataLatitudeDegrees.type, DataLongitudeDegrees.type]
  },
  {
    provides: DataGrade.type,
    requiresAll: [DataDistance.type],
    requiresOneOf: [DataAltitudeSmooth.type, DataAltitude.type]
  },
  {
    provides: DataGradeSmooth.type,
    requiresAll: [DataGrade.type]
  },
  {
    provides: DataGradeAdjustedSpeed.type,
    requiresAll: [DataSpeed.type, DataGradeSmooth.type]
  },
  {
    provides: DataPace.type,
    requiresAll: [DataSpeed.type]
  },
  {
    provides: DataSwimPace.type,
    requiresAll: [DataSpeed.type]
  },
  {
    provides: DataGradeAdjustedPace.type,
    requiresAll: [DataGradeAdjustedSpeed.type]
  },
  {
    provides: DataPowerLeft.type,
    requiresAll: [DataPower.type, DataPowerBalanceLeft.type]
  },
  {
    provides: DataPowerRight.type,
    requiresAll: [DataPower.type, DataPowerBalanceRight.type]
  },
  {
    provides: DataStanceTimeBalanceRight.type,
    requiresAll: [DataStanceTimeBalanceLeft.type]
  }
];

const STREAM_DERIVATION_RULES_BY_TARGET = new Map<string, StreamDerivationRule>(
  STREAM_DERIVATION_RULES.map(rule => [rule.provides, rule])
);

export function getStreamDerivationRules(): StreamDerivationRule[] {
  return [...STREAM_DERIVATION_RULES];
}

export function getStreamDerivationRule(targetType: string): StreamDerivationRule | null {
  return STREAM_DERIVATION_RULES_BY_TARGET.get(targetType) || null;
}

/**
 * Returns dependency types to add in dependency-closure resolution.
 * For `requiresOneOf`, all candidates are returned as conservative dependencies.
 */
export function getDependencyTypesForResolution(targetType: string): string[] {
  const rule = getStreamDerivationRule(targetType);
  if (!rule) {
    return [];
  }

  return [...new Set([...(rule.requiresAll || []), ...(rule.requiresOneOf || [])])];
}

export function canDeriveStreamType(targetType: string, hasStreamType: (streamType: string) => boolean): boolean {
  const rule = getStreamDerivationRule(targetType);
  if (!rule) {
    return true;
  }

  const hasAll = (rule.requiresAll || []).every(requiredType => hasStreamType(requiredType));
  const hasOneOf = !rule.requiresOneOf || rule.requiresOneOf.some(requiredType => hasStreamType(requiredType));
  return hasAll && hasOneOf;
}
