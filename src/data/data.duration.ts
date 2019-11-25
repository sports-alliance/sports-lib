import {DataNumber} from './data.number';

export class DataDuration extends DataNumber {
  static type = 'Duration';
  static unit = 's';

  /**
   * Converts to hhh:mmm:ss
   * @todo should adopt and round depending if needed to show seconds or not
   * @param showDays
   * @param showSeconds
   */
  getDisplayValue(showDays = false, showSeconds = false) {
    const seconds = this.getValue();
    const h = Math.floor(seconds / 3600);
    const d = Math.floor(h / 24);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);
    if (!m && !h) {
      return showSeconds ? ('0' + s).slice(-2) + 's' : s + `s`;
    } else if (!h) {
      return ('0' + m).slice(-2) + 'm ' +  (showSeconds ?  ('0' + s).slice(-2) + 's' : ``);
    } else {
      if (d) {
        if (showDays) {
          return d + 'd ' + ('0' + (h - d * 24)).slice(-2) + 'h ' + ('0' + m).slice(-2) + 'm ' +  (showSeconds ? ('0' + s).slice(-2) + 's' : ``);
        }
        return h + 'h ' + ('0' + m).slice(-2) + 'm ' + (showSeconds ? ('0' + s).slice(-2) + 's' : ``);
      } else {
        return ('0' + h).slice(-2) + 'h ' + ('0' + m).slice(-2) + 'm ' +  (showSeconds ?  ('0' + s).slice(-2) + 's' : ``);
      }
    }
  }

  getDisplayUnit(): string {
    return '';
  }
}
