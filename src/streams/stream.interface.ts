import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StreamDataInterface} from './stream.data.interface';
export interface StreamInterface extends SerializableClassInterface {
  type: string;
  data: StreamDataInterface[];
}
