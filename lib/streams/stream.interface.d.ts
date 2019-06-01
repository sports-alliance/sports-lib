import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StreamJSONInterface } from './stream';
export interface StreamInterface extends SerializableClassInterface {
    type: string;
    data: (number | null)[];
    getNumericData(): (number)[];
    getStreamDataByTime(startDate: Date): StreamDataItem[];
    getStreamDataByDuration(offset?: number): StreamDataItem[];
    isUnitDerivedDataType(): boolean;
    toJSON(): StreamJSONInterface;
}
export interface StreamDataItem {
    time: number;
    value: number | null;
}
