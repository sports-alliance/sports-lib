import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';

export class DataEffortPaceMin extends DataEffortPace {
  static type = 'Minimum Effort Pace';
  static aliases = ['Effort Pace Min'];
}

export class DataEffortPaceMinMinutesPerMile extends DataEffortPaceMinutesPerMile {
  static type = 'Minimum Effort Pace in minutes per mile';
  static displayType = DataEffortPaceMin.type;
}
