import { DataBoolean } from './data.boolean';

export class DataFootPodUsed extends DataBoolean {
  static type = 'Foot Pod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
