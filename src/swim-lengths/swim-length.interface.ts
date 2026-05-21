import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { DataCadence } from '../data/data.cadence';
import { DataDistance } from '../data/data.distance';
import { DataDuration } from '../data/data.duration';
import { DataEnergy } from '../data/data.energy';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataSpeed } from '../data/data.speed';
import { SwimLengthJSONInterface } from './swim-length.json.interface';

export interface SwimLengthInterface extends SerializableClassInterface {
  index: number;
  lapIndex: number | null;
  startDate: Date;
  endDate: Date;
  type: string;
  stroke: string | null;
  strokes: number | null;
  elapsedTime: DataDuration | null;
  timerTime: DataDuration | null;
  distance: DataDistance | null;
  poolLength: DataDistance | null;
  avgSpeed: DataSpeed | null;
  avgCadence: DataCadence | null;
  avgHeartRate: DataHeartRate | null;
  maxHeartRate: DataHeartRate | null;
  swolf: number | null;
  calories: DataEnergy | null;

  toJSON(): SwimLengthJSONInterface;
}
