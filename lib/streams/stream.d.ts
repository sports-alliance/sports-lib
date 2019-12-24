import { StreamDataItem, StreamInterface } from './stream.interface';
export declare class Stream implements StreamInterface {
    readonly type: string;
    data: (number | null)[];
    constructor(type: string, data?: (number | null)[]);
    getNumericData(): number[];
    /**
     * Gets the data based / offset on a startDate
     * @param startDate
     * @param filterNull
     * @param filterInfinity
     */
    getStreamDataByTime(startDate: Date, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[];
    /**
     * Gets the data offset on a time
     * @param offset
     * @param filterNull
     * @param filterInfinity
     */
    getStreamDataByDuration(offset?: number, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[];
    isUnitDerivedDataType(): boolean;
    toJSON(): StreamJSONInterface;
}
export interface StreamJSONInterface {
    type: string;
    data: (number | null)[];
}
