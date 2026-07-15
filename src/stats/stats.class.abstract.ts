import { StatsClassInterface } from './stats.class.interface';
import { IDClass } from '../id/id.abstract.class';
import { DataDistance } from '../data/data.distance';
import { DataInterface, DefaultDataValue } from '../data/data.interface';

export abstract class StatsClassAbstract extends IDClass implements StatsClassInterface {
  public stats = new Map<string, DataInterface>(); // this could just be an array

  getDistance(): DataDistance {
    return <DataDistance>this.stats.get(DataDistance.type);
  }

  getStat<TValue = DefaultDataValue>(statType: string): DataInterface<TValue> | void {
    return this.stats.get(statType) as DataInterface<TValue> | void;
  }

  getStats<TValue = DefaultDataValue>(): Map<string, DataInterface<TValue>> {
    return this.stats as unknown as Map<string, DataInterface<TValue>>;
  }

  getStatsAsArray<TValue = DefaultDataValue>(): DataInterface<TValue>[] {
    return Array.from(this.stats.values()) as unknown as DataInterface<TValue>[];
  }

  removeStat(statType: string) {
    this.stats.delete(statType);
  }

  clearStats() {
    this.stats.clear();
  }

  setDistance(distance: DataDistance) {
    this.stats.set(DataDistance.type, distance);
  }

  addStat(stat: DataInterface<unknown>) {
    this.stats.set(stat.getType(), stat as unknown as DataInterface);
  }
}
