import { DataNumber } from './data.number';

export class DataGroundContactTime extends DataNumber {
  static type = 'Ground Contact Time';
  static unit = 'ms';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
