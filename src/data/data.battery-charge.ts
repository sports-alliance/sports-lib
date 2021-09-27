import { DataNumber } from './data.number';

export class DataBatteryCharge extends DataNumber {
  static type = 'Battery Charge';
  static unit = '%';

  getDisplayValue() {
    return this.getValue().toFixed(3);
  }
}
