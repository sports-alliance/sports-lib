import { StatsClassInterface } from './stats.class.interface';
import { IDClass } from '../id/id.abstract.class';
import { DataDuration } from '../data/data.duration';
import { DataDistance } from '../data/data.distance';
import { DataInterface } from '../data/data.interface';
import { DataPause } from '../data/data.pause';
export declare abstract class StatsClassAbstract extends IDClass implements StatsClassInterface {
    stats: Map<string, DataInterface>;
    getDistance(): DataDistance;
    getDuration(): DataDuration;
    getPause(): DataPause;
    getStat(statType: string): DataInterface | void;
    getStats(): Map<string, DataInterface>;
    removeStat(statType: string): void;
    setDistance(distance: DataDistance): void;
    setDuration(duration: DataDuration): void;
    setPause(pause: DataPause): void;
    addStat(stat: DataInterface): void;
}
