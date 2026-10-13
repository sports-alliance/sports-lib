import { DataNumber } from './data.number';

/** Estimated vertical position error in meters, displayed to one decimal place. */
export class DataEVPE extends DataNumber {
  static type = 'EVPE';
  static unit = 'm';

  /** Formats the estimate without rounding the stored value or summary calculations. */
  override getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}
