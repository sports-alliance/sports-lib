import { DataNumber } from './data.number';

export class DataAbsolutePressure extends DataNumber {
  static type = 'Absolute Pressure';
  static unit = 'hpa';

  getDisplayValue() {
    return this.getValue().toFixed(1);
  }
}
