import {DataPace, DataPaceMinutesPerMile} from './data.pace';

export class DataPaceMin extends DataPace {
  static type = 'Minimum Pace';
}
export class DataPaceMinMinutesPerMile extends DataPaceMinutesPerMile {
  static type = 'Minimum pace in minutes per mile';
  static displayType = DataPaceMin.type;
}
