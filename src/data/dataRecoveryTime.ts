import {DataDuration} from './data.duration';

export class DataRecoveryTime extends DataDuration {
  static type = 'Recovery Time';

  getDisplayValue(showDays: boolean = true, showSeconds: boolean = false): string {
    return super.getDisplayValue(showDays, showSeconds);
  }
}
