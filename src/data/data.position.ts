import {DataBare} from './data.bare';
import {DataPositionInterface} from './data.position.interface';
import {isNumber} from '../events/utilities/helpers';

export class DataPosition extends DataBare {
  static type = 'Position';
  protected value: DataPositionInterface;

  constructor(value: DataPositionInterface) {
    if (!isNumber(value.longitudeDegrees) || !isNumber(value.latitudeDegrees)) {
      throw new Error('Only valid positional data are allowed');
    }
    super(value);
    this.value = value;
  }

  getValue(): DataPositionInterface {
    return this.value;
  }

  getDisplayValue(): string {
    return `${this.getValue().latitudeDegrees.toString()}, ${this.getValue().longitudeDegrees.toString()}`
  }
}
