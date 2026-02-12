import { DataNumber } from './data.number';

export class DataTotalFlow extends DataNumber {
  static type = 'Total Flow';
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
