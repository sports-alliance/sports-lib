import { StreamDataItem, StreamInterface } from './stream.interface';
export declare class Stream implements StreamInterface {
    readonly type: string;
    data: (number | null)[];
    constructor(type: string, data?: (number | null)[]);
    getNumericData(): number[];
    /**
     * Gets the data based on a startDate
     * @param startDate
     */
    getStreamDataByTime(startDate: Date): StreamDataItem[];
    getStreamDataByDuration(offset?: number): StreamDataItem[];
    isUnitDerivedDataType(): boolean;
    toJSON(): StreamJSONInterface;
}
export interface StreamJSONInterface {
    type: string;
    data: (number | null)[];
}
