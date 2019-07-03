import {DataNumber} from './data.number';

export class DataTotalTrainingEffect extends DataNumber {
  static type = 'Total Training effect';
  getDisplayValue() {
    return this.value.toFixed(1)
  }
}
