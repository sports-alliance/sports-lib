import { convertPaceToPaceInMinutesPerMile } from '../events/utilities/helpers';
import { DataPace, DataPaceMinutesPerMile } from './data.pace';

export class DataGradeAdjustedPace extends DataPace {
  static type = 'Grade Adjusted Pace';
  static unit = 'min/km';

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      case DataGradeAdjustedPaceMinutesPerMile.type:
        return convertPaceToPaceInMinutesPerMile(this.value);
      default:
        return super.getValue(formatForDataType)
    }
  }
}

export class DataGradeAdjustedPaceMinutesPerMile extends DataGradeAdjustedPace {
  static type = 'Grade Adjusted Pace in minutes per mile';
  static displayType = DataGradeAdjustedPace.type;
  static unit = 'min/m';

  getValue(formatForDataType?: string): number {
    if (formatForDataType) {
      throw new Error(`Not implemented`);
    }
    return super.getValue(formatForDataType);
  }
}
