import { DataGNSSDistance } from './data.gnss-distance';
import { UnitSystem } from './data.interface';

export class DataGNSSDistanceMiles extends DataGNSSDistance {
  static type = 'GNSS Distance in miles';
  static unit = 'mi';
  static override unitSystem = UnitSystem.Imperial;

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }

  getDisplayUnit(): string {
    return 'mi';
  }
}
