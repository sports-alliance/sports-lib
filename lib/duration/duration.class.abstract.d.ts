import { DurationClassInterface } from './duration.class.interface';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
import { DataPause } from '../data/data.pause';
import { DataDuration } from '../data/data.duration';
export declare abstract class DurationClassAbstract extends StatsClassAbstract implements DurationClassInterface {
    startDate: Date;
    endDate: Date;
    protected constructor(startDate: Date, endDate: Date);
    getDuration(): DataDuration;
    getPause(): DataPause;
    setDuration(duration: DataDuration): void;
    setPause(pause: DataPause): void;
}
