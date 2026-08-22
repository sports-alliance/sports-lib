import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataCadence } from '../../../../data/data.cadence';
import { DataTemperature } from '../../../../data/data.temperature';
import { DataDepth } from '../../../../data/data.depth';
import {
  DataAirTimeRemaining,
  DataCNSLoad,
  DataDiveAscentRate,
  DataN2Load,
  DataNextStopDepth,
  DataNextStopTime,
  DataNoDecompressionLimit,
  DataPO2,
  DataPressureSAC,
  DataRMV,
  DataTimeToSurface,
  DataVolumeSAC
} from '../../../../data/data.dive';
import { DataDistance } from '../../../../data/data.distance';
import { DataSpeed } from '../../../../data/data.speed';
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
import { DataPowerBalanceLeft } from '../../../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../../../data/data.power-balance-right';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';
import { DataGroundContactTimeBalanceLeft } from '../../../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../../../data/data-ground-contact-time-balance-right';
import { DataStanceTime } from '../../../../data/data.stance-time';
import { DataStanceTimeBalanceLeft } from '../../../../data/data-stance-time-balance-left';

import { DataStepLength } from '../../../../data/data.step-length';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataVerticalRatio } from '../../../../data/data.vertical-ratio';
import { DataGroundTime } from '../../../../data/data.ground-time';
import { DataAirPower } from '../../../../data/data.air-power';
import { DataGrit } from '../../../../data/data.grit';
import { DataFlow } from '../../../../data/data.flow';
import { DataPotentialStamina, DataStamina } from '../../../../data/data.stamina';
import {
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight
} from '../../../../data/data.running-dynamics-balance';
import { DataLeftTorqueEffectiveness } from '../../../../data/data.left-torque-effectiveness';
import { DataRightTorqueEffectiveness } from '../../../../data/data.right-torque-effectiveness';
import { DataLeftPedalSmoothness } from '../../../../data/data.left-pedal-smoothness';
import { DataRightPedalSmoothness } from '../../../../data/data.right-pedal-smoothness';
import {
  ALTITUDE_PRECISION_NUMBER_OF_DECIMAL_PLACES,
  GNSS_DEGREES_PRECISION_NUMBER_OF_DECIMAL_PLACES
} from '../../../../constants/constants';
import { SampleInfo } from '../sample-info.interface';

const getPositiveBalanceValue = (sample: any, fieldName: string): number | null => {
  const value = sample[fieldName];
  return isNumber(value) && value > 0 ? value : null;
};

const getPositiveBalanceComplementValue = (sample: any, fieldName: string): number | null => {
  const value = getPositiveBalanceValue(sample, fieldName);
  return value === null ? null : 100 - value;
};

