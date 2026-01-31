import { DataNumber } from './data.number';

export class DataEstSweatLoss extends DataNumber {
  static type = 'Est Sweat Loss';
  static unit = 'ml';

  constructor(value: number) {
    super(value);
  }
}
