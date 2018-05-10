import {GeoLibAdapterInterface} from './adapter.interface';
import {DistanceVincenty} from './distance/distance.geolib.vincenty.adapter';
import {DistanceAdapterInterface} from './distance/distance.adapter.interface';
import {PointInterface} from '../../points/point.interface';

export class GeoLibAdapter implements GeoLibAdapterInterface {

  private distanceAdapter: DistanceAdapterInterface;

  constructor() {
    this.distanceAdapter = new DistanceVincenty();
  }

  getDistance(points: PointInterface[]): number {
    return this.distanceAdapter.getDistance(points);
  }
}
