import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StreamJSONInterface } from './stream';
export interface StreamInterface extends SerializableClassInterface {
    type: string;
    data: (number | null)[];
    getNumericData(): (number)[];
    getStreamDataByTime(startDate: Date, filterNull: boolean): StreamDataItem[];
    getStreamDataByDuration(offset: number, filterNull: boolean): StreamDataItem[];
    isUnitDerivedDataType(): boolean;
    toJSON(): StreamJSONInterface;
}
export interface StreamDataItem {
    time: number;
    value: number | null;
}
