import { DataNumber } from './data.number';

/** Maximum oxygen uptake in milliliters per kilogram per minute. */
export class DataVO2Max extends DataNumber {
  static type = 'VO2 Max';
  static displayType = 'VO₂ Max';
  static unit = 'ml/kg/min';
  static aliases = ['VO₂ Max', 'vo2_max'];

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
