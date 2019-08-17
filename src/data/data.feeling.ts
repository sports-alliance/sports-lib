import {DataNumber} from './data.number';

export class DataFeeling extends DataNumber {
  static type = 'Feeling';
}

export enum Feelings {
  'Poor' = 1,
  'Average' = 2,
  'Good' = 3,
  'Very Good' = 4,
  'Excellent' = 5,
}
