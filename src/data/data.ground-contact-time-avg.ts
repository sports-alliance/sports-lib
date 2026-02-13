import { DataGroundContactTime } from './data.ground-contact-time';

export class DataGroundContactTimeAvg extends DataGroundContactTime {
  static type = 'Average Ground Contact Time';
  static aliases = ['Ground Contact Time Avg'];
  static unit = 'ms';
}
