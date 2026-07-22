import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { DataJSONInterface } from './data.json.interface';
import { DataPositionInterface } from './data.position.interface';

export type DefaultDataValue = number | string | boolean | string[] | DataPositionInterface;
export type DefaultDataClassValue = DefaultDataValue | unknown[];

/**
 * A typed metric value. Data objects retain the canonical metric type and unit alongside their value.
 */
export interface DataInterface<TValue = DefaultDataValue> extends SerializableClassInterface {
  setValue(value: TValue): this;

  getValue(_formatForDataType?: string): TValue;

  getDisplayValue(): number | string | boolean | string[] | DataPositionInterface;

  getType(): string;

  getUnit(): string;

  getDisplayUnit(): string;

  getDisplayType(): string;

  getUnitSystem(): UnitSystem;

  isValueTypeValid(value: unknown): boolean;

  toJSON(): DataJSONInterface;
}

export enum UnitSystem {
  Metric,
  Imperial
}
