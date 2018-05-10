import { SerializableClassInterface } from '../serializable/serializable.class.interface';
export declare class GeoLocationInfo implements SerializableClassInterface {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    province?: string;
    constructor(latitude: number, longitude: number);
    toJSON(): any;
}
