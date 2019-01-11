import {DataBoolean} from './data.boolean';

export class DataAutoPauseUsed extends DataBoolean {
  static type = 'Auto Pause';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
