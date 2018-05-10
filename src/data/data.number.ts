import {DataBare} from './data.bare';

export abstract class DataNumber extends DataBare {
  static className = 'DataNumber';
  protected value: number;

  constructor(value: number) {
    super(value);
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}
