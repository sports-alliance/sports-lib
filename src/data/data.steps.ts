import { DataNumber } from './data.number';

/** A step count, stored as a count and displayed as a rounded integer without a suffix. */
export class DataSteps extends DataNumber {
  static type = 'Steps';
  static unit = 'count';
  static aliases = ['steps'];

  getDisplayValue(): number {
    return Math.round(this.getValue());
  }

  getDisplayUnit(): string {
    return '';
  }
}
