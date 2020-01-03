import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { IntensityZonesJSONInterface } from './intensity-zones.json.interface';
export interface IntensityZonesInterface extends SerializableClassInterface {
    type: string;
    zone1Duration: number;
    zone2Duration: number;
    zone3Duration: number;
    zone4Duration: number;
    zone5Duration: number;
    zone2LowerLimit?: number;
    zone3LowerLimit?: number;
    zone4LowerLimit?: number;
    zone5LowerLimit?: number;
    toJSON(): IntensityZonesJSONInterface;
}
