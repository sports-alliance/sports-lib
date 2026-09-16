import { DataDistance, SportsLib, User } from '@sports-alliance/sports-lib';
import type { EventInterface, EventJSONInterface } from '@sports-alliance/sports-lib';
import {
  readFITWorkoutReferences,
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences
} from '@sports-alliance/sports-lib';
import type { FITWorkoutReferencesResult } from '@sports-alliance/sports-lib';

const references: FITWorkoutReferencesResult = readFITWorkoutReferences(new Uint8Array());
const files: DataFITTrainingFileReferences = DataFITTrainingFileReferences.fromJSON(references.trainingFiles.toJSON());
const definitions: DataFITWorkoutDefinitions = DataFITWorkoutDefinitions.fromJSON(references.workouts.toJSON());
const guides: DataSuuntoPlusGuideReferences = DataSuuntoPlusGuideReferences.fromJSON(references.suuntoGuides.toJSON());
export { references, files, definitions, guides };

const user: User = new User('commonjs-types');
const distance: DataDistance = new DataDistance(1);
const importFromJSON: (json: EventJSONInterface) => EventInterface = SportsLib.importFromJSON;

export { distance, importFromJSON, user };
