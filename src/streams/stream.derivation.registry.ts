import { DataAltitude } from '../data/data.altitude';
import { DataAltitudeSmooth } from '../data/data.altitude-smooth';
import { DataDistance } from '../data/data.distance';
import { DataGNSSDistance } from '../data/data.gnss-distance';
import { DataGrade } from '../data/data.grade';
import { DataGradeAdjustedPace } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedSpeed } from '../data/data.grade-adjusted-speed';
import { DataGradeSmooth } from '../data/data.grade-smooth';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLeftBalance } from '../data/data.left-balance';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPace } from '../data/data.pace';
import { DataPower } from '../data/data.power';
import { DataPowerLeft } from '../data/data.power-left';
import { DataPowerRight } from '../data/data.power-right';
import { DataRightBalance } from '../data/data.right-balance';
import { DataSpeed } from '../data/data.speed';
import { DataStanceTimeBalanceLeft } from '../data/data-stance-time-balance-left';
import { DataStanceTimeBalanceRight } from '../data/data-stance-time-balance-right';
import { DataSwimPace } from '../data/data.swim-pace';

export interface StreamDerivationRule {
  provides: string;
  requiresAll?: string[];
  requiresOneOf?: string[];
}

const STREAM_DERIVATION_RULES: StreamDerivationRule[] = [
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
    requiresAll: [DataPower.type, DataLeftBalance.type]
  },
  {
    provides: DataPowerRight.type,
    requiresAll: [DataPower.type, DataRightBalance.type]
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
