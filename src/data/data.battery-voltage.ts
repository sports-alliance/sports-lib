import {DataNumber} from './data.number';

export class DataBatteryVoltage extends DataNumber {
  static type = 'Battery Voltage';
  static unit = 'V';

  getDisplayValue() {
    return this.getValue().toFixed(3)
  }
}
