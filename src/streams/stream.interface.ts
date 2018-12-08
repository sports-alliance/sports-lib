import {SerializableClassInterface} from '../serializable/serializable.class.interface';
export interface StreamInterface extends SerializableClassInterface {
  type: string;
  data: number[];
}
