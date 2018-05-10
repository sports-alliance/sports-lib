import { IntensityZonesInterface } from './intensity-zone.interface';
export declare class IntensityZones implements IntensityZonesInterface {
    zone1Duration: number;
    zone2Duration: number;
    zone2LowerLimit: number;
    zone3Duration: number;
    zone3LowerLimit: number;
    zone4Duration: number;
    zone4LowerLimit: number;
    zone5Duration: number;
    zone5LowerLimit: number;
    toJSON(): any;
}
