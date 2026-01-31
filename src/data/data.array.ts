import { DataBare } from './data.bare';

export abstract class DataArray extends DataBare<string[]> {
  constructor(value: string[]) {
    super(value);
  }

  getValue(_formatForDataType?: string): string[] {
    return this.value;
  }

  isValueTypeValid(value: any): boolean {
    return Array.isArray(value);
  }
}
