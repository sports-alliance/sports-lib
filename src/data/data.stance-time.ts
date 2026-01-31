import { DataNumber } from './data.number';

/** @deprecated Use DataGroundContactTime instead */
export class DataStanceTime extends DataNumber {
  static type = 'Stance Time';
  static unit = 'ms';
}
