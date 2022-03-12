import { DataNumber } from './data.number';

export class DataAerobicTrainingEffect extends DataNumber {
  static type = 'Aerobic Training Effect';
  static displayType = DataAerobicTrainingEffect.type;

  getDisplayValue() {
    return this.value.toFixed(1);
  }
}
