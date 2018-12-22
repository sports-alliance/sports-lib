import {DataNumber} from './data.number';

export class DataHeartRate extends DataNumber {
  static type = 'Heart Rate';
  static unit = 'bpm';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
