import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {DataJSONInterface} from './data.json.interface';

export interface DataInterface extends SerializableClassInterface {
  setValue(value: number | string): void;

  getValue(): number | string | boolean;

  getDisplayValue(): number | string | boolean;

  getType(): string;

  getUnit(): string;

  getDisplayUnit(): string;

  getUnitSystem(): UnitSystem;

  toJSON(): DataJSONInterface;
}

export enum UnitSystem {
  Metric,
  Imperial
}
