import { GeoLibAdapterInterface } from './adapter.interface';
import { PointInterface } from '../../points/point.interface';
export declare class GeoLibAdapter implements GeoLibAdapterInterface {
    private distanceAdapter;
    constructor();
    getDistance(points: PointInterface[]): number;
}
