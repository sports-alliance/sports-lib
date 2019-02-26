import { StreamDataInterface } from './stream.data.interface';
import { DataInterface } from '../data/data.interface';
export declare class StreamData implements StreamDataInterface {
    date: Date;
    data: DataInterface;
    constructor(date: Date, data: DataInterface);
    toJSON(): any;
}
