import { DataNumber } from './data.number';
import { formatMeterDistanceDisplayValue } from './data.meter-distance-display';

export class DataPoolLength extends DataNumber {
  static type = 'Pool Length';
  static unit = 'm';

  getDisplayValue(): string {
    return formatMeterDistanceDisplayValue(this.getValue());
  }
}
