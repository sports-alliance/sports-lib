import { DataPercent } from './data.percent';

export abstract class DataBalance extends DataPercent {
  getDisplayValue(): number {
    return Math.round(this.value);
  }
}
