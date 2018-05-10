import { DistanceAdapterInterface } from './distance.adapter.interface';
import { PointInterface } from '../../../points/point.interface';
export declare class DistanceSimple implements DistanceAdapterInterface {
    getDistance(points: PointInterface[], accuracyInMeters?: number): number;
}
