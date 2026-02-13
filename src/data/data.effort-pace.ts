import { DataPace, DataPaceMinutesPerMile } from './data.pace';

export class DataEffortPace extends DataPace {
  static type = 'Effort Pace';

  getValue(formatForDataType?: string): number {
    if (formatForDataType && /Effort Pace in minutes per mile$/i.test(formatForDataType)) {
      return super.getValue(DataPaceMinutesPerMile.type);
    }
    return super.getValue(formatForDataType);
  }
}

export class DataEffortPaceMinutesPerMile extends DataPaceMinutesPerMile {
  static type = 'Effort Pace in minutes per mile';
  static displayType = DataEffortPace.type;
}
