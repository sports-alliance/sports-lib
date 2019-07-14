import {DataSwimPaceMinutesPer100Yard, DataSwimPace} from './data.swim-pace';

export class DataSwimPaceMax extends DataSwimPace {
  static type = 'Maximum Swim Pace';
}

export class DataSwimPaceMaxMinutesPer100Yard extends DataSwimPaceMinutesPer100Yard {
  static type = 'Maximum swim pace in minutes per 100 yard';
  static displayType = DataSwimPaceMax.type;
}
