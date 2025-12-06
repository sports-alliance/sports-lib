import { DataNumber } from './data.number';

export class DataAnaerobicTrainingEffect extends DataNumber {
  static type = 'Anaerobic Training Effect';
  static displayType = DataAnaerobicTrainingEffect.type;

  getDisplayValue() {
    return this.value.toFixed(1);
  }
}
