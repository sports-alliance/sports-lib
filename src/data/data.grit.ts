import { DataNumber } from './data.number';

export class DataGrit extends DataNumber {
  static type = 'Grit';
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
