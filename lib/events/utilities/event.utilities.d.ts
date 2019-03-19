import { EventInterface } from '../event.interface';
import { ActivityInterface } from '../../activities/activity.interface';
import { StreamInterface } from "../../streams/stream.interface";
export declare class EventUtilities {
    private static geoLibAdapter;
    static getDataTypeAvg(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeMax(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeMin(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeDifference(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static mergeEvents(events: EventInterface[]): EventInterface;
    static cropDistance(startDistance: number, endDistance: number, activity: ActivityInterface): ActivityInterface;
    static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface;
    static getStreamDataTypesBasedOnDataType(streamToBaseOn: StreamInterface, streams: StreamInterface[]): {
        [type: string]: {
            [type: string]: number | null;
        };
    };
    static getStreamDataTypesBasedOnTime(startDate: Date, endDate: Date, streams: StreamInterface[]): {
        [type: number]: {
            [type: string]: number | null;
        };
    };
    static getDataLength(startDate: Date, endDate: Date): number;
    static generateStatsForAll(event: EventInterface): void;
    static generateMissingStreamsAndStatsForActivity(activity: ActivityInterface): void;
    static reGenerateStatsForEvent(event: EventInterface): void;
    static getEventDataTypeGain(activity: ActivityInterface, streamType: string, starDate?: Date, endDate?: Date, minDiff?: number): number;
    static getEventDataTypeLoss(activity: ActivityInterface, streamType: string, starDate?: Date, endDate?: Date, minDiff?: number): number;
    private static getEventDataTypeGainOrLoss;
    private static getDataTypeMinOrMax;
    /**
     * Generates the stats for an activity
     * @param activity
     */
    private static generateMissingStatsForActivity;
    private static generateMissingUnitStatsForActivity;
    /**
     * Generates missing streams for an activity such as distance etc if they are missing
     * @param activity
     */
    private static generateMissingStreamsForActivity;
    static generateDistanceForActivity(activity: ActivityInterface, startDate?: Date, endDate?: Date): number;
}
