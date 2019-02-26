import { PointInterface } from '../points/point.interface';
import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { ActivityInterface } from '../activities/activity.interface';
import { DurationClassInterface } from '../duration/duration.class.interface';
export interface EventInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface {
    name: string;
    addActivity(activity: ActivityInterface): void;
    removeActivity(activity: ActivityInterface): void;
    getActivities(): ActivityInterface[];
    getFirstActivity(): ActivityInterface;
    getLastActivity(): ActivityInterface;
    getPoints(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[];
    getPointsWithDataType(dataType: string, startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[];
    getPointsWithPosition(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[];
}
