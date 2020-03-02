import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';

export class DataGradeAdjustedPaceMin extends DataGradeAdjustedPace {
  static type = 'Minimum Grade Adjusted Pace';
}

export class DataGradeAdjustedPaceMinMinutesPerMile extends DataGradeAdjustedPaceMinutesPerMile {
  static type = 'Minimum Grade Adjusted pace in minutes per mile';
  static displayType = DataGradeAdjustedPaceMin.type;
  static unit = 'min/m';

  getValue(formatForDataType?: string): number {
    if (formatForDataType) {
      throw new Error(`Not implemented`);
    }
    return super.getValue(formatForDataType);
  }
}
