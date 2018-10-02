import {DataNumber} from './data.number';

export class DataBatteryVoltage extends DataNumber {
  static className = 'DataBatteryVoltage';

  static type = 'Battery Voltage';
  static unit = 'V';
}
