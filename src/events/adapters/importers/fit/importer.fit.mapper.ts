import {DataLatitudeDegrees} from '../../../../data/data.latitude-degrees';
import {DataAltitude} from '../../../../data/data.altitude';
import {DataHeartRate} from '../../../../data/data.heart-rate';
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
import {convertSpeedToPace, isNumber} from '../../../utilities/helpers';
import {DataAccumulatedPower} from '../../../../data/data.accumulated-power';
import {DataStrydAltitude} from '../../../../data/data.stryd-altitude';
import {DataStrydDistance} from '../../../../data/data.stryd-distance';
import {DataStrydSpeed} from '../../../../data/data.stryd-speed';
import {DataRightBalance} from '../../../../data/data.right-balance';
import {DataLeftBalance} from '../../../../data/data.left-balance';

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
    dataType: DataStrydAltitude.type,
    getSampleValue: (sample: any) => {
      return sample.Elevation;
    },
  },
  {
    dataType: DataStrydDistance.type,
    getSampleValue: (sample: any) => {
      return sample.Distance;
    },
  },
  {
    dataType: DataStrydSpeed.type,
    getSampleValue: (sample: any) => {
      return sample.Speed;
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
    dataType: DataAccumulatedPower.type,
    getSampleValue: (sample: any) => {
      return sample.accumulated_power;
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
  {
    dataType: DataRightBalance.type,
    getSampleValue: (sample: any) => {
      if (!sample.left_right_balance) {
        return null;
      }

      return sample.left_right_balance.right === true ? sample.left_right_balance.value : 100 - sample.left_right_balance.value;
    },
  },
  {
    dataType: DataLeftBalance.type,
    getSampleValue: (sample: any) => {
      if (!sample.left_right_balance) {
        return null;
      }
      return sample.left_right_balance.right === false ? sample.left_right_balance.value : 100 - sample.left_right_balance.value;
    },
  },
];
