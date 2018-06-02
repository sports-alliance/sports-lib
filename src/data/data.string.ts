import {DataBare} from './data.bare';

export abstract class DataString extends DataBare {
  static className = 'DataString';
  protected value: string;

  constructor(value: string) {
    if (typeof value === 'string') {
      throw new Error('Only strings are allowed for string data');
    }
    super(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}
