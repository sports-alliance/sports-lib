import { DataGNSSDistance } from './data.gnss-distance';

export class DataGNSSDistanceMiles extends DataGNSSDistance {
  static type = 'GNSS Distance in miles';
  static unit = 'mi';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }

  getDisplayUnit(): string {
    return 'mi';
  }
}
