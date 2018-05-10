import {DistanceAdapterInterface} from './distance.adapter.interface';
import {PointInterface} from '../../../points/point.interface';
import { getDistance, PositionAsDecimal } from 'geolib';


export class DistanceVincenty implements DistanceAdapterInterface {
  getDistance(points: PointInterface[]): number {
    let distance = 0;
    const excludeFirstPointsArray = points.slice(1);
    let pointA = points[0];
    for (const pointB of excludeFirstPointsArray) {
      const positionA = pointA.getPosition();
      const positionB = pointB.getPosition();
      if (!positionA || !positionB){
        continue;
      }
      const pointAPositionAsDecimal: PositionAsDecimal = {
        longitude: positionA.longitudeDegrees,
        latitude: positionA.latitudeDegrees,
      };
      const pointBPositionAsDecimal: PositionAsDecimal = {
        longitude: positionB.longitudeDegrees,
        latitude: positionB.latitudeDegrees,
      };
      distance += getDistance(pointAPositionAsDecimal, pointBPositionAsDecimal);
      pointA = pointB;
    }
    return distance;
  }
}
