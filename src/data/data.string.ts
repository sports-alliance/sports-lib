import { DataBare } from './data.bare';

export abstract class DataString extends DataBare {
  protected value: string;

  constructor(value: string) {
    super(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  isValueTypeValid(value: any): boolean {
    return typeof value === 'string'
  }
}
