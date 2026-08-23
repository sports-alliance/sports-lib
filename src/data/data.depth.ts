import { DataNumber } from './data.number';
import { UnitSystem } from './data.interface';

export class DataDepth extends DataNumber {
  static type = 'Depth';
  static unit = 'm';

  getDisplayValue(): string {
    return this.getValue().toFixed(3);
  }
}

/** Imperial presentation variant of the canonical meter-based depth stream. */
export class DataDepthFeet extends DataDepth {
  static override type = 'Depth in feet';
  static override displayType = DataDepth.type;
  static override unit = 'ft';
  static override unitSystem = UnitSystem.Imperial;
}
