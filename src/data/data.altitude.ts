import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

export class DataAltitude extends DataNumber {
  static type = 'Altitude';
  static unit = 'm';

  /** Rehydrates the concrete altitude metric from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue(): number | string {
    return Math.round(this.getValue());
  }
}
