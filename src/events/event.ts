import {EventInterface} from './event.interface';
import {ActivityInterface} from '../activities/activity.interface';
import {DataInterface} from '../data/data.interface';
import {DurationClassAbstract} from '../duration/duration.class.abstract';
import {EventJSONInterface} from './event.json.interface';

export class Event extends DurationClassAbstract implements EventInterface {

  public name: string;
  private activities: ActivityInterface[] = [];

  constructor(name: string, startDate: Date, endDate: Date) {
    super(startDate, endDate);
    this.name = name
  }

  addActivity(activity: ActivityInterface) {
    this.activities.push(activity);
  }

  clearActivities(): void {
    this.activities = [];
  }

  removeActivity(activityToRemove: ActivityInterface) {
    this.activities = this.activities.filter((activity) => activityToRemove.getID() !== activity.getID());
  }

  getActivities(): ActivityInterface[] {
    return this.activities;
  }

  getFirstActivity(): ActivityInterface {
    return this.getActivities().reduce((activityA: ActivityInterface, activityB: ActivityInterface) => {
      return activityA.startDate < activityB.startDate ? activityA : activityB;
    });
  }

  getLastActivity(): ActivityInterface {
    return this.getActivities().reduce((activityA: ActivityInterface, activityB: ActivityInterface) => {
      return activityA.startDate < activityB.startDate ? activityB : activityA;
    });
  }

  toJSON(): EventJSONInterface {
    const stats: any[] = [];
    this.stats.forEach((data: DataInterface, key: string) => {
      stats.push(data.toJSON());
    });
    return {
      name: this.name,
      startDate: this.startDate.toJSON(),
      endDate: this.endDate.toJSON(),
      stats: stats,
    };
  }
}
