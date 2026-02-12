import { DataNumber } from './data.number';

export class DataAvgGrit extends DataNumber {
  static type = 'Average Grit';
  static aliases = ['Avg Grit'];
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
