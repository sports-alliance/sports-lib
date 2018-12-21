import {DataLatitudeDegrees} from '../../../../data/data.latitude-degrees';
import {DataAltitude} from '../../../../data/data.altitude';
import {DataHeartRate} from '../../../../data/data.heart-rate';
import {convertSpeedToPace, isNumber, isNumberOrString} from '../../../utilities/event.utilities';
import {DataCadence} from '../../../../data/data.cadence';
import {DataTemperature} from '../../../../data/data.temperature';
import {DataDistance} from '../../../../data/data.distance';
import {DataSeaLevelPressure} from '../../../../data/data.sea-level-pressure';
import {DataSpeed} from '../../../../data/data.speed';
import {DataPace} from '../../../../data/data.pace';
import {DataVerticalSpeed} from '../../../../data/data.vertical-speed';
import {DataPower} from '../../../../data/data.power';
import {DataLongitudeDegrees} from '../../../../data/data.longitude-degrees';
import {DataFormPower} from '../../../../data/data.form-power';
import {DataLegStiffness} from '../../../../data/data.leg-stiffness';
import {DataVerticalOscillation} from '../../../../data/data.vertical-oscillation';

export const FITSampleMapper: { dataType: string, getSampleValue(sample: any): number | null }[] = [
  {
    dataType: DataLatitudeDegrees.type,
    getSampleValue: (sample: any) => {
      return sample.position_lat;
    },
  },
  {
    dataType: DataLongitudeDegrees.type,
    getSampleValue: (sample: any) => {
      return sample.position_long;
    },
  },
  {
    dataType: DataDistance.type,
    getSampleValue: (sample: any) => {
      return sample.distance;
    },
  },
  {
    dataType: DataHeartRate.type,
    getSampleValue: (sample: any) => {
      return sample.heart_rate;
    },
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: (sample: any) => {
      return sample.altitude;
    },
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (sample: any) => {
      let cadenceValue = sample.cadence;
      if (isNumber(sample.fractional_cadence)) {
        cadenceValue += sample.fractional_cadence;
      }
      return cadenceValue;
    },
  },
  {
    dataType: DataSpeed.type,
    getSampleValue: (sample: any) => {
      return sample.speed;
    },
  },
  {
    dataType: DataPace.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.speed) ? convertSpeedToPace(sample.speed) : null;
    },
  },
  {
    dataType: DataVerticalSpeed.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_speed;
    },
  },
  {
    dataType: DataPower.type,
    getSampleValue: (sample: any) => {
      return sample.power;
    },
  },
  {
    dataType: DataTemperature.type,
    getSampleValue: (sample: any) => {
      return sample.temperature;
    },
  },
  {
    dataType: DataFormPower.type,
    getSampleValue: (sample: any) => {
      return sample['Form Power'];
    },
  },
  {
    dataType: DataLegStiffness.type,
    getSampleValue: (sample: any) => {
      return sample['Leg Spring Stiffness'];
    },
  },
  {
    dataType: DataVerticalOscillation.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_oscillation;
    },
  },
];
