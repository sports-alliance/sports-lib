import { DataStrokeRate } from '../data/data.stroke-rate';
import { DataDistance } from '../data/data.distance';
import { DataDuration } from '../data/data.duration';
import { DataEnergy } from '../data/data.energy';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataSpeed } from '../data/data.speed';
import { SwimLengthInterface } from './swim-length.interface';
import { SwimLengthJSONInterface } from './swim-length.json.interface';

export type SwimLengthInit = Omit<SwimLengthInterface, 'toJSON'>;

export class SwimLength implements SwimLengthInterface {
  index!: number;
  lapIndex!: number | null;
  startDate!: Date;
  endDate!: Date;
  type!: string;
  stroke!: string | null;
  strokes!: number | null;
  elapsedTime!: DataDuration | null;
  timerTime!: DataDuration | null;
  distance!: DataDistance | null;
  poolLength!: DataDistance | null;
  avgSpeed!: DataSpeed | null;
  /** Average stroke rate. The property name is retained for native JSON compatibility. */
  avgCadence!: DataStrokeRate | null;
  avgHeartRate!: DataHeartRate | null;
  maxHeartRate!: DataHeartRate | null;
  swolf!: number | null;
  calories!: DataEnergy | null;

  constructor(init: SwimLengthInit) {
    Object.assign(this, init);
  }

  static fromJSON(json: SwimLengthJSONInterface): SwimLength {
    const nullableNumber = (value: unknown): number | null => {
      if (value === null || value === undefined) {
        return null;
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === 'string' && value.trim().length > 0) {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : null;
      }

      return null;
    };

    const nullableData = <T>(value: unknown, dataConstructor: new (value: number) => T): T | null => {
      const numericValue = nullableNumber(value);
      return numericValue === null ? null : new dataConstructor(numericValue);
    };

    return new SwimLength({
      index: json.index,
      lapIndex: nullableNumber(json.lapIndex),
      startDate: new Date(json.startDate),
      endDate: new Date(json.endDate),
      type: json.type,
      stroke: json.stroke ?? null,
      strokes: nullableNumber(json.strokes),
      elapsedTime: nullableData(json.elapsedTime, DataDuration),
      timerTime: nullableData(json.timerTime, DataDuration),
      distance: nullableData(json.distance, DataDistance),
      poolLength: nullableData(json.poolLength, DataDistance),
      avgSpeed: nullableData(json.avgSpeed, DataSpeed),
      avgCadence: nullableData(json.avgCadence, DataStrokeRate),
      avgHeartRate: nullableData(json.avgHeartRate, DataHeartRate),
      maxHeartRate: nullableData(json.maxHeartRate, DataHeartRate),
      swolf: nullableNumber(json.swolf),
      calories: nullableData(json.calories, DataEnergy)
    });
  }

  toJSON(): SwimLengthJSONInterface {
    return {
      index: this.index,
      lapIndex: this.lapIndex,
      startDate: this.startDate.getTime(),
      endDate: this.endDate.getTime(),
      type: this.type,
      stroke: this.stroke,
      strokes: this.strokes,
      elapsedTime: this.elapsedTime?.getValue() ?? null,
      timerTime: this.timerTime?.getValue() ?? null,
      distance: this.distance?.getValue() ?? null,
      poolLength: this.poolLength?.getValue() ?? null,
      avgSpeed: this.avgSpeed?.getValue() ?? null,
      avgCadence: this.avgCadence?.getValue() ?? null,
      avgHeartRate: this.avgHeartRate?.getValue() ?? null,
      maxHeartRate: this.maxHeartRate?.getValue() ?? null,
      swolf: this.swolf,
      calories: this.calories?.getValue() ?? null
    };
  }
}
