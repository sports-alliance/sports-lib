import {DataBare} from './data.bare';

export abstract class DataNumber extends DataBare {
  static className = 'DataNumber';
  protected value: number;

  constructor(value: number) {
    if (typeof value !== 'number') {
      throw new Error('Only numbers are allowed for numeric data');
    }
    super(value);
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}
