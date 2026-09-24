import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';
import { WeightUnits } from '../users/settings/user.unit.settings.interface';

const KILOGRAMS_PER_POUND = 0.45359237;

/**
 * Body weight in kilograms.
 * @category Health and sleep
 */
export class DataWeight extends DataNumber {
  static type = 'Weight';
  static unit = 'kg';
  static aliases = ['Body Weight', 'body_weight'];

  /** Converts a kg/lb input to a canonical kilogram value for storage. */
  static fromDisplayValue(value: number, units: WeightUnits): DataWeight {
    if (units === WeightUnits.Kilograms) return new DataWeight(value);
    if (units === WeightUnits.Pounds) return new DataWeight(value * KILOGRAMS_PER_POUND);
    throw new Error('Unsupported weight display unit');
  }

  /** The value and JSON remain kilograms; this choice affects display only. */
  constructor(
    value: number,
    private readonly displayUnits: WeightUnits = WeightUnits.Kilograms
  ) {
    super(value);
  }

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
    const value = this.displayUnits === WeightUnits.Pounds ? this.getValue() / KILOGRAMS_PER_POUND : this.getValue();
    return value.toFixed(1);
  }

  getDisplayUnit(): string {
    return this.displayUnits;
  }
}
