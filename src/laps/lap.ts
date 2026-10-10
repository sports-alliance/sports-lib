import { StatsUtilities } from '../stats/stats.utilities';
import { LapInterface } from './lap.interface';
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

  /** Exports native lap JSON, omitting non-finite scalar summary stats. */
  toJSON(activity?: ActivityInterface): LapJSONInterface {
    const stats = StatsUtilities.serializeStats(this.stats);
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
