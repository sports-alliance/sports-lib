import { DataNumber } from './data.number';

export class DataAvgRespirationRate extends DataNumber {
  static type = 'Average Respiration Rate';
  static aliases = ['Avg Respiration Rate', 'Respiration Rate Avg'];
  static unit = 'br/min';
}
