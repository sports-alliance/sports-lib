import { ActivityParsingOptions } from '../activities/activity-parsing-options';
import { ActivityInterface } from '../activities/activity.interface';
import { DataAltitude } from '../data/data.altitude';
import { DataDistance } from '../data/data.distance';
import { DataGradeAdjustedPace } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedSpeed } from '../data/data.grade-adjusted-speed';
import { DataGrade } from '../data/data.grade';
import { DataGradeSmooth } from '../data/data.grade-smooth';
import { DataGNSSDistance } from '../data/data.gnss-distance';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLeftBalance } from '../data/data.left-balance';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPace } from '../data/data.pace';
import { DataPowerLeft } from '../data/data.power-left';
import { DataPowerRight } from '../data/data.power-right';
import { DataPower } from '../data/data.power';
import { DataRightBalance } from '../data/data.right-balance';
import { DataSpeed } from '../data/data.speed';
import { DataStanceTimeBalanceLeft } from '../data/data-stance-time-balance-left';
import { DataStanceTimeBalanceRight } from '../data/data-stance-time-balance-right';
import { DataSwimPace } from '../data/data.swim-pace';
import { DynamicDataLoader } from '../data/data.store';
import { ParsingEventLibError } from '../errors/parsing-event-lib.error';

export interface StreamSelection {
  importAllowSet: Set<string>;
  outputAllowSet: Set<string>;
}

const EXPLICIT_DEPENDENCY_MAP: Record<string, string[]> = {
  [DataDistance.type]: [DataLatitudeDegrees.type, DataLongitudeDegrees.type],
  [DataGNSSDistance.type]: [DataLatitudeDegrees.type, DataLongitudeDegrees.type],
  [DataSpeed.type]: [DataLatitudeDegrees.type, DataLongitudeDegrees.type],
  [DataPace.type]: [DataSpeed.type],
  [DataSwimPace.type]: [DataSpeed.type],
  [DataGradeAdjustedPace.type]: [DataGradeAdjustedSpeed.type],
  [DataGradeAdjustedSpeed.type]: [
    DataSpeed.type,
    DataGradeSmooth.type,
    DataGrade.type,
    DataDistance.type,
    DataAltitude.type
  ],
  [DataGradeSmooth.type]: [DataGrade.type, DataDistance.type, DataAltitude.type],
  [DataGrade.type]: [DataDistance.type, DataAltitude.type],
  [DataPowerLeft.type]: [DataPower.type, DataLeftBalance.type],
  [DataPowerRight.type]: [DataPower.type, DataRightBalance.type],
  [DataStanceTimeBalanceRight.type]: [DataStanceTimeBalanceLeft.type]
};

function validateAndNormalizeRequestedTypes(requestedTypes: string[]): Set<string> {
  const normalizedTypes = new Set<string>();
  const unknownTypes: string[] = [];

  requestedTypes.forEach(type => {
    const normalizedType = typeof type === 'string' ? type.trim() : String(type);

    try {
      const dataClass = DynamicDataLoader.getDataClassFromDataType(normalizedType);
      if (dataClass.type !== normalizedType) {
        unknownTypes.push(type);
        return;
      }
      normalizedTypes.add(normalizedType);
    } catch (_error) {
      unknownTypes.push(type);
    }
  });

  if (unknownTypes.length > 0) {
    throw new ParsingEventLibError(`Unknown stream includeTypes: ${unknownTypes.join(', ')}`);
  }

  return normalizedTypes;
}

function getUnitDependencyTypes(dataType: string): string[] {
  return Object.entries(DynamicDataLoader.dataTypeUnitGroups).reduce((dependencies: string[], [baseDataType, group]) => {
    if (Object.keys(group).indexOf(dataType) !== -1) {
      dependencies.push(baseDataType);
    }
    return dependencies;
  }, []);
}

function getDependencyTypes(dataType: string): string[] {
  const explicitDependencies = EXPLICIT_DEPENDENCY_MAP[dataType] || [];
  const unitDependencies = getUnitDependencyTypes(dataType);
  return Array.from(new Set([...explicitDependencies, ...unitDependencies]));
}

function expandToImportAllowSet(outputAllowSet: Set<string>): Set<string> {
  const importAllowSet = new Set<string>(outputAllowSet);
  const queue = [...outputAllowSet];

  while (queue.length) {
    const currentType = queue.shift();
    if (!currentType) {
      continue;
    }

    getDependencyTypes(currentType).forEach(dependencyType => {
      if (importAllowSet.has(dependencyType)) {
        return;
      }
      importAllowSet.add(dependencyType);
      queue.push(dependencyType);
    });
  }

  return importAllowSet;
}

export function getStreamSelectionFromOptions(options: ActivityParsingOptions): StreamSelection | null {
  const requestedTypes = options.streams?.includeTypes;
  if (!requestedTypes || requestedTypes.length === 0) {
    return null;
  }

  const outputAllowSet = validateAndNormalizeRequestedTypes(requestedTypes);
  const importAllowSet = expandToImportAllowSet(outputAllowSet);
  return { importAllowSet, outputAllowSet };
}

export function isStreamTypeAllowedForImport(dataType: string, streamSelection: StreamSelection | null): boolean {
  if (!streamSelection) {
    return true;
  }
  return streamSelection.importAllowSet.has(dataType);
}

export function pruneActivityStreamsBySelection(
  activity: ActivityInterface,
  streamSelection: StreamSelection | null
): void {
  if (!streamSelection) {
    return;
  }

  activity
    .getAllStreams()
    .slice()
    .forEach(stream => {
      if (!streamSelection.outputAllowSet.has(stream.type)) {
        activity.removeStream(stream);
      }
    });
}
