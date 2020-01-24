import { DataNumber } from './data.number';

export class DataBatteryConsumption extends DataNumber {
  static type = 'Battery Consumption';
  static unit = '%';

  getDisplayValue(): number | string {
    return this.getValue().toFixed(2);
  }
}
