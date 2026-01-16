import { DataBare } from './data.bare';
import { DataPositionInterface } from './data.position.interface';
import { isNumber } from '../events/utilities/helpers';

export class DataPosition extends DataBare<DataPositionInterface> {
  static type = 'Position';
  constructor(value: DataPositionInterface) {
    super(value);
    this.value = value;
  }

  getValue(formatForDataType?: string): DataPositionInterface {
    return this.value;
  }

  getDisplayValue(): string {
    return `${this.getValue().latitudeDegrees.toString()}, ${this.getValue().longitudeDegrees.toString()}`;
  }

  isValueTypeValid(value: any): boolean {
    return isNumber(value.longitudeDegrees) && isNumber(value.latitudeDegrees);
  }
}
