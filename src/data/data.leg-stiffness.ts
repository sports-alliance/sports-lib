import {DataNumber} from './data.number';


// Due to legacy
export class DataLegStiffness extends DataNumber {
  static type = 'Leg Stiffness';
  static unit = '"KN/m"';
  getDisplayValue(): string {
    return this.value.toFixed(2);
  }
}

export class DataLegSpringStiffness extends DataNumber {
  static type = 'Leg Spring Stiffness';
  static unit = '"KN/m"';
  getDisplayValue(): string {
    return this.value.toFixed(2);
  }
}
