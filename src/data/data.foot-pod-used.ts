import {DataBoolean} from './data.boolean';

export class DataFootPodUsed extends DataBoolean {
  static type = 'FootPod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
