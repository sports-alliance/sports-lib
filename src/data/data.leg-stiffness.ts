import {DataNumber} from './data.number';

export class DataLegStiffness extends DataNumber {
  static type = 'Leg Spring Stiffness';
  static unit = '"KN/m"';
  getDisplayValue(): string {
    return this.value.toFixed(2);
  }
}
