import {DataNumber} from './data.number';

export class DataAirPower extends DataNumber {
  static type = 'Air Power';
  static unit = 'watt'; // See https://itknowledgeexchange.techtarget.com/writing-for-business/do-you-capitalize-units-of-measurement-named-for-people/

  getDisplayValue(): number {
    return Math.round(this.value);
  }
}
