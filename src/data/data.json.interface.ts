import { DataPositionInterface } from './data.position.interface';

export interface DataJSONInterface {
  [type: string]: number | boolean | string | string[] | DataPositionInterface;
}
