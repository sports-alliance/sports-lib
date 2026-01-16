import { DataBare } from './data.bare';

export abstract class DataString extends DataBare<string> {
  constructor(value: string) {
    super(value);
    this.value = value;
  }

  getValue(formatForDataType?: string): string {
    return this.value;
  }

  isValueTypeValid(value: any): boolean {
    return typeof value === 'string';
  }
}
