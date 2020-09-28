import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataCadence } from '../../../../data/data.cadence';
import { DataTemperature } from '../../../../data/data.temperature';
import { DataDistance } from '../../../../data/data.distance';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPace } from '../../../../data/data.pace';
import { DataVerticalSpeed } from '../../../../data/data.vertical-speed';
import { DataPower } from '../../../../data/data.power';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { DataFormPower } from '../../../../data/data.form-power';
import { DataLegStiffness } from '../../../../data/data.leg-stiffness';
import { DataVerticalOscillation } from '../../../../data/data.vertical-oscillation';
import { convertSpeedToPace, isNumber } from '../../../utilities/helpers';
import { DataAccumulatedPower } from '../../../../data/data.accumulated-power';
import { DataStrydAltitude } from '../../../../data/data.stryd-altitude';
import { DataStrydDistance } from '../../../../data/data.stryd-distance';
import { DataStrydSpeed } from '../../../../data/data.stryd-speed';
import { DataRightBalance } from '../../../../data/data.right-balance';
import { DataLeftBalance } from '../../../../data/data.left-balance';
import { DataStanceTime } from '../../../../data/data.stance-time';
import { DataStanceTimeBalance } from '../../../../data/data.stance-time-balance';
import { DataStepLength } from '../../../../data/data.step-length';
import { DataVerticalRatio } from '../../../../data/data.vertical-ratio';
import { DataGroundTime } from '../../../../data/data.ground-time';
import { DataAirPower } from '../../../../data/data.air-power';

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
      return isNumber(sample.enhanced_altitude) ? sample.enhanced_altitude : sample.altitude;
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
      return sample.enhanced_speed || sample.speed
    },
  },
  {
    dataType: DataPace.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.enhanced_speed) || isNumber(sample.speed) ? convertSpeedToPace(sample.enhanced_speed || sample.speed) : null;
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
      return isNumber(sample.power)
        ? sample.power
        : isNumber(sample.Power)
          ? sample.power
          : sample.RP_Power
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
    dataType: DataAirPower.type,
    getSampleValue: (sample: any) => {
      return sample['Air Power'];
    },
  },
  {
    dataType: DataGroundTime.type,
    getSampleValue: (sample: any) => {
      return sample['Ground Time'] / 1000;
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
  // @todo if conservation of data is needed this can be taken of and generated on the fly
  {
    dataType: DataLeftBalance.type,
    getSampleValue: (sample: any) => {
      if (!sample.left_right_balance) {
        return null;
      }
      return sample.left_right_balance.right === false ? sample.left_right_balance.value : 100 - sample.left_right_balance.value;
    },
  },
  {
    dataType: DataStanceTime.type,
    getSampleValue: (sample: any) => {
      return sample.stance_time;
    },
  },
  {
    dataType: DataStanceTimeBalance.type,
    getSampleValue: (sample: any) => {
      return sample.stance_time_balance;
    },
  },
  {
    dataType: DataStepLength.type,
    getSampleValue: (sample: any) => {
      return sample.step_length / 1000;
    },
  },
  {
    dataType: DataVerticalRatio.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_ratio;
    },
  },
];
