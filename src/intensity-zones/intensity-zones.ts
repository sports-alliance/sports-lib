import { IntensityZonesInterface } from './intensity-zones.interface';
import { IntensityZonesJSONInterface } from './intensity-zones.json.interface';
import { isNumber } from '../events/utilities/helpers';

export class IntensityZones implements IntensityZonesInterface {
  type: string;
  zone1Duration!: number;
  zone2Duration!: number;
  zone3Duration!: number;
  zone4Duration!: number;
  zone5Duration!: number;
  zone2LowerLimit?: number;
  zone3LowerLimit?: number;
  zone4LowerLimit?: number;
  zone5LowerLimit?: number;

  constructor(type: string) {
    this.type = type;
  }

  toJSON(): IntensityZonesJSONInterface {
    const json: IntensityZonesJSONInterface = {
      type: this.type,
      zone1Duration: this.zone1Duration,
      zone2Duration: this.zone2Duration,
      zone3Duration: this.zone3Duration,
      zone4Duration: this.zone4Duration,
      zone5Duration: this.zone5Duration
    };
    if (isNumber(this.zone2LowerLimit)) {
      json.zone2LowerLimit = this.zone2LowerLimit;
    }
    if (isNumber(this.zone3LowerLimit)) {
      json.zone3LowerLimit = this.zone3LowerLimit;
    }
    if (isNumber(this.zone4LowerLimit)) {
      json.zone4LowerLimit = this.zone4LowerLimit;
    }
    if (isNumber(this.zone5LowerLimit)) {
      json.zone5LowerLimit = this.zone5LowerLimit;
    }
    return json;
  }
}
