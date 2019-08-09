import {DataDuration} from './data.duration';

export class DataIBI extends DataDuration {
  static type = 'IBI';
  static unit = 'ms';
  getDisplayValue() {
    return this.value.toFixed(0);
  }
}
