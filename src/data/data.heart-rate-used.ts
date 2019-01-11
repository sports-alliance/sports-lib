import {DataBoolean} from './data.boolean';

export class DataHeartRateUsed extends DataBoolean {
  static type = 'HR';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
