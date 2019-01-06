import {StatsClassInterface} from './stats.class.interface';
import {IDClass} from '../id/id.abstract.class';
import {DataDistance} from '../data/data.distance';
import {DataInterface} from '../data/data.interface';

export abstract class StatsClassAbstract extends IDClass implements StatsClassInterface {
  public stats = new Map<string, DataInterface>(); // this could just be an array

  getDistance(): DataDistance {
    return <DataDistance>this.stats.get(DataDistance.type);
  }

  getStat(statType: string): DataInterface | void {
    return this.stats.get(statType);
  }

  getStats(): Map<string, DataInterface> {
    return this.stats;
  }

  removeStat(statType: string) {
    this.stats.delete(statType);
  }

  clearStats(){
    this.stats.clear();
  }

  setDistance(distance: DataDistance) {
    this.stats.set(DataDistance.type, distance);
  }

  addStat(stat: DataInterface) {
    this.stats.set(stat.getType(), stat);
  }
}
