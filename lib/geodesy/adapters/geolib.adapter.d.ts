import { GeoLibAdapterInterface } from './adapter.interface';
import { DataPositionInterface } from '../../data/data.position.interface';
export declare class GeoLibAdapter implements GeoLibAdapterInterface {
    findNearest: (point: import("geolib/es/types").GeolibInputCoordinates, coords: import("geolib/es/types").GeolibInputCoordinates[]) => import("geolib/es/types").GeolibInputCoordinates;
    constructor();
    getDistance(positionArray: DataPositionInterface[]): number;
}
