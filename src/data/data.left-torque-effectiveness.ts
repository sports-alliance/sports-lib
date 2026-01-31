import { DataNumber } from './data.number';

export class DataLeftTorqueEffectiveness extends DataNumber {
  static type = 'Left Torque Effectiveness';
  static unit = '%';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
