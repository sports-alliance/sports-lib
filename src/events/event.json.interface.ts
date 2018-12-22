import {DataJSONInterface} from '../data/data.json.interface';

export interface EventJSONInterface {
  name: string,
  startDate: string,
  endDate: string,
  stats: DataJSONInterface[],
}
