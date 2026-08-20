import { DataNumber } from './data.number';

/**
 * Stroke or paddle cycles completed per minute.
 *
 * Activity-aware import normalization uses this metric instead of generic cadence for swimming,
 * rowing, kayaking, canoeing, paddling, and stand-up paddling activities.
 */
export class DataStrokeRate extends DataNumber {
  static type = 'Stroke Rate';
  static unit = 'spm';

  getDisplayValue() {
    return Math.round(this.getValue());
  }
}
