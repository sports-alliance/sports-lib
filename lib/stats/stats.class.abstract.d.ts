import { StatsClassInterface } from './stats.class.interface';
import { IDClass } from '../id/id.abstract.class';
import { DataDistance } from '../data/data.distance';
import { DataInterface } from '../data/data.interface';
export declare abstract class StatsClassAbstract extends IDClass implements StatsClassInterface {
    stats: Map<string, DataInterface>;
    getDistance(): DataDistance;
    getStat(statType: string): DataInterface | void;
    getStats(): Map<string, DataInterface>;
    getStatsAsArray(): DataInterface[];
    removeStat(statType: string): void;
    clearStats(): void;
    setDistance(distance: DataDistance): void;
    addStat(stat: DataInterface): void;
}
