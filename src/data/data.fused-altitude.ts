import {DataBoolean} from './data.boolean';

export class DataFusedAltitude extends DataBoolean {
  static className = 'DataFusedAltitude';
  static type = 'Fused Altitude';
  static unit = '';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
