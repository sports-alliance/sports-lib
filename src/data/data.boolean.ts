import { DataBare } from './data.bare';

export abstract class DataBoolean extends DataBare<boolean> {
  constructor(value: boolean) {
    super(value);
  }

  isValueTypeValid(value: unknown): boolean {
    return typeof value === 'boolean';
  }
}
