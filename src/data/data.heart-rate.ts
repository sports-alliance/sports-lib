import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

export class DataHeartRate extends DataNumber {
  static type = 'Heart Rate';
  static unit = 'bpm';

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates the concrete heart-rate metric from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
