import { getDistance, getPreciseDistance } from 'geolib';
import { DataPositionInterface } from '../../data/data.position.interface';
import { GeoLibAdapter } from './geolib.adapter';

const asGeolibPosition = (position: DataPositionInterface) => ({
  latitude: position.latitudeDegrees,
  longitude: position.longitudeDegrees
});

describe('GeoLibAdapter', () => {
  it('matches geolib exactly for long paths and supported accuracies', () => {
    let state = 0x12345678;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x1_0000_0000;
    };
    const positions = Array.from({ length: 2000 }, () => ({
      latitudeDegrees: random() * 170 - 85,
      longitudeDegrees: random() * 360 - 180
    }));
    const adapter = new GeoLibAdapter();

    for (const accuracy of [Number.NaN, 0, -0, -1, Number.MIN_VALUE, 0.1, 1, 10, Infinity, -Infinity]) {
      let expected = 0;
      for (let index = 1; index < positions.length; index++) {
        expected += getDistance(asGeolibPosition(positions[index - 1]), asGeolibPosition(positions[index]), accuracy);
      }

      expect(adapter.getDistance(positions, false, accuracy)).toBe(expected);
    }
  });

  it('preserves repeated, near-antipodal, and precise distance behavior', () => {
    const positions = [
      { latitudeDegrees: 0, longitudeDegrees: 0 },
      { latitudeDegrees: 0, longitudeDegrees: 0 },
      { latitudeDegrees: 0.000001, longitudeDegrees: -0.000001 },
      { latitudeDegrees: 0, longitudeDegrees: 179.999999 }
    ];
    const adapter = new GeoLibAdapter();
    let expectedPrecise = 0;

    for (let index = 1; index < positions.length; index++) {
      expectedPrecise += getPreciseDistance(
        asGeolibPosition(positions[index - 1]),
        asGeolibPosition(positions[index]),
        0.1
      );
    }

    expect(adapter.getDistance(positions, true, 0.1)).toBe(expectedPrecise);
  });
});
