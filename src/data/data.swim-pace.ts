import { convertSwimPaceToSwimPacePer100Yard } from '../events/utilities/helpers';
import { DataDuration } from './data.duration';
import { DataPace } from './data.pace';

export class DataSwimPace extends DataPace {
  static type = 'Swim Pace';
  static unit = 'min/100m';

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      case DataSwimPaceMinutesPer100Yard.type:
        return convertSwimPaceToSwimPacePer100Yard(this.value);
      default:
        return super.getValue(formatForDataType);
    }
  }
}

export class DataSwimPaceMinutesPer100Yard extends DataSwimPace {
  static type = 'Swim Pace in minutes per 100 yard';
  static displayType = DataSwimPace.type;
  static unit = 'min/100yrd';
}
