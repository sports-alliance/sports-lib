import { DataDistance } from '../data/data.distance';
import { DataInterface, DefaultDataValue } from '../data/data.interface';

export interface StatsClassInterface {
  getDistance(): DataDistance;

  getStat<TValue = DefaultDataValue>(statType: string): DataInterface<TValue> | void;

  getStats<TValue = DefaultDataValue>(): Map<string, DataInterface<TValue>>;

  getStatsAsArray<TValue = DefaultDataValue>(): DataInterface<TValue>[];

  removeStat(statType: string): void;

  clearStats(): void;

  setDistance(distance: DataDistance): void;

  addStat(stat: DataInterface<unknown>): void;
}
