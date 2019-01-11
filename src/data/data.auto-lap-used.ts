import {DataBoolean} from './data.boolean';

export class DataAutoLapUsed extends DataBoolean {
  static type = 'Auto lap';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
