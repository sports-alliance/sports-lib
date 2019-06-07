import {DataBare} from './data.bare';

export abstract class DataStringArray extends DataBare {
  protected value: string[];

  constructor(value: string[]) {
    if (!Array.isArray(value)) {
      throw new Error('Only arrays are allowed for string data');
    }
    super(value);
    this.value = value;
  }

  getValue(): string[] {
    return this.value;
  }

  getDisplayValue(): string {
    return this.getValue().join(', ');
  }
}
