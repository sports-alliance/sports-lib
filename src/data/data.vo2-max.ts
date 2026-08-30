import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

/**
 * Maximum oxygen uptake in milliliters per kilogram per minute.
 * @category Health and sleep
 */
export class DataVO2Max extends DataNumber {
  static type = 'VO2 Max';
  static displayType = 'VO₂ Max';
  static unit = 'ml/kg/min';
  static aliases = ['VO₂ Max', 'vo2_max'];

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates VO₂ max from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
