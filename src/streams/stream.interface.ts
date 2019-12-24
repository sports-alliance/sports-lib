import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StreamJSONInterface} from './stream';
export interface StreamInterface extends SerializableClassInterface {
  type: string;
  data: (number|null)[];
  getNumericData(): (number)[];
  getStreamDataByTime(startDate: Date, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[]
  getStreamDataByDuration(offset: number, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[]
  isUnitDerivedDataType(): boolean;
  toJSON(): StreamJSONInterface;
}

// Perhaps convert due to https://www.amcharts.com/docs/v4/concepts/performance/
export interface StreamDataItem {
  time: number,
  value: number|null
}
