import { TimingValidity } from '../duration/timing-validity';
import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { DurationClassInterface } from '../duration/duration.class.interface';
import { LapTypes } from './lap.types';
import { LapJSONInterface } from './lap.json.interface';
import { ActivityInterface } from '../activities/activity.interface';

export interface LapInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface {
  /** Rejected source timing, retained independently of usable values. */
  timingValidity?: TimingValidity;
  /** Source identifier, preserved by native JSON hydration when a nonnegative safe integer; not a row ordinal. */
  lapId: number;

  type: LapTypes;

  getStartIndex(activity: ActivityInterface): number;

  getEndIndex(activity: ActivityInterface): number;

  toJSON(activity?: ActivityInterface): LapJSONInterface;
}
