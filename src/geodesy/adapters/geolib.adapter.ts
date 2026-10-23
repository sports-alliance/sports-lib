import { GeoLibAdapterInterface } from './adapter.interface';
import { getPreciseDistance, findNearest } from 'geolib';
import { DataPositionInterface } from '../../data/data.position.interface';

const EARTH_RADIUS_METERS = 6378137;
const DEGREES_TO_RADIANS = Math.PI / 180;

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
    const fromLatitudeRadians = Number(firstPosition.latitudeDegrees) * DEGREES_TO_RADIANS;
    const toLatitudeRadians = Number(nextPosition.latitudeDegrees) * DEGREES_TO_RADIANS;
    const sinHalfDeltaLatitude = Math.sin((toLatitudeRadians - fromLatitudeRadians) / 2);
    const sinHalfDeltaLongitude = Math.sin(
      ((Number(nextPosition.longitudeDegrees) - Number(firstPosition.longitudeDegrees)) * DEGREES_TO_RADIANS) / 2
    );
    const haversine =
      sinHalfDeltaLatitude * sinHalfDeltaLatitude +
      Math.cos(fromLatitudeRadians) * Math.cos(toLatitudeRadians) * sinHalfDeltaLongitude * sinHalfDeltaLongitude;
    const distance = 2 * Math.asin(Math.sqrt(Math.min(1, haversine))) * EARTH_RADIUS_METERS;
    // Match geolib 4: zero accuracy requests the unrounded distance.
    if (normalizedAccuracy === 0) {
      return distance;
    }
    return Math.round(distance / normalizedAccuracy) * normalizedAccuracy;
  }
}
