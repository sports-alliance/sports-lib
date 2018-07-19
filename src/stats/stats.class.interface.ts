import {DataDuration} from '../data/data.duration';
import {DataDistance} from '../data/data.distance';
import {DataInterface} from '../data/data.interface';
import {DataPause} from '../data/data.pause';
import {IDClassInterface} from '../id/id.class.interface';

export interface StatsClassInterface extends IDClassInterface {
  getDistance(): DataDistance;

  getStat(statType: string): DataInterface | void;

  getStats(): Map<string, DataInterface>;

  removeStat(statType: string): void;

  setDistance(distance: DataDistance): void;

  addStat(stat: DataInterface): void;
}
