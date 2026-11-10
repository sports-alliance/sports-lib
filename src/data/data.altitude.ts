import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';
import { ElevationUnits } from '../users/settings/user.unit.settings.interface';

const METERS_PER_FOOT = 0.3048;

export class DataAltitude extends DataNumber {
  static type = 'Altitude';
  static unit = 'm';

  /** Canonical metres are retained by getValue(), getUnit() and JSON; units affect display only. */
  constructor(
    value: number,
    private readonly displayUnits: ElevationUnits = ElevationUnits.Meters
  ) {
    super(value);
  }

  /** Converts an unrounded user-entered elevation to canonical metres, retaining the concrete metric. */
  static fromDisplayValue<TData extends DataAltitude>(
    this: new (value: number) => TData,
    value: number,
    units: ElevationUnits
  ): TData {
    if (units === ElevationUnits.Meters) return new this(value);
    if (units === ElevationUnits.Feet) return new this(value * METERS_PER_FOOT);
    throw new Error('Unsupported elevation display unit');
  }

  /** Unrounded presentation value for numeric inputs; never persist this value directly. */
  getDisplayNumericValue(): number {
    return this.displayUnits === ElevationUnits.Feet ? this.getValue() / METERS_PER_FOOT : this.getValue();
  }

  getDisplayUnit(): string {
    return this.displayUnits;
  }

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates the concrete altitude metric from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue(): number | string {
    return Math.round(this.getDisplayNumericValue());
  }
}
