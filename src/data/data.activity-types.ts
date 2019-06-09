import {DataArray} from './data.array';

export class DataActivityTypes extends DataArray {
  static type = 'Activity Types';
  getDisplayValue(): string {
    return this.getValue().join(', ');
  }
}
