import { DataNumber } from './data.number';

export abstract class DataPercent extends DataNumber {
  static unit = '%';

  getDisplayValue(): number | string | string[] {
    return Math.round(this.getValue() * 10) / 10;
  }
}
