import { DataNumber } from './data.number';

export class DataNumberOfSatellites extends DataNumber {
  static type = 'Number of Satellites';

  getDisplayValue() {
    return this.getValue().toFixed(0)
  }
}
