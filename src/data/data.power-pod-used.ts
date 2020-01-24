import { DataBoolean } from './data.boolean';

export class DataPowerPodUsed extends DataBoolean {
  static type = 'Power Pod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
