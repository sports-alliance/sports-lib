import { EventInterface } from './event.interface';
import { ActivityInterface } from '../activities/activity.interface';
import { PointInterface } from '../points/point.interface';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
export declare class Event extends StatsClassAbstract implements EventInterface {
    name: string;
    private activities;
    constructor(name: string);
    addActivity(activity: ActivityInterface): void;
    removeActivity(activityToRemove: ActivityInterface): void;
    getActivities(): ActivityInterface[];
    getFirstActivity(): ActivityInterface;
    getLastActivity(): ActivityInterface;
    getPoints(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[];
    getPointsWithPosition(startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): PointInterface[];
    toJSON(): any;
}
