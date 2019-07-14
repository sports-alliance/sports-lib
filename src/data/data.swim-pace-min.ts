import {DataSwimPaceMinutesPer100Yard, DataSwimPace} from './data.swim-pace';

export class DataSwimPaceMin extends DataSwimPace {
  static type = 'Minimum Swim Pace';
}

export class DataSwimPaceMinMinutesPer100Yard extends DataSwimPaceMinutesPer100Yard {
  static type = 'Minimum swim pace in minutes per 100 yard';
  static displayType = DataSwimPaceMin.type;
}
