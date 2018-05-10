import { DurationClassInterface } from './duration.class.interface';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
export declare abstract class DurationClassAbstract extends StatsClassAbstract implements DurationClassInterface {
    readonly startDate: Date;
    readonly endDate: Date;
    protected constructor(statDate: Date, endDate: Date);
}
