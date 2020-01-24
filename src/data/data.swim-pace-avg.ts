import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from './data.swim-pace';

export class DataSwimPaceAvg extends DataSwimPace {
  static type = 'Average Swim Pace';
}

export class DataSwimPaceAvgMinutesPer100Yard extends DataSwimPaceMinutesPer100Yard {
  static type = 'Average swim pace in minutes per 100 yard';
  static displayType = DataSwimPaceAvg.type;
}
