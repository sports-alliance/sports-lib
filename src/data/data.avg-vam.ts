import { DataNumber } from './data.number';

export class DataAvgVAM extends DataNumber {
  static type = 'Average VAM';
  static aliases = ['Avg VAM'];
  static unit = 'm/h';

  getDisplayValue(): string {
    return this.getValue().toFixed(0);
  }
}
