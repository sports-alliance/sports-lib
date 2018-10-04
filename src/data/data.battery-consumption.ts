import {DataNumber} from './data.number';

export class DataBatteryConsumption extends DataNumber {
  static className = 'DataBatteryConsumption';

  static type = 'Battery Consumption';
  static unit = '%';
}
