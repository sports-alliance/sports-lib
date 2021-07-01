import { DataNumber } from './data.number';

export class DataAltitudeSmooth extends DataNumber {
  static type = 'Altitude Smooth';
  static unit = 'm';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
