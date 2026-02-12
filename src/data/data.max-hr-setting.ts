import { DataNumber } from './data.number';

export class DataMaxHRSetting extends DataNumber {
  static type = 'Maximum HR Setting';
  static aliases = ['Max HR Setting'];
  static unit = 'bpm';
}
