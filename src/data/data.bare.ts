import { Data } from './data';
import { DataPositionInterface } from './data.position.interface';

export abstract class DataBare<T extends number | string | boolean | string[] | DataPositionInterface = number | string | boolean | string[] | DataPositionInterface> extends Data<T> {
  static unit = ''; // Bare data have no unit but empty string
}
