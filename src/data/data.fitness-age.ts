import { DataNumber } from './data.number';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';

/**
 * Provider-calculated fitness age in years.
 * @category Health and sleep
 */
export class DataFitnessAge extends DataNumber {
  static type = 'Fitness Age';
  static unit = 'years';
  static aliases = ['fitness_age'];

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /** Rehydrates fitness age from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }
}
