import { DataNumber } from './data.number';
import { DataDistanceMiles } from './data.distance';
import { convertMetersToMiles } from '../events/utilities/helpers';

export class DataJumpDistance extends DataNumber {
  static type = 'Jump Distance';
  static unit = 'm';

  constructor(value: number) {
    super(value);
  }

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      case DataDistanceMiles.type:
        return convertMetersToMiles(this.value);
      default:
        return super.getValue(formatForDataType);
    }
  }

  getDisplayValue(): string {
    // Always display in meters with 2 decimal places (e.g. 2.07)
    return this.getValue().toFixed(2);
  }
}
