import {DurationClassInterface} from './duration.class.interface';
import {StatsClassAbstract} from '../stats/stats.class.abstract';
import {DataPause} from '../data/data.pause';
import {DataDuration} from '../data/data.duration';

export abstract class DurationClassAbstract extends StatsClassAbstract implements DurationClassInterface {
  startDate: Date;
  endDate: Date;

  protected constructor(statDate: Date, endDate: Date) {
    if (!statDate || !endDate) {
      throw new Error('Start and end dates are required');
    }
    super();
    this.startDate = statDate;
    this.endDate = endDate;
  }

  getDuration(): DataDuration {
    return <DataDuration>this.stats.get(DataDuration.className);
  }

  getPause(): DataPause {
    return <DataPause>this.stats.get(DataPause.className);
  }

  setDuration(duration: DataDuration) {
    this.stats.set(DataDuration.className, duration);
  }

  setPause(pause: DataPause) {
    this.stats.set(DataPause.className, pause);
  }
}
