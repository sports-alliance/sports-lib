import { DurationClassInterface } from './duration.class.interface';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
import { DataPause } from '../data/data.pause';
import { DataDuration } from '../data/data.duration';
import { DataTimerTime } from '../data/data.timer-time';
import { DataMovingTime } from '../data/data.moving-time';

export abstract class DurationClassAbstract extends StatsClassAbstract implements DurationClassInterface {
  startDate: Date;
  endDate: Date;

  protected constructor(startDate: Date, endDate: Date) {
    super();
    this.startDate = startDate;
    this.endDate = endDate;
  }

  getDuration(): DataDuration | undefined {
    return this.stats.get(DataDuration.type) as DataDuration | undefined;
  }

  getTimer(): DataTimerTime | undefined {
    return this.stats.get(DataTimerTime.type) as DataTimerTime | undefined;
  }

  getMovingTime(): DataMovingTime | undefined {
    return this.stats.get(DataMovingTime.type) as DataMovingTime | undefined;
  }

  getPause(): DataPause | undefined {
    return this.stats.get(DataPause.type) as DataPause | undefined;
  }

  setDuration(duration: DataDuration) {
    this.stats.set(DataDuration.type, duration);
  }

  setTimer(duration: DataTimerTime) {
    this.stats.set(DataTimerTime.type, duration);
  }

  setMovingTime(duration: DataMovingTime) {
    this.stats.set(DataMovingTime.type, duration);
  }

  setPause(pause: DataPause) {
    this.stats.set(DataPause.type, pause);
  }
}
