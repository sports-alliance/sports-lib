import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { DurationClassInterface } from '../duration/duration.class.interface';
import { LapTypes } from './lap.types';
import { LapJSONInterface } from './lap.json.interface';
export interface LapInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface {
    type: LapTypes;
    toJSON(): LapJSONInterface;
}
