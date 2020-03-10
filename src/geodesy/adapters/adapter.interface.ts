import { DataPositionInterface } from '../../data/data.position.interface';

export interface GeoLibAdapterInterface {
  getDistance(positionArray: DataPositionInterface[], precise?: boolean): number;

  // getNearestPointToPosition(position: DataPositionInterface, points: PointInterface[]): PointInterface | void;
}
