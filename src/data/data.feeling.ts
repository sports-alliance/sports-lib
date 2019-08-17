import {DataNumber} from './data.number';

export class DataFeeling extends DataNumber {
  static type = 'Feeling';
}

export enum Feelings {
  Poor,
  Average,
  Good,
  'Very Good',
  Excellent
}
