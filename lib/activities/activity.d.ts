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
    createStream(type: string): StreamInterface;
    addDataToStream(type: string, date: Date, value: number): this;
    addStream(stream: StreamInterface): this;
    clearStreams(): this;
    removeStream(stream: StreamInterface): this;
    addStreams(streams: StreamInterface[]): this;
    getAllStreams(): StreamInterface[];
    getAllExportableStreams(): StreamInterface[];
    hasStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): boolean;
    hasPositionData(startDate?: Date, endDate?: Date): boolean;
    getStream(streamType: string): StreamInterface;
    getStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): (number | null)[];
    /**
     * Gets the data array of an activity stream excluding the non numeric ones
     * @todo include strings and all data abstract types
     * @param streamType
     * @param startDate
     * @param endDate
     */
    getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[];
    /**
     * Combines the lat - long streams to a DataPositionInterface
     * @param startDate
     * @param endDate
     * @param latitudeStream
     * @param longitudeStream
     */
    getPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): (DataPositionInterface | null)[];
    /**
     * Combines the lat - long streams to a DataPositionInterface and excludes nulls
     * @param startDate
     * @param endDate
     * @param latitudeStream
     * @param longitudeStream
     */
    getSquashedPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): DataPositionInterface[];
    getStreamDataTypesBasedOnDataType(streamTypeToBaseOn: string, streamTypes: string[]): {
        [type: string]: {
            [type: string]: number | null;
        };
    };
    getStreamDataTypesBasedOnTime(streamTypes: string[]): {
        [type: number]: {
            [type: string]: number | null;
        };
    };
    getStreamDataByTime(streamType: string, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[];
    addLap(lap: LapInterface): this;
    getLaps(activity?: ActivityInterface): LapInterface[];
    toJSON(): ActivityJSONInterface;
}
