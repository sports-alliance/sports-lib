import { DataPause } from '../data/data.pause';
import { DataDuration } from '../data/data.duration';
import { DataTimerTime } from '../data/data.timer-time';
import { DataMovingTime } from '../data/data.moving-time';

export interface DurationClassInterface {
  startDate: Date;
  endDate: Date;

  /**
   * Returns active duration, or undefined when absent or rejected. Valid zero is retained.
   * This excludes pauses; do not replace rejected duration with elapsed time.
   */
  getDuration(): DataDuration | undefined;

  /**
   * Returns timer time excluding pauses, or undefined when absent or rejected.
   */
  getTimer(): DataTimerTime | undefined;

  /**
   * Returns moving time, or undefined when unavailable. Valid zero is retained.
   */
  getMovingTime(): DataMovingTime | undefined;

  /**
   * Returns paused time, or undefined when unavailable. Valid zero is retained.
   */
  getPause(): DataPause | undefined;

  setDuration(duration: DataDuration): void;

  setTimer(duration: DataTimerTime): void;

  setMovingTime(duration: DataMovingTime): void;

  setPause(pause: DataPause): void;
}
