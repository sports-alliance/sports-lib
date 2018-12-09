import {LapInterface} from './lap.interface';
import {DataInterface} from '../data/data.interface';
import {DurationClassAbstract} from '../duration/duration.class.abstract';
import {LapTypes} from './lap.types';
import {LapJSONInterface} from './lap.json.interface';

export class Lap extends DurationClassAbstract implements LapInterface {

  public type: LapTypes;

  constructor(startDate: Date, endDate: Date, type: LapTypes) {
    super(startDate, endDate);
    this.type = type;
  }

  toJSON(): LapJSONInterface {
    const stats: any[] = [];
    this.stats.forEach((data: DataInterface, key: string) => {
      stats.push(data.toJSON());
    });
    return {
      id: this.getID(),
      startDate: this.startDate.toJSON(),
      endDate: this.endDate.toJSON(),
      type: this.type,
      stats: stats
    };
  }
}
