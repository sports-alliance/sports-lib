import { DataBare } from './data.bare';
import { DataPositionInterface } from './data.position.interface';
import { isNumber } from '../events/utilities/helpers';

export class DataPosition extends DataBare {
  static type = 'Position';
  protected value: DataPositionInterface;

  constructor(value: DataPositionInterface) {
    super(value);
    this.value = value;
  }

  getValue(): DataPositionInterface {
    return this.value;
  }

  getDisplayValue(): string {
    return `${this.getValue().latitudeDegrees.toString()}, ${this.getValue().longitudeDegrees.toString()}`
  }

  isValueTypeValid(value: any): boolean {
    return isNumber(value.longitudeDegrees) && isNumber(value.latitudeDegrees)
  }
}
