import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

/**
 * Body weight in kilograms.
 * @category Health and sleep
 */
export class DataWeight extends DataNumber {
  static type = 'Weight';
  static unit = 'kg';
  static aliases = ['Body Weight', 'body_weight'];

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates body weight from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}
