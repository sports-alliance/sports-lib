import { DataDuration } from './data.duration';

export class DataGroundTime extends DataDuration {
  static type = 'Ground Time';
  static unit = 'ms';

  getValue(): number {
    return this.value * 1000;
  }
}
