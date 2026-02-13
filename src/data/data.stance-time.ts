import { DataGroundContactTime } from './data.ground-contact-time';

/** @deprecated Use DataGroundContactTime instead */
export class DataStanceTime extends DataGroundContactTime {
  static type = 'Stance Time';
  static unit = 'ms';
}
