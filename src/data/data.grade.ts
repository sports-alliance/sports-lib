import { DataPercent } from './data.percent';

export class DataGrade extends DataPercent {
  static type = 'Grade';

  getDisplayValue(): number | string | string[] {
    return Math.round(this.value);
  }
}
