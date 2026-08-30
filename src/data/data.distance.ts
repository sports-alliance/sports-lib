import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

export class DataDistance extends DataNumber {
  static type = 'Distance';
  static unit = 'm';

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates the concrete distance metric from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  getDisplayValue() {
    return this.getValue() >= 1000 ? (this.getValue() / 1000).toFixed(2) : this.getValue().toFixed(1);
  }

  getDisplayUnit(): string {
    return this.getValue() >= 1000 ? 'Km' : 'm';
  }
}

export class DataDistanceMiles extends DataDistance {
  static type = 'Distance in miles';
  static unit = 'mi';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }

  getDisplayUnit(): string {
    return 'mi';
  }
}

export class DataDistanceFeet extends DataDistance {
  static type = 'Distance in feet';
  static unit = 'ft';

  getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }

  getDisplayUnit(): string {
    return 'ft';
  }
}
