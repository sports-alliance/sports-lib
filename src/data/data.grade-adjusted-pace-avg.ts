import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';

export class DataGradeAdjustedPaceAvg extends DataGradeAdjustedPace {
  static type = 'Average Grade Adjusted Pace';
}

export class DataGradeAdjustedPaceAvgMinutesPerMile extends DataGradeAdjustedPaceMinutesPerMile {
  static type = 'Average Grade Adjusted Pace in minutes per mile';
  static displayType = DataGradeAdjustedPaceAvg.type;
  static unit = 'min/m';

  getValue(formatForDataType?: string): number {
    if (formatForDataType) {
      throw new Error(`Not implemented`);
    }
    return super.getValue(formatForDataType);
  }
}
