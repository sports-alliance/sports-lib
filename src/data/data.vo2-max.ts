import { DataNumber } from './data.number';

export class DataVO2Max extends DataNumber {
  static type = 'VO2 Max';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
