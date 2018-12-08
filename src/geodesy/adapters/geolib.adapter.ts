import {GeoLibAdapterInterface} from './adapter.interface';
import {PointInterface} from '../../points/point.interface';
import {getDistance, PositionAsDecimal, findNearest} from 'geolib';
import {DataPositionInterface} from '../../data/data.position.interface';

export class GeoLibAdapter implements GeoLibAdapterInterface {


  constructor() {
  }

  getDistance(positionArray: DataPositionInterface[]): number {
    let distance = 0;
    const excludeFirstPointsArray = positionArray.slice(1);
    let firstPosition = positionArray[0];
    for (const nextPosition of excludeFirstPointsArray) {
      const firstPositionAsDecimal: PositionAsDecimal = {
        longitude: firstPosition.longitudeDegrees,
        latitude: firstPosition.latitudeDegrees,
      };
      const nextPositionAsDecimal: PositionAsDecimal = {
        longitude: nextPosition.longitudeDegrees,
        latitude: nextPosition.latitudeDegrees,
      };
      distance += getDistance(firstPositionAsDecimal, nextPositionAsDecimal);
      firstPosition = nextPosition;
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
