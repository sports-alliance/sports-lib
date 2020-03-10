import { DataPositionInterface } from '../../data/data.position.interface';

export interface GeoLibAdapterInterface {
  getDistance(positionArray: DataPositionInterface[], precise?: boolean, accuracy?: number): number;

  // getNearestPointToPosition(position: DataPositionInterface, points: PointInterface[]): PointInterface | void;
}
