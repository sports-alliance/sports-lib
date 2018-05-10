import { EventInterface } from '../event.interface';
import { ActivityInterface } from '../../activities/activity.interface';
export declare class EventUtilities {
    static getEventAsTCXBloB(event: EventInterface): Promise<Blob>;
    static getDataTypeAverage(event: EventInterface, dataType: string, startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): number;
    static getDateTypeMaximum(event: EventInterface, dataType: string, startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): number;
    static getDateTypeMinimum(event: EventInterface, dataType: string, startDate?: Date, endDate?: Date, activities?: ActivityInterface[]): number;
    static mergeEvents(events: EventInterface[]): Promise<EventInterface>;
    static generateStats(event: EventInterface): void;
    static getEventDataTypeGain(event: EventInterface, dataType: string, starDate?: Date, endDate?: Date, activities?: ActivityInterface[], minDiff?: number): number;
    static getEventDataTypeLoss(event: EventInterface, dataType: string, starDate?: Date, endDate?: Date, activities?: ActivityInterface[], minDiff?: number): number;
    private static getEventDataTypeGainOrLoss(gain, event, dataType, starDate?, endDate?, activities?, minDiff?);
    private static getDataTypeMinOrMax(max, event, dataType, startDate?, endDate?, activities?);
    private static generateStatsForActivityOrLap(event, subject);
}
export declare function isNumberOrString(property: any): boolean;
