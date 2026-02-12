import { DataNumber } from './data.number';

export class DataTotalGrit extends DataNumber {
  static type = 'Total Grit';
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
