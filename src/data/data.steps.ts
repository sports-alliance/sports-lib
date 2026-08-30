import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

/** A step count, stored as a count and displayed as a rounded integer without a suffix. */
export class DataSteps extends DataNumber {
  static type = 'Steps';
  static unit = 'count';
  static aliases = ['steps'];

  /** Rehydrates a step count from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue(): number {
    return Math.round(this.getValue());
  }

  getDisplayUnit(): string {
    return '';
  }
}
