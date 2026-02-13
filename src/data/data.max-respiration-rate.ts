import { DataNumber } from './data.number';

export class DataMaxRespirationRate extends DataNumber {
  static type = 'Maximum Respiration Rate';
  static aliases = ['Max Respiration Rate', 'Respiration Rate Max'];
  static unit = 'br/min';
}
