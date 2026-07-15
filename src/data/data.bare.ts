import { Data } from './data';
import { DefaultDataClassValue } from './data.interface';

export abstract class DataBare<T = DefaultDataClassValue> extends Data<T> {
  static unit = ''; // Bare data have no unit but empty string
}
