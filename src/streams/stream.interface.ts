import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {StreamJSONInterface} from './stream.json.interface';
export interface StreamInterface extends SerializableClassInterface {
  type: string;
  data: number[];
  toJSON(): StreamJSONInterface;
}
