import { Stream } from "./stream";
import { StreamDataItem } from "./stream.interface";
export declare class IBIStream extends Stream {
    constructor(data?: number[]);
    getStreamDataByTime(startDate: Date): StreamDataItem[];
    getStreamDataByDuration(offset?: number, filter?: boolean): StreamDataItem[];
}
