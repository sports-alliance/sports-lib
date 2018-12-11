import {EventInterface} from './event.interface';
import {ActivityInterface} from '../activities/activity.interface';
import {PointInterface} from '../points/point.interface';
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

  getPoints(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[] {
    return (activities || this.getActivities()).reduce((pointsArray: PointInterface[], activity: ActivityInterface) => {
      return pointsArray.concat(activity.getPoints(startDate, endDate));
    }, []);
  }

  // @todo maybe merge with below
  getPointsWithPosition(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[] {
    return this.getPoints(startDate, endDate, activities)
      .reduce((pointsWithPosition: PointInterface[], point: PointInterface) => {
        if (point.getPosition()) {
          pointsWithPosition.push(point);
        }
        return pointsWithPosition;
      }, []);
  }

  getPointsWithDataType(dataType: string, startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[] {
    return this.getPoints(startDate, endDate, activities)
      .reduce((pointsWithDataType: PointInterface[], point: PointInterface) => {
        if (point.getDataByType(dataType)) {
          pointsWithDataType.push(point);
        }
        return pointsWithDataType;
      }, []);
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
