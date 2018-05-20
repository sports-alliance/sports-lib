import {DataDuration} from './data.duration';

export class DataPace extends DataDuration {
  static className = 'DataPace';
  static type = 'Pace';
  static unit = 'm/km';

  getDisplayValue(): string | string | string {
    const d = this.value;
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
    if (!m && !h) {
      return ('0' + s).slice(-2);
    } else if (!h) {
      return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    } else {
      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    }
  }

  getValue(): number {
    return super.getValue() / 60;
  }

  getDisplayUnit(): string {
    return 'min/km';
  }
}
