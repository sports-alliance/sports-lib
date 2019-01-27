import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StreamJSONInterface} from './stream.json.interface';
export interface StreamInterface extends SerializableClassInterface {
  type: string;
  data: (number|null)[];
  getNumericData(): (number)[];
  getStreamDataByTime(startDate: Date): StreamDataItem[]
  getStreamDataByDuration(): StreamDataItem[]
  toJSON(): StreamJSONInterface;
}

export interface StreamDataItem {
  time: number,
  value: number|null
}
