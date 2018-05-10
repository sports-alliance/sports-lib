import { DataDuration } from '../data/data.duration';
import { DataDistance } from '../data/data.distance';
import { DataInterface } from '../data/data.interface';
import { DataPause } from '../data/data.pause';
import { IDClassInterface } from '../id/id.class.interface';
export interface StatsClassInterface extends IDClassInterface {
    getDistance(): DataDistance;
    getDuration(): DataDuration;
    getPause(): DataPause;
    getStat(statType: string): DataInterface;
    getStats(): Map<string, DataInterface>;
    removeStat(statType: string): any;
    setDistance(distance: DataDistance): any;
    setDuration(duration: DataDuration): any;
    setPause(pause: DataPause): any;
    addStat(stat: DataInterface): any;
}
