import { DataBare } from './data.bare';

export abstract class DataNumber extends DataBare {
  protected value: number;

  constructor(value: number) {
    super(value);
    this.value = value;
  }

  getValue(formatForDataType?: string): number {
    return this.value;
  }
}
