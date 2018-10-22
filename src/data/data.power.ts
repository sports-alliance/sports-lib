import {DataNumber} from './data.number';

export class DataPower extends DataNumber {
  static className = 'DataPower';
  static type = 'Power';
  static unit = 'watts';

  // For Power it's always number
  getValue(): number{
    return Math.round(this.value);
  }
}
