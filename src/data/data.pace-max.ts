import { DataPace, DataPaceMinutesPerMile } from './data.pace';

export class DataPaceMax extends DataPace {
  static type = 'Maximum Pace';
}

export class DataPaceMaxMinutesPerMile extends DataPaceMinutesPerMile {
  static type = 'Maximum pace in minutes per mile';
  static displayType = DataPaceMax.type;

}
