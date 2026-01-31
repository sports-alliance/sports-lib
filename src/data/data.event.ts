import { DataNumber } from './data.number';

export abstract class DataEvent extends DataNumber {
  get timestamp(): number {
    return this.getValue();
  }
}
