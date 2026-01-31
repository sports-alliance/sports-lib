import { DataBare } from './data.bare';

export abstract class DataNumber extends DataBare<number> {
  constructor(value: number) {
    super(value);
    this.value = value;
  }

  getValue(_formatForDataType?: string): number {
    return this.value;
  }

  isValueTypeValid(value: any): boolean {
    return typeof value === 'number';
  }
}
