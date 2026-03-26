import { DataAltitude } from './data.altitude';
import {
  formatAscentDescentDisplayValue,
  type AscentDescentDisplayOptions,
} from './data.ascent-descent-display';

export class DataDescent extends DataAltitude {
  static type = 'Descent';

  getDisplayValue(options?: AscentDescentDisplayOptions): string {
    return formatAscentDescentDisplayValue(this.getValue(), options);
  }
}
