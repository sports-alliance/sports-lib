import { DataNumber } from './data.number';

export class DataAvgFlow extends DataNumber {
  static type = 'Average Flow';
  static aliases = ['Avg Flow'];
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
