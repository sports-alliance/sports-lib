import { DataNumber } from './data.number';

export class DataDuration extends DataNumber {
  static type = 'Duration';
  static unit = 's';

  /**
   * Converts to hhh:mmm:ss:ms and rounds its displayed fractional seconds.
   * @param showDays
   * @param showSeconds
   * @param showMilliseconds
   * @param useColonFormat when true, returns compact colon-separated format e.g. `1:04:32`
   */
  getDisplayValue(showDays = false, showSeconds = true, showMilliseconds = false, useColonFormat = false) {
    const seconds = this.getValue();
    const h = Math.floor(seconds / 3600);
    const d = Math.floor(h / 24);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);
    const ms = (Math.round((seconds % 1) * 10) / 10).toString().substring(1);

    if (useColonFormat) {
      const msStr = showMilliseconds ? ms : '';
      const ss = ('0' + s).slice(-2) + msStr;
      const mm = ('0' + m).slice(-2);
      return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    if (!m && !h) {
      return showSeconds
        ? ('0' + s).slice(-2) + (showMilliseconds ? ms : '') + 's'
        : s + String(showMilliseconds ? ms : '') + `s`;
    } else if (!h) {
      return (
        ('0' + m).slice(-2) + 'm' + (showSeconds ? ' ' + ('0' + s).slice(-2) + (showMilliseconds ? ms : '') + 's' : ``)
      );
    } else {
      if (d) {
        if (showDays) {
          return (
            d +
            'd ' +
            ('0' + (h - d * 24)).slice(-2) +
            'h ' +
            ('0' + m).slice(-2) +
            'm ' +
            (showSeconds ? ('0' + s).slice(-2) + (showMilliseconds ? ms : '') + 's' : ``)
          );
        }
        return (
          h +
          'h ' +
          ('0' + m).slice(-2) +
          'm ' +
          (showSeconds ? ('0' + s).slice(-2) + (showMilliseconds ? ms : '') + 's' : ``)
        );
      } else {
        return (
          ('0' + h).slice(-2) +
          'h ' +
          ('0' + m).slice(-2) +
          'm ' +
          (showSeconds ? ('0' + s).slice(-2) + (showMilliseconds ? ms : '') + 's' : ``)
        );
      }
    }
  }

  /**
   * Formats an elapsed duration as a stopwatch value, such as `1:36.12`.
   *
   * Uses a single minute digit for sub-hour durations, pads seconds to two
   * digits, and retains trailing zeroes in the fractional part.
   */
  getStopwatchDisplayValue(fractionDigits = 2): string {
    const boundedFractionDigits = Math.max(0, Math.min(3, Math.trunc(fractionDigits)));
    const precision = 10 ** boundedFractionDigits;
    const roundedSeconds = Math.round(this.getValue() * precision) / precision;
    const h = Math.floor(roundedSeconds / 3600);
    const m = Math.floor((roundedSeconds % 3600) / 60);
    const s = Math.floor(roundedSeconds % 60);
    const fractionalPart = boundedFractionDigits
      ? (roundedSeconds % 1).toFixed(boundedFractionDigits).substring(1)
      : '';
    const seconds = `${('0' + s).slice(-2)}${fractionalPart}`;

    return h > 0 ? `${h}:${('0' + m).slice(-2)}:${seconds}` : `${m}:${seconds}`;
  }

  getDisplayUnit(): string {
    return '';
  }
}
