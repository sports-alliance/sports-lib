import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StreamJSONInterface } from './stream';

/**
 * A stream consists of an array of data like this for example
 * AltitudeStream: [100, 110, null, 112, 200, null, 300]
 * The sampling rate of streams is fixed to 1s
 * That means that on the above example the duration is seconds would be:
 * [1,2,3,4,5,6,6]
 *
 * null means no value and that means missing data.
 */
export interface StreamInterface extends SerializableClassInterface {

  /**
   * Type of the string. Can be any of the datatypes stored in the dataStore.
   * @todo make this an 'enum'
   */
  type: string;

  /**
   * Get's back the streams data as an array
   * @param onlyNumeric
   * @param filterInfinity
   */
  getData(onlyNumeric?: boolean, filterInfinity?: boolean): (number | null)[];

  /**
   * Sets the data for this stream
   * @param data
   */
  setData(data: (number | null)[]): this;

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
   * Checks if the speed is exportable
   * - It should not be speed derived stream
   * - It should not be unit derived stream
   * - It should not be GNSS distance and other types on blacklist
   */
  isExportable(): boolean;

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