export const FITSampleMapper: {
  dataType: string;
  getSampleValue(sample: any, sampleInfo?: SampleInfo): number | null;
}[] = [
  {
    dataType: DataLatitudeDegrees.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.position_lat)
        ? Math.round(sample.position_lat * Math.pow(10, GNSS_DEGREES_PRECISION_NUMBER_OF_DECIMAL_PLACES)) /
            Math.pow(10, GNSS_DEGREES_PRECISION_NUMBER_OF_DECIMAL_PLACES)
        : sample.position_lat;
    }
  },
  {
    dataType: DataLongitudeDegrees.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.position_long)
        ? Math.round(sample.position_long * Math.pow(10, GNSS_DEGREES_PRECISION_NUMBER_OF_DECIMAL_PLACES)) /
            Math.pow(10, GNSS_DEGREES_PRECISION_NUMBER_OF_DECIMAL_PLACES)
        : sample.position_long;
    }
  },
  {
    dataType: DataDistance.type,
    getSampleValue: (sample: any) => {
      // TODO(sports-lib): fix duplicate distance-family outputs at the source by reading FIT field units/metadata
      // instead of blindly preferring `distance`/`Distance`. Some vendor exports can mix differently-scaled fields.
      return isNumber(sample.distance) ? sample.distance : sample.Distance;
    }
  },
  {
    dataType: DataHeartRate.type,
    getSampleValue: (sample: any) => {
      return sample.heart_rate;
    }
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: (sample: any) => {
      const altitude = isNumber(sample.enhanced_altitude)
        ? sample.enhanced_altitude
        : isNumber(sample.EnhancedAltitude)
          ? sample.EnhancedAltitude
          : isNumber(sample.altitude)
            ? sample.altitude
            : isNumber(sample.Altitude)
              ? sample.Altitude
              : null;
      return isNumber(altitude)
        ? Math.round(altitude * Math.pow(10, ALTITUDE_PRECISION_NUMBER_OF_DECIMAL_PLACES)) /
            Math.pow(10, ALTITUDE_PRECISION_NUMBER_OF_DECIMAL_PLACES)
        : altitude;
    }
  },
  {
    dataType: DataStrydAltitude.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.Elevation)
        ? Math.round(sample.Elevation * Math.pow(10, ALTITUDE_PRECISION_NUMBER_OF_DECIMAL_PLACES)) /
            Math.pow(10, ALTITUDE_PRECISION_NUMBER_OF_DECIMAL_PLACES)
        : sample.Elevation;
    }
  },
  {
    dataType: DataStrydDistance.type,
    getSampleValue: (sample: any) => {
      return sample.Distance;
    }
  },
  {
    dataType: DataStrydSpeed.type,
    getSampleValue: (sample: any) => {
      return sample.Speed;
    }
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (sample: any) => {
      let cadenceValue = sample.cadence;
      if (isNumber(sample.fractional_cadence)) {
        cadenceValue += sample.fractional_cadence;
      }
      return cadenceValue;
    }
  },
  {
    dataType: DataSpeed.type,
    getSampleValue: (sample: any) => {
      // TODO(sports-lib): fix duplicate speed-family outputs at the source by normalizing vendor-specific speed keys
      // (`enhanced_speed`, `speed`, `Speed`) with explicit unit handling. This should guarantee one canonical base stream.
      if (isNumber(sample.enhanced_speed)) {
        return sample.enhanced_speed;
      }

      if (isNumber(sample.EnhancedSpeed)) {
        return sample.EnhancedSpeed;
      }

      if (isNumber(sample.speed)) {
        return sample.speed;
      }

      if (isNumber(sample.Speed)) {
        return sample.Speed;
      }

      return null;
    }
  },
  {
    dataType: DataVerticalSpeed.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_speed;
    }
  },
  {
    dataType: DataPower.type,
    getSampleValue: (sample: any, sampleInfo?: SampleInfo) => {
      // Ensure power stream compliance when in some cases power sample field could be missing even if others samples have it
      // Just set watts to 0 when this happen
      // Case example: ride file "7432332116.fit"  from integration tests
      const watts = isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power;
      return sampleInfo?.hasPowerMeter ? watts || 0 : null;
    }
  },
  {
    dataType: DataAccumulatedPower.type,
    getSampleValue: (sample: any) => {
      return sample.accumulated_power;
    }
  },
  {
    dataType: DataTemperature.type,
    getSampleValue: (sample: any) => {
      return sample.temperature;
    }
  },
  {
    dataType: DataDepth.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.depth) && sample.depth >= 0 ? sample.depth / 1000 : null;
    }
  },
  {
    dataType: DataNextStopDepth.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.next_stop_depth) && sample.next_stop_depth >= 0 ? sample.next_stop_depth / 1000 : null;
    }
  },
  {
    dataType: DataNextStopTime.type,
    getSampleValue: (sample: any) => sample.next_stop_time
  },
  {
    dataType: DataTimeToSurface.type,
    getSampleValue: (sample: any) => sample.time_to_surface
  },
  {
    dataType: DataNoDecompressionLimit.type,
    getSampleValue: (sample: any) => sample.ndl_time
  },
  {
    dataType: DataCNSLoad.type,
    getSampleValue: (sample: any) => sample.cns_load
  },
  {
    dataType: DataN2Load.type,
    getSampleValue: (sample: any) => sample.n2_load
  },
  {
    dataType: DataAirTimeRemaining.type,
    getSampleValue: (sample: any) => sample.air_time_remaining
  },
  {
    dataType: DataPressureSAC.type,
    getSampleValue: (sample: any) => sample.pressure_sac
  },
  {
    dataType: DataVolumeSAC.type,
    getSampleValue: (sample: any) => sample.volume_sac
  },
  {
    dataType: DataRMV.type,
    getSampleValue: (sample: any) => sample.rmv
  },
  {
    dataType: DataPO2.type,
    getSampleValue: (sample: any) => sample.po_2
  },
  {
    dataType: DataDiveAscentRate.type,
    getSampleValue: (sample: any) => sample.ascent_rate
  },
  {
    dataType: DataFormPower.type,
    getSampleValue: (sample: any) => {
      return sample['Form Power'];
    }
  },
  {
    dataType: DataAirPower.type,
    getSampleValue: (sample: any) => {
      return sample['Air Power'];
    }
  },
  {
    dataType: DataGroundTime.type,
    getSampleValue: (sample: any) => {
      return sample['Ground Time'];
    }
  },
  {
    dataType: DataLegStiffness.type,
    getSampleValue: (sample: any) => {
      return sample['Leg Spring Stiffness'];
    }
  },
  {
    dataType: DataVerticalOscillation.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_oscillation;
    }
  },
  {
    dataType: DataPowerBalanceRight.type,
    getSampleValue: (sample: any) => {
      if (!sample.left_right_balance) {
        return null;
      }

      return sample.left_right_balance.right === true
        ? sample.left_right_balance.value
        : 100 - sample.left_right_balance.value;
    }
  },
  // @todo if conservation of data is needed this can be taken of and generated on the fly
  {
    dataType: DataPowerBalanceLeft.type,
    getSampleValue: (sample: any) => {
      if (!sample.left_right_balance) {
        return null;
      }
      return sample.left_right_balance.right === false
        ? sample.left_right_balance.value
        : 100 - sample.left_right_balance.value;
    }
  },
  {
    dataType: DataGroundContactTime.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.stance_time)
        ? sample.stance_time
        : isNumber(sample['Ground Time'])
          ? sample['Ground Time']
          : null;
    }
  },
  // Keep DataStanceTime for backward compatibility
  {
    dataType: DataStanceTime.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.stance_time)
        ? sample.stance_time
        : isNumber(sample['Ground Time'])
          ? sample['Ground Time']
          : null;
    }
  },

  {
    dataType: DataGroundContactTimeBalanceLeft.type,
    getSampleValue: (sample: any) => {
      // The FIT stance_time_balance field refers to the balance on the left leg.
      return getPositiveBalanceValue(sample, 'stance_time_balance');
    }
  },
  {
    dataType: DataGroundContactTimeBalanceRight.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceComplementValue(sample, 'stance_time_balance');
    }
  },
  {
    dataType: DataVerticalOscillationBalanceLeft.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceValue(sample, 'Vertical Oscillation Balance');
    }
  },
  {
    dataType: DataVerticalOscillationBalanceRight.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceComplementValue(sample, 'Vertical Oscillation Balance');
    }
  },
  {
    dataType: DataLegSpringStiffnessBalanceLeft.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceValue(sample, 'Leg Spring Stiffness Balance');
    }
  },
  {
    dataType: DataLegSpringStiffnessBalanceRight.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceComplementValue(sample, 'Leg Spring Stiffness Balance');
    }
  },
  {
    dataType: DataImpactLoadingRateBalanceLeft.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceValue(sample, 'Impact Loading Rate Balance');
    }
  },
  {
    dataType: DataImpactLoadingRateBalanceRight.type,
    getSampleValue: (sample: any) => {
      return getPositiveBalanceComplementValue(sample, 'Impact Loading Rate Balance');
    }
  },
  // Keep DataStanceTimeBalanceLeft for backward compatibility
  {
    dataType: DataStanceTimeBalanceLeft.type,
    getSampleValue: (sample: any) => {
      // The FIT stance_time_balance field refers to the balance on the left leg.
      return getPositiveBalanceValue(sample, 'stance_time_balance');
    }
  },

  {
    dataType: DataStepLength.type,
    getSampleValue: (sample: any) => {
      return sample.step_length / 1000;
    }
  },
  {
    dataType: DataEffortPace.type,
    getSampleValue: (sample: any) => {
      if (!isNumber(sample['Effort Pace']) || sample['Effort Pace'] <= 0) {
        return null;
      }

      const effortPace = convertSpeedToPace(sample['Effort Pace']);
      return Number.isFinite(effortPace) ? effortPace : null;
    }
  },
  {
    dataType: DataVerticalRatio.type,
    getSampleValue: (sample: any) => {
      return sample.vertical_ratio;
    }
  },
  {
    dataType: DataStamina.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.stamina) ? sample.stamina : null;
    }
  },
  {
    dataType: DataPotentialStamina.type,
    getSampleValue: (sample: any) => {
      return isNumber(sample.potential_stamina) ? sample.potential_stamina : null;
    }
  },
  {
    dataType: DataGrit.type,
    getSampleValue: (sample: any) => {
      return sample.grit;
    }
  },
  {
    dataType: DataFlow.type,
    getSampleValue: (sample: any) => {
      return sample.flow;
    }
  },
  {
    dataType: DataLeftTorqueEffectiveness.type,
    getSampleValue: (sample: any) => {
      return sample.left_torque_effectiveness;
    }
  },
  {
    dataType: DataRightTorqueEffectiveness.type,
    getSampleValue: (sample: any) => {
      return sample.right_torque_effectiveness;
    }
  },
  {
    dataType: DataLeftPedalSmoothness.type,
    getSampleValue: (sample: any) => {
      return sample.left_pedal_smoothness;
    }
  },
  {
    dataType: DataRightPedalSmoothness.type,
    getSampleValue: (sample: any) => {
      return sample.right_pedal_smoothness;
    }
  }
];
