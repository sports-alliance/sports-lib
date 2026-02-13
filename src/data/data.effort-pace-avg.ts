import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';

export class DataEffortPaceAvg extends DataEffortPace {
  static type = 'Average Effort Pace';
  static aliases = ['Effort Pace Avg'];
}

export class DataEffortPaceAvgMinutesPerMile extends DataEffortPaceMinutesPerMile {
  static type = 'Average Effort Pace in minutes per mile';
  static displayType = DataEffortPaceAvg.type;
}
