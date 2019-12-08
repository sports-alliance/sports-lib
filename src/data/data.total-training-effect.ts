import {DataNumber} from './data.number';

export class DataTotalTrainingEffect extends DataNumber {
  static type = 'Total Training effect';
  static displayType = 'Total Training Effect';

  getDisplayValue() {
    return this.value.toFixed(1)
  }
}
