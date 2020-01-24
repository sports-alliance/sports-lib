import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { DataJSONInterface } from './data.json.interface';
import { DataPositionInterface } from './data.position.interface';

export interface DataInterface extends SerializableClassInterface {
  setValue(value: number | string | string[] | DataPositionInterface): this;

  getValue(formatForDataType?: string): number | string | boolean | string[] | DataPositionInterface;

  getDisplayValue(): number | string | boolean | string[] | DataPositionInterface;

  getType(): string;

  getUnit(): string;

  getDisplayUnit(): string;

  getDisplayType(): string;

  getUnitSystem(): UnitSystem;

  toJSON(): DataJSONInterface;
}

export enum UnitSystem {
  Metric,
  Imperial
}
