import { DataNumber } from './data.number';

export abstract class DataBalance extends DataNumber {
  static unit = '%';

  getDisplayValue(): number {
    return Math.round(this.value);
  }
}
