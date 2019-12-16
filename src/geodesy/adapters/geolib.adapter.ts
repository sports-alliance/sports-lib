import {GeoLibAdapterInterface} from './adapter.interface';
import getDistance from 'geolib/es/getDistance';
import findNearest from 'geolib/es/findNearest';
import {DataPositionInterface} from '../../data/data.position.interface';

export class GeoLibAdapter implements GeoLibAdapterInterface {
  findNearest = findNearest;

  constructor() {
  }

  getDistance(positionArray: DataPositionInterface[]): number {
    let distance = 0;
    const excludeFirstPointsArray = positionArray.slice(1);
    let firstPosition = positionArray[0];
    for (const nextPosition of excludeFirstPointsArray) {
      const firstPositionAsDecimal = {
        longitude: firstPosition.longitudeDegrees,
        latitude: firstPosition.latitudeDegrees,
      };
      const nextPositionAsDecimal = {
        longitude: nextPosition.longitudeDegrees,
        latitude: nextPosition.latitudeDegrees,
      };
      distance += getDistance(firstPositionAsDecimal, nextPositionAsDecimal);
      firstPosition = nextPosition;
    }
    return distance;
  }
}
