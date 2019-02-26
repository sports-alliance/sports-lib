import { GeoLibAdapterInterface } from './adapter.interface';
import { DataPositionInterface } from '../../data/data.position.interface';
export declare class GeoLibAdapter implements GeoLibAdapterInterface {
    constructor();
    getDistance(positionArray: DataPositionInterface[]): number;
}
