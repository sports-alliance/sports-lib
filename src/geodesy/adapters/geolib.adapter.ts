import {GeoLibAdapterInterface} from './adapter.interface';
import {PointInterface} from '../../points/point.interface';
import {getDistance, PositionAsDecimal, findNearest} from 'geolib';
import {DataPositionInterface} from '../../data/data.position.interface';

export class GeoLibAdapter implements GeoLibAdapterInterface {


  constructor() {
  }

  getDistance(points: PointInterface[]): number {
    let distance = 0;
    const excludeFirstPointsArray = points.slice(1);
    let pointA = points[0];
    for (const pointB of excludeFirstPointsArray) {
      const positionA = pointA.getPosition();
      const positionB = pointB.getPosition();
      if (!positionA || !positionB) {
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

  getNearestPointToPosition(postition: DataPositionInterface, points: PointInterface[]): PointInterface | void {
    const coordinates = points.map((point) => {
      const position = point.getPosition();
      if (!position) {
        throw Error('Point with no position found');
      }
      return {latitude: position.latitudeDegrees, longitude: position.longitudeDegrees}
    });
    const nearest: any = findNearest(
      {latitude: postition.latitudeDegrees, longitude: postition.longitudeDegrees},
      coordinates
    );
    return points[nearest.key];
  }
}
