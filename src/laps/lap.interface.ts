import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { DurationClassInterface } from '../duration/duration.class.interface';
import { LapTypes } from './lap.types';
import { LapJSONInterface } from './lap.json.interface';
import { ActivityInterface } from '../activities/activity.interface';

export interface LapInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface {
  type: LapTypes;

  getStartIndex(activity: ActivityInterface): number;

  getEndIndex(activity: ActivityInterface): number;

  toJSON(activity?: ActivityInterface): LapJSONInterface;
}
