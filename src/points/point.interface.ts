import {DataInterface} from '../data/data.interface';
import {DataPositionInterface} from '../data/data.position.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {IDClassInterface} from '../id/id.class.interface';

export interface PointInterface extends SerializableClassInterface, IDClassInterface {
  getDate(): Date;
  addData(data: DataInterface): void;
  removeDataByType(dataType: string): void;
  getData(): Map<string, DataInterface>;
  getDataByType(dataType: string): DataInterface | void;
  getPosition(): DataPositionInterface | void;
}
