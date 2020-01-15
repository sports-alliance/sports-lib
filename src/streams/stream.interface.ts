import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StreamJSONInterface} from './stream';

export interface StreamInterface extends SerializableClassInterface {

  /**
   * Type of the string. Can be any of the datatypes stored in the dataStore.
   * @todo make this an 'enum'
   */
  type: string;

  /**
   * An array of values that represents a slug that should be 1s of duration or 1000ms
   */
  data: (number | null)[];

  /**
   * Gets back the data but wipes out all non numeric values
   */
  getNumericData(): (number)[];

  /**
   * Gets the data based / offset on a startDate
   * @param startDate
   * @param onlyNumeric
   * @param filterInfinity
   */
  getStreamDataByTime(startDate: Date, onlyNumeric?: boolean, filterInfinity?: boolean): StreamDataItem[]

  /**
   * Gets the data offset on a time
   * @param offset
   * @param onlyNumeric
   * @param filterInfinity
   */
  getStreamDataByDuration(offset?: number, onlyNumeric?: boolean, filterInfinity?: boolean): StreamDataItem[]

  /**
   * Checks if the current stream is unit derived metric.
   * Eg speed is m/s if the current stream is speed in km/h this returns true
   */
  isUnitDerivedDataType(): boolean;

  toJSON(): StreamJSONInterface;
}

// Perhaps convert due to https://www.amcharts.com/docs/v4/concepts/performance/
export interface StreamDataItem {
  /**
   * The time of the value
   * Can be time as of date or just time in ms
   */
  time: number,

  value: number | null
}
