import { Stream } from "./stream";
import { StreamDataItem } from "./stream.interface";
export declare class IBIStream extends Stream {
    constructor(data?: number[]);
    getStreamDataByTime(startDate: Date, filterNull?: boolean): StreamDataItem[];
    getStreamDataByDuration(offset?: number, filterNull?: boolean): StreamDataItem[];
}
