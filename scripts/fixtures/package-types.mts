import { DataDistance, SportsLib, User } from '@sports-alliance/sports-lib';
import type { EventInterface, EventJSONInterface } from '@sports-alliance/sports-lib';

const user: User = new User('esm-types');
const distance: DataDistance = new DataDistance(1);
const importFromJSON: (json: EventJSONInterface) => EventInterface = SportsLib.importFromJSON;

export { distance, importFromJSON, user };
