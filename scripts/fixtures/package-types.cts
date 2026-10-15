import { DataDistance, SportsLib, User } from '@sports-alliance/sports-lib';
import type { EventInterface, EventJSONInterface } from '@sports-alliance/sports-lib';
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

const user: User = new User('commonjs-types');
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
