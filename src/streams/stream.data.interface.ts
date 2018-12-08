import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {DataInterface} from '../data/data.interface';

export interface StreamDataInterface extends SerializableClassInterface {
  date: Date;
  data: DataInterface;
}
