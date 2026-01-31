import { DataNumber } from './data.number';

export class DataJumpCount extends DataNumber {
  static type = 'Jump Count';
  static unit = '';

  constructor(jumpCount: number) {
    super(jumpCount);
  }
}
