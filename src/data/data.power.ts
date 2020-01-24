import { DataNumber } from './data.number';

export class DataPower extends DataNumber {
  static type = 'Power';
  static unit = 'watt'; // See https://itknowledgeexchange.techtarget.com/writing-for-business/do-you-capitalize-units-of-measurement-named-for-people/

  getDisplayValue(): number {
    return Math.round(this.value);
  }
}
