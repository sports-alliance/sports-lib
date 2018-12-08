import {GeoLibAdapter} from './geolib.adapter';
import {Point} from '../../points/point';
import {DataLatitudeDegrees} from '../../data/data.latitude-degrees';
import {DataLongitudeDegrees} from '../../data/data.longitude-degrees';

describe('GeoLibAdapter', () => {

  let geoLibAdapter: GeoLibAdapter;

  beforeEach(() => {
  });

  it('should get a correct distance for simple adapter', () => {
    geoLibAdapter = new GeoLibAdapter();


    const pointA = new Point(new Date());
    new DataLatitudeDegrees(0)
    pointA.addData(new DataLongitudeDegrees(0));

    const pointB = new Point(new Date());
    pointB.addData(new DataLatitudeDegrees(1));
    pointB.addData(new DataLongitudeDegrees(1));

    expect(geoLibAdapter.getDistance([{latitudeDegrees: 0, longitudeDegrees: 0},
      {latitudeDegrees:1, longitudeDegrees:1}])).toBe(156900);
  });

});
