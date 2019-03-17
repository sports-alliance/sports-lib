import { ActivityInterface } from './activity.interface';
import { LapInterface } from '../laps/lap.interface';
import { IntensityZonesInterface } from '../intensity-zones/intensity-zones.interface';
import { Creator } from '../creators/creator';
import { ActivityTypes } from './activity.types';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { CreatorInterface } from '../creators/creator.interface';
import { StreamDataItem, StreamInterface } from '../streams/stream.interface';
import { ActivityJSONInterface } from './activity.json.interface';
import { DataPositionInterface } from '../data/data.position.interface';
export declare class Activity extends DurationClassAbstract implements ActivityInterface {
    type: ActivityTypes;
    creator: CreatorInterface;
    intensityZones: IntensityZonesInterface[];
    private laps;
    private streams;
    constructor(startDate: Date, endDate: Date, type: ActivityTypes, creator: Creator);
    getDataLength(): number;
    createStream(type: string): StreamInterface;
    addDataToStream(type: string, date: Date, value: number): void;
    addStream(stream: StreamInterface): void;
    clearStreams(): void;
    removeStream(stream: StreamInterface): void;
    addStreams(streams: StreamInterface[]): void;
    getAllStreams(): StreamInterface[];
    hasStreamData(streamType: string, startDate?: Date, endDate?: Date): boolean;
    hasPositionData(startDate?: Date, endDate?: Date): boolean;
    getStream(streamType: string): StreamInterface;
    getStreamData(streamType: string, startDate?: Date, endDate?: Date): (number | null)[];
    getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[];
    getPositionData(startDate?: Date, endDate?: Date): (DataPositionInterface | null)[];
    getStreamDataBasedOnDataType(streamTypeToBaseOn: string, streamTypes: string[]): {
        [type: string]: {
            [type: string]: number | null;
        };
    };
    getStreamDataBasedOnTime(streamTypes: string[]): {
        [type: number]: {
            [type: string]: number | null;
        };
    };
    getStreamDataByTime(streamType: string): StreamDataItem[];
    addLap(lap: LapInterface): void;
    getLaps(activity?: ActivityInterface): LapInterface[];
    toJSON(): ActivityJSONInterface;
}
