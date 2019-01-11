import {DataBoolean} from './data.boolean';

export class DataPowerPodUsed extends DataBoolean {
  static type = 'PowerPod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
