import { DataBoolean } from './data.boolean';

export class DataHeartRateUsed extends DataBoolean {
  static type = 'Heart Rate Used';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
