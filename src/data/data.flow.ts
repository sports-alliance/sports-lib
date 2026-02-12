import { DataNumber } from './data.number';

export class DataFlow extends DataNumber {
  static type = 'Flow';
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
