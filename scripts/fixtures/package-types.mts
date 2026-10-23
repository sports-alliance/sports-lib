import { DataDistance, SportsLib, User } from '@sports-alliance/sports-lib';
import type { EventInterface, EventJSONInterface } from '@sports-alliance/sports-lib';
import { DataDistance as MetricsDistance, DynamicDataLoader } from '@sports-alliance/sports-lib/metrics';
import type { ActivityInterface as MetricsActivity } from '@sports-alliance/sports-lib/metrics';
import { EventSummary as MetricsSummary } from '@sports-alliance/sports-lib/metrics';
import type { EventSummary, EventSummaryJSONInterface } from '@sports-alliance/sports-lib';

export function readSummary(json: EventSummaryJSONInterface): number | undefined {
  const summary: EventSummary = MetricsSummary.fromJSON(json);
  const value: number | undefined = summary.getStat<number>(DataDistance.type)?.getValue();
  // @ts-expect-error Summaries must not masquerade as editable/exportable full events.
  const event: EventInterface = summary;
  void event;
  return value;
}

export const metricsDistance: DataDistance = new MetricsDistance(1);
export const metricsLoader: typeof import('@sports-alliance/sports-lib').DynamicDataLoader = DynamicDataLoader;
export type MetricsActivityCompatibility =
  MetricsActivity extends import('@sports-alliance/sports-lib').ActivityInterface ? true : never;
export const metricsActivityCompatibility: MetricsActivityCompatibility = true;
import {
  readFITWorkoutReferences,
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences
} from '@sports-alliance/sports-lib';
import type {
  FITWorkoutReferencesResult,
  FITTrainingFileReferencesValue,
  FITWorkoutDefinitionsValue,
  SuuntoPlusGuideReferencesValue
} from '@sports-alliance/sports-lib';

const references: FITWorkoutReferencesResult = readFITWorkoutReferences(new Uint8Array());
const files: DataFITTrainingFileReferences = DataFITTrainingFileReferences.fromJSON(references.trainingFiles.toJSON());
const definitions: DataFITWorkoutDefinitions = DataFITWorkoutDefinitions.fromJSON(references.workouts.toJSON());
const guides: DataSuuntoPlusGuideReferences = DataSuuntoPlusGuideReferences.fromJSON(references.suuntoGuides.toJSON());
const emptyFiles: FITTrainingFileReferencesValue = { references: [] };
const emptyDefinitions: FITWorkoutDefinitionsValue = { definitions: [] };
const emptyGuides: SuuntoPlusGuideReferencesValue = { references: [] };
files.setValue(emptyFiles);
definitions.setValue(emptyDefinitions);
guides.setValue(emptyGuides);
export { references, files, definitions, guides };

const user: User = new User('esm-types');
const distance: DataDistance = new DataDistance(1);
const importFromJSON: (json: EventJSONInterface) => EventInterface = SportsLib.importFromJSON;

export { distance, importFromJSON, user };

// These checks run against the packed declarations under strictNullChecks.
type TimedEntity =
  | EventInterface
  | import('@sports-alliance/sports-lib').ActivityInterface
  | import('@sports-alliance/sports-lib').LapInterface;
export function optionalTiming(entity: TimedEntity) {
  const absent: { [K in 'getDuration' | 'getTimer' | 'getMovingTime' | 'getPause']: ReturnType<TimedEntity[K]> } = {
    getDuration: undefined,
    getTimer: undefined,
    getMovingTime: undefined,
    getPause: undefined
  };
  // @ts-expect-error A missing duration must be checked before dereferencing it.
  entity.getDuration().getValue();
  // @ts-expect-error A missing timer must be checked before dereferencing it.
  entity.getTimer().getValue();
  // @ts-expect-error A missing moving time must be checked before dereferencing it.
  entity.getMovingTime().getValue();
  // @ts-expect-error A missing pause must be checked before dereferencing it.
  entity.getPause().getValue();
  const seconds: Array<number | undefined> = [
    entity.getDuration()?.getValue(),
    entity.getTimer()?.getValue(),
    entity.getMovingTime()?.getValue(),
    entity.getPause()?.getValue()
  ];
  return { absent, seconds };
}
