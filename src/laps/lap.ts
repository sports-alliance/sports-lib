import { LapInterface } from './lap.interface';
import { DataInterface } from '../data/data.interface';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { LapTypes } from './lap.types';
import { LapJSONInterface } from './lap.json.interface';
import { ActivityInterface } from '../activities/activity.interface';

export class Lap extends DurationClassAbstract implements LapInterface {
  public lapId: number;
  public type: LapTypes;

  constructor(startDate: Date, endDate: Date, lapId: number, type: LapTypes) {
    super(startDate, endDate);
    this.lapId = lapId;
    this.type = type;
  }

  getStartIndex(activity: ActivityInterface): number {
    return activity.getDateIndex(this.startDate);
  }

  getEndIndex(activity: ActivityInterface): number {
    return activity.getDateIndex(this.endDate);
  }

  toJSON(activity?: ActivityInterface): LapJSONInterface {
    const stats = {};
    this.stats.forEach((value: DataInterface, key: string) => {
      Object.assign(stats, value.toJSON());
    });
    return {
      lapId: this.lapId,
      startDate: this.startDate.getTime(),
      endDate: this.endDate.getTime(),
      startIndex: activity ? this.getStartIndex(activity) : null,
      endIndex: activity ? this.getEndIndex(activity) : null,
      type: this.type,
      stats: stats
    };
  }
}
