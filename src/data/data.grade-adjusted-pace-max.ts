import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';

export class DataGradeAdjustedPaceMax extends DataGradeAdjustedPace {
  static type = 'Maximum Grade Adjusted Pace';
}

export class DataGradeAdjustedPaceMaxMinutesPerMile extends DataGradeAdjustedPaceMinutesPerMile {
  static type = 'Maximum Grade Adjusted Pace in minutes per mile';
  static displayType = DataGradeAdjustedPaceMax.type;
  static unit = 'min/m';

  getValue(formatForDataType?: string): number {
    if (formatForDataType) {
      throw new Error(`Not implemented`);
    }
    return super.getValue(formatForDataType);
  }
}
