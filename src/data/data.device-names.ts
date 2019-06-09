import {DataArray} from './data.array';

export class DataDeviceNames extends DataArray {
  static type = 'Device Names';
  getDisplayValue(): string {
    return this.getValue().join(', ');
  }
}
