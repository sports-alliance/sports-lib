import {PointInterface} from '../../points/point.interface';
import {DataPositionInterface} from '../../data/data.position.interface';

export interface GeoLibAdapterInterface {
  getDistance(positionArray: DataPositionInterface[]): number;
  getNearestPointToPosition(position: DataPositionInterface, points: PointInterface[]): PointInterface | void;
}
