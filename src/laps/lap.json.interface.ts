import {DataJSONInterface} from '../data/data.json.interface';

export interface LapJSONInterface {
  startDate: string,
  endDate: string,
  type: string,
  stats: DataJSONInterface,
}
