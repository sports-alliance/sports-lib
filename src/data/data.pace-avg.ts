import {DataPace, DataPaceMinutesPerMile} from './data.pace';

export class DataPaceAvg extends DataPace {
  static type = 'Average Pace';
}

export class DataPaceAvgMinutesPerMile extends DataPaceMinutesPerMile {
  static type = 'Average pace in minutes per mile';
  static displayType = DataPaceAvg.type;

}
