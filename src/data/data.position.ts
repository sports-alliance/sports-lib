import {DataBare} from './data.bare';
import {DataPositionInterface} from './data.position.interface';
import {isNumber} from '../events/utilities/helpers';

export class DataPosition extends DataBare {
  static type = 'Position';
  protected value: DataPositionInterface;

  constructor(value: DataPositionInterface) {
    if (!isNumber(value.longitudeDegrees) || !isNumber(value.longitudeDegrees)) {
      throw new Error('Only valid positional data are allowed');
    }
    super(value);
    this.value = value;
  }

  getValue(): DataPositionInterface {
    return this.value;
  }
}
