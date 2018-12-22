import {DataBoolean} from './data.boolean';

export class DataFusedLocation extends DataBoolean {
  static type = 'Fused Location';
  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
