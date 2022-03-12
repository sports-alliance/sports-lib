import { DataPercent } from './data.percent';

export class DataGradeSmooth extends DataPercent {
  static type = 'Grade Smooth';

  getDisplayValue(): number | string | string[] {
    return Math.round(this.value);
  }
}
