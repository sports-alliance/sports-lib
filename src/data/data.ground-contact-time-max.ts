import { DataGroundContactTime } from './data.ground-contact-time';

export class DataGroundContactTimeMax extends DataGroundContactTime {
  static type = 'Maximum Ground Contact Time';
  static aliases = ['Ground Contact Time Max'];
  static unit = 'ms';
}
