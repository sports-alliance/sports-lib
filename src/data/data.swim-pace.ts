import {DataPace} from './data.pace';

export class DataSwimPace extends DataPace {
  static type = 'Swim Pace';
  static unit = 'min/100m';

  getDisplayValue(): string {
    const d = this.getValue();
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
}

export class DataSwimPaceMinutesPer100Yard extends DataSwimPace {
  static type = 'Swim Pace in minutes per 100 yard';
  static displayType = DataSwimPace.type;
  static unit = 'min/100yrd';
}
