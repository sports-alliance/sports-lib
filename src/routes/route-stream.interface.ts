import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StreamJSONInterface } from '../streams/stream';

export interface RouteStreamDataItem {
  index: number;
  value: number | null;
}

/**
 * A route stream is indexed by route point, not by elapsed activity seconds.
 */
export interface RouteStreamInterface extends SerializableClassInterface {
  type: string;

  getData(onlyNumeric?: boolean, filterInfinity?: boolean): (number | null)[];

  setData(data: (number | null)[]): this;

  getStreamDataByIndex(onlyNumeric?: boolean, filterInfinity?: boolean): RouteStreamDataItem[];

  isExportable(): boolean;

  toJSON(): StreamJSONInterface;
}
