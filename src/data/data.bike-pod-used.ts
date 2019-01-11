import {DataBoolean} from './data.boolean';

export class DataBikePodUsed extends DataBoolean {
  static type = 'BikePod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
