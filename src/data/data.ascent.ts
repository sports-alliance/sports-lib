import { DataAltitude } from './data.altitude';
import {
  formatAscentDescentDisplayValue,
  type AscentDescentDisplayOptions,
} from './data.ascent-descent-display';

export class DataAscent extends DataAltitude {
  static type = 'Ascent';

  getDisplayValue(options?: AscentDescentDisplayOptions): string {
    return formatAscentDescentDisplayValue(this.getValue(), options);
  }
}
