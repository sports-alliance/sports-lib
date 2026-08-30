import { DataNumber } from './data.number';

/** Body weight in kilograms. */
export class DataWeight extends DataNumber {
  static type = 'Weight';
  static unit = 'kg';
  static aliases = ['Body Weight', 'body_weight'];

  getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}
