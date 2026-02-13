import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';

export class DataEffortPaceMax extends DataEffortPace {
  static type = 'Maximum Effort Pace';
  static aliases = ['Effort Pace Max'];
}

export class DataEffortPaceMaxMinutesPerMile extends DataEffortPaceMinutesPerMile {
  static type = 'Maximum Effort Pace in minutes per mile';
  static displayType = DataEffortPaceMax.type;
}
