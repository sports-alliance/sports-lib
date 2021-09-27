import { DataDuration } from './data.duration';
import { convertPaceToPaceInMinutesPerMile } from '../events/utilities/helpers';

export class DataPace extends DataDuration {
  static type = 'Pace';
  static unit = 'min/km';

  getDisplayValue(): string {
    if (this.getValue() === Infinity || this.getValue() === -Infinity) {
      return '00:00';
    }
    const d = this.getValue();
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    if (!m && !h) {
      return '00:' + ('0' + s).slice(-2);
    } else if (!h) {
      return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    } else {
      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    }
  }

  getDisplayUnit(): string {
    return this.getUnit();
  }

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      case DataPaceMinutesPerMile.type:
        return convertPaceToPaceInMinutesPerMile(this.value);
      default:
        return super.getValue(formatForDataType);
    }
  }
}

export class DataPaceMinutesPerMile extends DataPace {
  static type = 'Pace in minutes per mile';
  static displayType = DataPace.type;
  static unit = 'min/m';

  getValue(formatForDataType?: string): number {
    if (formatForDataType) {
      throw new Error(`Not implemented`);
    }
    return super.getValue(formatForDataType);
  }
}
