import {DataNumber} from './data.number';

export class DataBatteryCurrent extends DataNumber {
  static type = 'Battery Current';
  static unit = 'mA';

  getDisplayValue() {
    return this.getValue().toFixed(3)
  }
}
