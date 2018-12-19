import {IntensityZonesInterface} from './intensity-zones.interface';
import {IntensityZonesJSONInterface} from './intensity-zones.json.interface';

export class IntensityZones implements IntensityZonesInterface {
  type: string;
  zone1Duration!: number;
  zone2Duration!: number;
  zone2LowerLimit!: number;
  zone3Duration!: number;
  zone3LowerLimit!: number;
  zone4Duration!: number;
  zone4LowerLimit!: number;
  zone5Duration!: number;
  zone5LowerLimit!: number;

  constructor(type: string){
    this.type = type;
  }
  toJSON(): IntensityZonesJSONInterface {
    return {
      type: this.type,
      zone1Duration: this.zone1Duration,
      zone2Duration: this.zone2Duration,
      zone2LowerLimit: this.zone2LowerLimit,
      zone3Duration: this.zone3Duration,
      zone3LowerLimit: this.zone3LowerLimit,
      zone4Duration: this.zone4Duration,
      zone4LowerLimit: this.zone4LowerLimit,
      zone5Duration: this.zone5Duration,
      zone5LowerLimit: this.zone5LowerLimit,
    }
  }
}