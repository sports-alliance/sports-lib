import { DataNumber } from './data.number';

export class DataAltitude extends DataNumber {
  static type = 'Altitude';
  static unit = 'm';

  getDisplayValue(): number | string {
    return Math.round(this.getValue());
  }
}
