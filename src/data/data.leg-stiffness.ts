import {DataNumber} from './data.number';

export class DataLegStiffness extends DataNumber {
  static className = 'DataLegStiffness';
  static type = 'Leg Stiffness';

  getDisplayValue(): string{
    return this.value.toFixed(2);
  }
}
