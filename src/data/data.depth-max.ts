import { DataNumber } from './data.number';
import { UnitSystem } from './data.interface';

export class DataDepthMax extends DataNumber {
  static type = 'Maximum Depth';
  static unit = 'm';

  getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}

/** Imperial presentation variant of the canonical meter-based maximum-depth stat. */
export class DataDepthMaxFeet extends DataDepthMax {
  static override type = 'Maximum Depth in feet';
  static override unit = 'ft';
  static override unitSystem = UnitSystem.Imperial;
}
