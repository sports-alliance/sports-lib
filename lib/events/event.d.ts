import { EventInterface } from './event.interface';
import { ActivityInterface } from '../activities/activity.interface';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { EventJSONInterface } from './event.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
export declare class Event extends DurationClassAbstract implements EventInterface {
    name: string;
    description?: string;
    privacy: Privacy;
    isMerge: boolean;
    private activities;
    constructor(name: string, startDate: Date, endDate: Date, privacy?: Privacy, description?: string, isMerge?: boolean);
    addActivity(activity: ActivityInterface): void;
    addActivities(activities: ActivityInterface[]): void;
    clearActivities(): void;
    removeActivity(activityToRemove: ActivityInterface): void;
    getActivities(): ActivityInterface[];
    getFirstActivity(): ActivityInterface;
    getLastActivity(): ActivityInterface;
    getActivityTypesAsString(): string;
    getDeviceNamesAsString(): string;
    private sortActivities;
    private getUniqueStringWithMultiplier;
    toJSON(): EventJSONInterface;
}
