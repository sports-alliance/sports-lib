import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StatsClassInterface} from '../stats/stats.class.interface';
import {ActivityInterface} from '../activities/activity.interface';
import {DurationClassInterface} from '../duration/duration.class.interface';
import {EventJSONInterface} from './event.json.interface';
import {IDClassInterface} from '../id/id.class.interface';

export interface EventInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface, IDClassInterface {

  name: string;

  addActivity(activity: ActivityInterface): void;

  removeActivity(activity: ActivityInterface): void;

  getActivities(): ActivityInterface[];

  clearActivities(): void;

  getFirstActivity(): ActivityInterface;

  getLastActivity(): ActivityInterface;

  toJSON(): EventJSONInterface;
}
