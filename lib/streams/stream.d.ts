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
     */
    getStreamDataByTime(startDate: Date, filterNull?: boolean): StreamDataItem[];
    getStreamDataByDuration(offset?: number, filterNull?: boolean): StreamDataItem[];
    isUnitDerivedDataType(): boolean;
    toJSON(): StreamJSONInterface;
}
export interface StreamJSONInterface {
    type: string;
    data: (number | null)[];
}
