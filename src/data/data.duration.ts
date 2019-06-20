import {DataNumber} from './data.number';

export class DataDuration extends DataNumber {
  static type = 'Duration';
  static unit = 's';

  getDisplayValue() {
    const seconds = this.getValue();
    const h = Math.floor(seconds / 3600);
    const d = Math.floor(h / 24);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);
    if (!m && !h) {
      return ('0' + s).slice(-2) + 's';
    } else if (!h) {
      return ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
    } else {
      if (d > 41) {
        return ('0' + h).slice(-4) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
      } else if (d) {
        return ('0' + h).slice(-3) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
      } else {
        return ('0' + h).slice(-2) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
      }
    }
  }

  getDisplayUnit(): string {
    return '';
  }
}
