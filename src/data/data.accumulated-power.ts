import {DataNumber} from './data.number';

export class DataAccumulatedPower extends DataNumber {
  static type = 'Accumulated Power';
  static unit = 'watts';

  getDisplayValue(): number {
    return Math.round(this.value);
  }
}
