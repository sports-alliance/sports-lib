import { DataEPOC } from './data.epoc';

export class DataPeakEPOC extends DataEPOC {
  static type = 'Peak EPOC';

  getDisplayValue() {
    return this.value.toFixed(1);
  }
}
