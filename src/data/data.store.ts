import {DataVerticalSpeed} from './data.vertical-speed';
import {DataTemperature} from './data.temperature';
import {DataSpeed} from './data.speed';
import {DataSeaLevelPressure} from './data.sea-level-pressure';
import {DataSatellite5BestSNR} from './data.satellite-5-best-snr';
import {DataAbsolutePressure} from './data.absolute-pressure';
import {DataAltitude} from './data.altitude';
import {DataCadence} from './data.cadence';
import {DataDistance} from './data.distance';
import {DataDuration} from './data.duration';
import {DataEHPE} from './data.ehpe';
import {DataEVPE} from './data.evpe';
import {DataHeartRate} from './data.heart-rate';
import {DataLatitudeDegrees} from './data.latitude-degrees';
import {DataLongitudeDegrees} from './data.longitude-degrees';
import {DataNumberOfSatellites} from './data.number-of-satellites';
import {DataPower} from './data.power';
import {DataGPSAltitude} from './data.altitude-gps';
import {DataInterface} from './data.interface';
import {DataAltitudeMin} from './data.altitude-min';
import {DataAltitudeMax} from './data.altitude-max';
import {DataVO2Max} from './data.vo2-max';
import {DataVerticalSpeedMin} from './data.vertical-speed-min';
import {DataVerticalSpeedMax} from './data.vertical-speed-max';
import {DataVerticalSpeedAvg} from './data.vertical-speed-avg';
import {DataTemperatureMin} from './data.temperature-min';
import {DataTemperatureMax} from './data.temperature-max';
import {DataTemperatureAvg} from './data.temperature-avg';
import {DataSpeedMin} from './data.speed-min';
import {DataSpeedMax} from './data.speed-max';
import {DataSpeedAvg} from './data.speed-avg';
import {DataRecovery} from './data.recovery';
import {DataPowerMin} from './data.power-min';
import {DataPowerMax} from './data.power-max';
import {DataPowerAvg} from './data.power-avg';
import {DataPeakTrainingEffect} from './data.peak-training-effect';
import {DataPause} from './data.pause';
import {DataHeartRateMin} from './data.heart-rate-min';
import {DataHeartRateMax} from './data.heart-rate-max';
import {DataHeartRateAvg} from './data.heart-rate-avg';
import {DataFeeling} from './data.feeling';
import {DataEPOC} from './data.epoc';
import {DataEnergy} from './data.energy';
import {DataDescentTime} from './data.descent-time';
import {DataDescent} from './data.descent';
import {DataCadenceMin} from './data.cadence-min';
import {DataCadenceMax} from './data.cadence-max';
import {DataCadenceAvg} from './data.cadence-avg';
import {DataAscentTime} from './data.ascent-time';
import {DataAscent} from './data.ascent';
import {DataAltitudeAvg} from './data.altitude-avg';
import {DataFusedLocation} from './data.fused-location';
import {DataPaceMin} from './data.pace-min';
import {DataPaceMax} from './data.pace-max';
import {DataPaceAvg} from './data.pace-avg';
import {DataPace} from './data.pace';
import {DataFusedAltitude} from './data.fused-altitude';
import {DataBatteryCharge} from './data.battery-charge';
import {DataBatteryCurrent} from './data.battery-current';
import {DataBatteryVoltage} from './data.battery-voltage';
import {DataBatteryConsumption} from './data.battery-consumption';
import {DataBatteryLifeEstimation} from './data.battery-life-estimation';
import {DataFormPower} from './data.form-power';
import {DataLegStiffness} from './data.leg-stiffness';
import {DataVerticalOscillation} from './data.vertical-oscillation';
import {DataTotalTrainingEffect} from './data.total-training-effect';
import {DataNumberOfSamples} from './data-number-of.samples';
import {Data} from './data';
import {DataFootPodUsed} from "./data.foot-pod-used";
import {DataAutoPauseUsed} from "./data.auto-pause-used";
import {DataAutoLapDuration} from "./data.auto-lap-duration";
import {DataAutoLapDistance} from "./data.auto-lap-distance";
import {DataAutoLapUsed} from "./data.auto-lap-used";
import {DataBikePodUsed} from "./data.bike-pod-used";
import {DataEnabledNavigationSystems} from "./data.enabled-navigation-systems";
import {DataHeartRateUsed} from "./data.heart-rate-used";
import {DataPowerPodUsed} from "./data.power-pod-used";
import {DataAltiBaroProfile} from "./data.alti-baro-profile";

/**
 * Only concrete classes no abstracts
 */
export const DataStore: any = {
  DataVerticalSpeed,
  DataTemperature,
  DataSpeed,
  DataSeaLevelPressure,
  DataSatellite5BestSNR,
  DataPower,
  DataNumberOfSatellites,
  DataLongitudeDegrees,
  DataLatitudeDegrees,
  DataHeartRate,
  DataEVPE,
  DataEHPE,
  DataDuration,
  DataDistance,
  DataCadence,
  DataGPSAltitude,
  DataAltitude,
  DataAbsolutePressure,
  DataVO2Max,
  DataVerticalSpeedMin,
  DataVerticalSpeedMax,
  DataVerticalSpeedAvg,
  DataTemperatureMin,
  DataTemperatureMax,
  DataTemperatureAvg,
  DataSpeedMin,
  DataSpeedMax,
  DataSpeedAvg,
  DataRecovery,
  DataPowerMin,
  DataPowerMax,
  DataPowerAvg,
  DataPeakTrainingEffect,
  DataPause,
  DataHeartRateMin,
  DataHeartRateMax,
  DataHeartRateAvg,
  DataFeeling,
  DataEPOC,
  DataEnergy,
  DataDescentTime,
  DataDescent,
  DataCadenceMin,
  DataCadenceMax,
  DataCadenceAvg,
  DataAscentTime,
  DataAscent,
  DataAltitudeMin,
  DataAltitudeMax,
  DataAltitudeAvg,
  DataFusedLocation,
  DataFusedAltitude,
  DataPace,
  DataPaceMin,
  DataPaceMax,
  DataPaceAvg,
  DataNumberOfSamples,
  DataBatteryCharge,
  DataBatteryCurrent,
  DataBatteryVoltage,
  DataBatteryConsumption,
  DataBatteryLifeEstimation,
  DataFormPower,
  DataLegStiffness,
  DataVerticalOscillation,
  DataTotalTrainingEffect,
  DataFootPodUsed,
  DataAltiBaroProfile,
  DataAutoPauseUsed,
  DataAutoLapDuration,
  DataAutoLapDistance,
  DataAutoLapUsed,
  DataBikePodUsed,
  DataEnabledNavigationSystems,
  DataHeartRateUsed,
  DataPowerPodUsed,
};

export class DynamicDataLoader {
  static getDataInstanceFromDataType(dataType: string, opts: any): DataInterface {
    const className = Object.keys(DataStore).find((dataClass) => {
      return DataStore[dataClass] && DataStore[dataClass].type && DataStore[dataClass].type === dataType;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of \'${className}\' is not in the store`);
    }
    return new DataStore[className](opts);
  }

  static getDataClassFromDataType(dataType: string): any {
    const className = Object.keys(DataStore).find((dataClass) => {
      return DataStore[dataClass] && DataStore[dataClass].type && DataStore[dataClass].type === dataType;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of \'${dataType}\' is not in the store`);
    }
    return DataStore[className];
  }
}
