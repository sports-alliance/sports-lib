import { DataNumber } from './data.number';

export class DataTotalAnaerobicEffect extends DataNumber {
  static type = 'Total Anaerobic effect';
  static displayType = 'Total Anaerobic Effect';

  getDisplayValue() {
    return this.value.toFixed(1);
  }
}
