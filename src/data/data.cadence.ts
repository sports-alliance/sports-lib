import {DataNumber} from './data.number';

export class DataCadence extends DataNumber {
  static type = 'Cadence';
  static unit = 'rpm';
  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
