import { DataBoolean } from './data.boolean';

export class DataFusedAltitude extends DataBoolean {
  static type = 'Fused Altitude';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
