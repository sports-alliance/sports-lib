import { GeoLibAdapterInterface } from './adapter.interface';
import { DistanceAdapterInterface } from './distance/distance.adapter.interface';
import { PointInterface } from '../../points/point.interface';
export declare class GeoLibAdapter implements GeoLibAdapterInterface {
    distanceAdapter: DistanceAdapterInterface;
    constructor(useSimpleDistance?: boolean);
    getDistance(points: PointInterface[], accuracyInMeters?: number, precision?: number): number;
}
