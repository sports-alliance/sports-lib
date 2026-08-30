import { DataJSONInterface } from './data.json.interface';

export type ScalarDataJSONValue = number | string | boolean;

export interface ScalarDataConstructor<TValue extends ScalarDataJSONValue, TData> {
  readonly type: string;
  new (value: TValue): TData;
}

/**
 * Rehydrates a scalar Data class from its canonical single-key JSON representation.
 * Alias keys and additional properties are rejected so persisted data always returns
 * through the same canonical token emitted by Data.toJSON().
 */
export function scalarDataFromJSON<TValue extends ScalarDataJSONValue, TData>(
  dataClass: ScalarDataConstructor<TValue, TData>,
  json: DataJSONInterface
): TData {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error(`Invalid JSON for '${dataClass.type}': expected a canonical single-key object`);
  }

  const keys = Object.keys(json);
  if (keys.length !== 1 || keys[0] !== dataClass.type) {
    throw new Error(`Invalid JSON for '${dataClass.type}': expected only the canonical '${dataClass.type}' key`);
  }

  const value = json[dataClass.type];
  if (value === null || !['number', 'string', 'boolean'].includes(typeof value)) {
    throw new Error(`Invalid JSON for '${dataClass.type}': expected a scalar value`);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`Invalid JSON for '${dataClass.type}': expected a finite number`);
  }

  return new dataClass(value as TValue);
}
