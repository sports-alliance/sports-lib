import {Data} from './data';

export abstract class DataBare extends Data {
  static unit = ''; // Bare data have no unit but empty string
}
