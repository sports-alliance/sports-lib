import { DataDistance } from '../data/data.distance';
import { DataInterface } from '../data/data.interface';
export interface StatsClassInterface {
    getDistance(): DataDistance;
    getStat(statType: string): DataInterface | void;
    getStats(): Map<string, DataInterface>;
    getStatsAsArray(): DataInterface[];
    removeStat(statType: string): void;
    clearStats(): void;
    setDistance(distance: DataDistance): void;
    addStat(stat: DataInterface): void;
}
