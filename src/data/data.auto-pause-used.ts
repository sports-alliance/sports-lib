import {DataBoolean} from './data.boolean';

export class DataAutoPauseUsed extends DataBoolean {
  static type = 'AutoPause';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
