import { DataDistance } from './data.distance';
import { formatMeterDistanceDisplayValue } from './data.meter-distance-display';

export class DataSwimDistance extends DataDistance {
  static override type = DataDistance.type;
  static override unit = DataDistance.unit;
  static override displayType = DataDistance.type;

  override getDisplayValue(): string {
    return formatMeterDistanceDisplayValue(this.getValue());
  }

  override getDisplayUnit(): string {
    return DataDistance.unit;
  }
}
