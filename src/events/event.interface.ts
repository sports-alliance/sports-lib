import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StatsClassInterface} from '../stats/stats.class.interface';
import {ActivityInterface} from '../activities/activity.interface';
import {DurationClassInterface} from '../duration/duration.class.interface';
import {EventJSONInterface} from './event.json.interface';
import {IDClassInterface} from '../id/id.class.interface';
import {PrivacyClassInterface} from '../privacy/privacy.class.interface';
import {MetaDataInterface} from '../meta-data/meta-data.interface';

export interface EventInterface extends StatsClassInterface,
  DurationClassInterface,
  PrivacyClassInterface,
  SerializableClassInterface,
  IDClassInterface {

  name: string;
  description?: string;
  isMerge: boolean;

  addActivity(activity: ActivityInterface): void;

  addActivities(activities: ActivityInterface[]): void;

  removeActivity(activity: ActivityInterface): void;

  getActivities(): ActivityInterface[];

  getActivityTypesAsArray(): string[];
  getActivityTypesAsString(): string;
  getDeviceNamesAsString(): string;

  clearActivities(): void;

  getFirstActivity(): ActivityInterface;

  getLastActivity(): ActivityInterface;

  toJSON(): EventJSONInterface;

}
