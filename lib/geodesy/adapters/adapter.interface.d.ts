import { DataPositionInterface } from '../../data/data.position.interface';
export interface GeoLibAdapterInterface {
    getDistance(positionArray: DataPositionInterface[]): number;
}
