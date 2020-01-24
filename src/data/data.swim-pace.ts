import { convertSwimPaceToSwimPacePer100Yard } from '../events/utilities/helpers';
import { DataDuration } from './data.duration';

export class DataSwimPace extends DataDuration {
  static type = 'Swim Pace';
  static unit = 'min/100m';

  getDisplayValue(): string {
    const d = super.getValue();
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
    if (!m && !h) {
      return '00:' + ('0' + s).slice(-2);
    } else if (!h) {
      return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    } else {
      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    }
  }

  getDisplayUnit(): string {
    return this.getUnit()
  }

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
