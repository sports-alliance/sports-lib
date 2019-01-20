import {EventInterface} from './event.interface';
import {ActivityInterface} from '../activities/activity.interface';
import {DataInterface} from '../data/data.interface';
import {DurationClassAbstract} from '../duration/duration.class.abstract';
import {EventJSONInterface} from './event.json.interface';
import {Privacy} from '../privacy/privacy.class.interface';

export class Event extends DurationClassAbstract implements EventInterface {

  public name: string;
  public privacy: Privacy = Privacy.Private;
  private activities: ActivityInterface[] = [];

  constructor(name: string, startDate: Date, endDate: Date, privacy?: Privacy) {
    super(startDate, endDate);
    this.name = name;
    if (privacy) {
      this.privacy = privacy;
    }
  }

  addActivity(activity: ActivityInterface) {
    this.activities.push(activity);
  }

  addActivities(activities: ActivityInterface[]): void {
    this.activities.push(...activities);
  }

  clearActivities(): void {
    this.activities = [];
  }

  removeActivity(activityToRemove: ActivityInterface) {
    this.activities = this.activities.filter((activity) => activityToRemove.getID() !== activity.getID());
  }

  getActivities(): ActivityInterface[] {
    this.sortActivities(); // PErhaps move on adding ? Lets check performance
    // debugger
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

  private sortActivities(){
    this.activities.sort((activityA: ActivityInterface, activityB: ActivityInterface) => {
      return +activityA.startDate - +activityB.startDate;
    });
  }


  toJSON(): EventJSONInterface {
    const stats = {};
    this.stats.forEach((value: DataInterface, key: string) => {
      Object.assign(stats, value.toJSON());
    });
    return {
      name: this.name,
      privacy: this.privacy,
      startDate: this.startDate.toJSON(),
      endDate: this.endDate.toJSON(),
      stats: stats,
    };
  }
}
