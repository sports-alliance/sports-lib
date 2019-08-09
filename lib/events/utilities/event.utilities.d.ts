import { EventInterface } from '../event.interface';
import { ActivityInterface } from '../../activities/activity.interface';
import { StreamInterface } from '../../streams/stream.interface';
export declare class EventUtilities {
    private static geoLibAdapter;
    static getDataTypeAvg(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getAverage(data: number[]): number;
    static getDataTypeMax(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeMin(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeMinToMaxDifference(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeFirst(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
    static getDataTypeLast(activity: ActivityInterface, streamType: string, startDate?: Date, endDate?: Date): number;
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
    static getGainOrLoss(data: number[], gain: boolean, minDiff?: number): number;
    private static getDataTypeMinOrMax;
    static getMax(data: number[]): number;
    static getMin(data: number[]): number;
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
    static generateMissingStreamsForActivity(activity: ActivityInterface): ActivityInterface;
    static generateDistanceForActivity(activity: ActivityInterface, startDate?: Date, endDate?: Date): number;
    /**
     * @todo optimize with whitelist
     * @param streams
     */
    static getUnitStreamsFromStreams(streams: StreamInterface[]): StreamInterface[];
}
