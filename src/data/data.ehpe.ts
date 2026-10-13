import { DataNumber } from './data.number';

/** Estimated horizontal position error in meters, displayed to one decimal place. */
export class DataEHPE extends DataNumber {
  static type = 'EHPE';
  static unit = 'm';

  /** Formats the estimate without rounding the stored value or summary calculations. */
  override getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}
