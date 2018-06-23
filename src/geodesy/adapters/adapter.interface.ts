import {PointInterface} from '../../points/point.interface';
import {DataPositionInterface} from '../../data/data.position.interface';

export interface GeoLibAdapterInterface {
  getDistance(points: PointInterface[]): number;
  getNearestPointToPosition(position: DataPositionInterface, points: PointInterface[]): PointInterface | void;
}
