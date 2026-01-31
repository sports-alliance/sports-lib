import { DataNumber } from './data.number';

export class DataPrimaryBenefit extends DataNumber {
  static type = 'Primary Benefit';
  static unit = '';

  constructor(value: number) {
    super(value);
  }
}
