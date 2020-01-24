import { DataNumber } from './data.number';

export class DataTemperature extends DataNumber {
  static type = 'Temperature';
  static unit = '°C';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
