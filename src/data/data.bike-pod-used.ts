import { DataBoolean } from './data.boolean';

export class DataBikePodUsed extends DataBoolean {
  static type = 'Bike Pod';

  getDisplayValue() {
    return this.getValue() ? 'Yes' : 'No';
  }
}
