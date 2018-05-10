import { DistanceAdapterInterface } from './distance.adapter.interface';
import { PointInterface } from '../../../points/point.interface';
export declare class DistanceVincenty implements DistanceAdapterInterface {
    getDistance(points: PointInterface[], accuracyInMeters?: number, precision?: number): number;
}
