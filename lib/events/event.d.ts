import { EventInterface } from './event.interface';
import { ActivityInterface } from '../activities/activity.interface';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { EventJSONInterface } from './event.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
import { MetaDataInterface } from '../meta-data/meta-data.interface';
export declare class Event extends DurationClassAbstract implements EventInterface {
    name: string;
    privacy: Privacy;
    metaData?: MetaDataInterface;
    private activities;
    constructor(name: string, startDate: Date, endDate: Date, privacy?: Privacy);
    addActivity(activity: ActivityInterface): void;
    addActivities(activities: ActivityInterface[]): void;
    clearActivities(): void;
    removeActivity(activityToRemove: ActivityInterface): void;
    getActivities(): ActivityInterface[];
    getFirstActivity(): ActivityInterface;
    getLastActivity(): ActivityInterface;
    private sortActivities;
    toJSON(): EventJSONInterface;
}
