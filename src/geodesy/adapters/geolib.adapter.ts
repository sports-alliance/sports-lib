import { GeoLibAdapterInterface } from './adapter.interface';
import { getPreciseDistance, findNearest } from 'geolib';
import { DataPositionInterface } from '../../data/data.position.interface';

const EARTH_RADIUS_METERS = 6378137;

export class GeoLibAdapter implements GeoLibAdapterInterface {
  findNearest = findNearest;

  constructor() {}

  getDistance(positionArray: DataPositionInterface[], precise = false, accuracy = 0.1): number {
    let distance = 0;
    let firstPosition = positionArray[0];
    for (let index = 1; index < positionArray.length; index++) {
      const nextPosition = positionArray[index];
      if (precise) {
        distance += getPreciseDistance(
          {
            longitude: firstPosition.longitudeDegrees,
            latitude: firstPosition.latitudeDegrees
          },
          {
            longitude: nextPosition.longitudeDegrees,
            latitude: nextPosition.latitudeDegrees
          },
          accuracy
        );
      } else {
        distance += this.getFastDistance(firstPosition, nextPosition, accuracy);
      }
      firstPosition = nextPosition;
    }
    return distance;
  }

  private getFastDistance(
    firstPosition: DataPositionInterface,
    nextPosition: DataPositionInterface,
    accuracy: number
  ): number {
    const normalizedAccuracy = typeof accuracy !== 'undefined' && !isNaN(accuracy) ? accuracy : 1;
    const fromLatitudeRadians = (Number(firstPosition.latitudeDegrees) * Math.PI) / 180;
    const fromLongitudeRadians = (Number(firstPosition.longitudeDegrees) * Math.PI) / 180;
    const toLatitudeRadians = (Number(nextPosition.latitudeDegrees) * Math.PI) / 180;
    const toLongitudeRadians = (Number(nextPosition.longitudeDegrees) * Math.PI) / 180;
    const cosine =
      Math.sin(toLatitudeRadians) * Math.sin(fromLatitudeRadians) +
      Math.cos(toLatitudeRadians) * Math.cos(fromLatitudeRadians) * Math.cos(fromLongitudeRadians - toLongitudeRadians);
    const robustCosine = cosine > 1 ? 1 : cosine < -1 ? -1 : cosine;
    const distance = Math.acos(robustCosine) * EARTH_RADIUS_METERS;
    return Math.round(distance / normalizedAccuracy) * normalizedAccuracy;
  }
}
