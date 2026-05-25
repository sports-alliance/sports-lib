import { DataDistance } from './data.distance';

export class DataSwimDistance extends DataDistance {
  static override type = DataDistance.type;
  static override unit = DataDistance.unit;
  static override displayType = DataDistance.type;

  override getDisplayValue(): string {
    return String(this.getValue());
  }

  override getDisplayUnit(): string {
    return DataDistance.unit;
  }
}
