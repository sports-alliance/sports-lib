import { ActivityParsingOptions } from '../activities/activity-parsing-options';
import { ActivityInterface } from '../activities/activity.interface';
import { DynamicDataLoader } from '../data/data.store';
import { ParsingEventLibError } from '../errors/parsing-event-lib.error';
import { getDependencyTypesForResolution } from './stream.derivation.registry';

export interface StreamSelection {
  importAllowSet: Set<string>;
  outputAllowSet: Set<string>;
}

function validateAndNormalizeRequestedTypes(requestedTypes: string[]): Set<string> {
  const normalizedTypes = new Set<string>();
  const unknownTypes: string[] = [];

  requestedTypes.forEach(type => {
    const normalizedType = typeof type === 'string' ? type.trim() : String(type);

    try {
      const dataClass = DynamicDataLoader.getDataClassFromDataType(normalizedType);
      normalizedTypes.add(dataClass.type);
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
  const explicitDependencies = getDependencyTypesForResolution(dataType);
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
