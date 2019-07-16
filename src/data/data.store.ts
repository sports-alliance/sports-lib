import {
  DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';
import {DataTemperature} from './data.temperature';
import {
  DataSpeed, DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';
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
import {
  DataVerticalSpeedMin, DataVerticalSpeedMinFeetPerHour, DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinFeetPerSecond, DataVerticalSpeedMinKilometerPerHour, DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinMetersPerMinute, DataVerticalSpeedMinMilesPerHour
} from './data.vertical-speed-min';
import {
  DataVerticalSpeedMax, DataVerticalSpeedMaxFeetPerHour, DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxFeetPerSecond, DataVerticalSpeedMaxKilometerPerHour, DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxMetersPerMinute, DataVerticalSpeedMaxMilesPerHour
} from './data.vertical-speed-max';
import {
  DataVerticalSpeedAvg, DataVerticalSpeedAvgFeetPerHour, DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgFeetPerSecond, DataVerticalSpeedAvgKilometerPerHour, DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgMetersPerMinute, DataVerticalSpeedAvgMilesPerHour
} from './data.vertical-speed-avg';
import {DataTemperatureMin} from './data.temperature-min';
import {DataTemperatureMax} from './data.temperature-max';
import {DataTemperatureAvg} from './data.temperature-avg';
import {
  DataSpeedMin, DataSpeedMinFeetPerMinute, DataSpeedMinFeetPerSecond,
  DataSpeedMinKilometersPerHour, DataSpeedMinMetersPerMinute,
  DataSpeedMinMilesPerHour,

} from './data.speed-min';
import {
  DataSpeedMax, DataSpeedMaxFeetPerMinute, DataSpeedMaxFeetPerSecond,
  DataSpeedMaxKilometersPerHour, DataSpeedMaxMetersPerMinute,
  DataSpeedMaxMilesPerHour,

} from './data.speed-max';
import {
  DataSpeedAvg, DataSpeedAvgFeetPerMinute,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgKilometersPerHour, DataSpeedAvgMetersPerMinute,
  DataSpeedAvgMilesPerHour,
} from './data.speed-avg';
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
import {DataPaceMin, DataPaceMinMinutesPerMile} from './data.pace-min';
import {DataPaceMax, DataPaceMaxMinutesPerMile} from './data.pace-max';
import {DataPaceAvg, DataPaceAvgMinutesPerMile} from './data.pace-avg';
import {DataPace, DataPaceMinutesPerMile} from './data.pace';
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
import {DataFootPodUsed} from './data.foot-pod-used';
import {DataAutoPauseUsed} from './data.auto-pause-used';
import {DataAutoLapDuration} from './data.auto-lap-duration';
import {DataAutoLapDistance} from './data.auto-lap-distance';
import {DataAutoLapUsed} from './data.auto-lap-used';
import {DataBikePodUsed} from './data.bike-pod-used';
import {DataEnabledNavigationSystems} from './data.enabled-navigation-systems';
import {DataHeartRateUsed} from './data.heart-rate-used';
import {DataPowerPodUsed} from './data.power-pod-used';
import {DataAltiBaroProfile} from './data.alti-baro-profile';
import {DataIBI} from './data.ibi';
import {DataSteps} from './data.steps';
import {DataElevation} from './data.elevation';
import {DataPoolLength} from './data.pool-length';
import {DataDeviceLocation} from './data.device-location';
import {DataPeakEPOC} from './data.peak-epoc';
import {DataDeviceNames} from './data.device-names';
import {DataActivityTypes} from './data.activity-types';
import {DataStartAltitude} from './data.start-altitude';
import {DataEndAltitude} from './data.end-altitude';
import {DataSwimPace, DataSwimPaceMinutesPer100Yard} from './data.swim-pace';
import {DataSwimPaceAvg, DataSwimPaceAvgMinutesPer100Yard} from './data.swim-pace-avg';
import {DataSwimPaceMax, DataSwimPaceMaxMinutesPer100Yard} from './data.swim-pace-max';
import {DataSwimPaceMin, DataSwimPaceMinMinutesPer100Yard} from './data.swim-pace-min';
import {DataSWOLFAvg} from './data.swolf-avg';

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
  DataSwimPace,
  DataSwimPaceMin,
  DataSwimPaceMax,
  DataSwimPaceAvg,
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
  DataSpeedKilometersPerHour,
  DataSpeedMilesPerHour,
  DataSpeedFeetPerSecond,
  DataSpeedMetersPerMinute,
  DataSpeedFeetPerMinute,
  DataSpeedAvgKilometersPerHour,
  DataSpeedAvgMilesPerHour,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgMetersPerMinute,
  DataSpeedAvgFeetPerMinute,
  DataSpeedMinKilometersPerHour,
  DataSpeedMinMilesPerHour,
  DataSpeedMinFeetPerSecond,
  DataSpeedMinMetersPerMinute,
  DataSpeedMinFeetPerMinute,
  DataSpeedMaxKilometersPerHour,
  DataSpeedMaxMilesPerHour,
  DataSpeedMaxFeetPerSecond,
  DataSpeedMaxMetersPerMinute,
  DataSpeedMaxFeetPerMinute,
  DataPaceMinutesPerMile,
  DataPaceAvgMinutesPerMile,
  DataPaceMinMinutesPerMile,
  DataPaceMaxMinutesPerMile,
  DataSwimPaceMinutesPer100Yard,
  DataSwimPaceAvgMinutesPer100Yard,
  DataSwimPaceMinMinutesPer100Yard,
  DataSwimPaceMaxMinutesPer100Yard,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMilesPerHour,
  DataVerticalSpeedAvgFeetPerSecond,
  DataVerticalSpeedAvgMetersPerMinute,
  DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgFeetPerHour,
  DataVerticalSpeedAvgKilometerPerHour,
  DataVerticalSpeedAvgMilesPerHour,
  DataVerticalSpeedMaxFeetPerSecond,
  DataVerticalSpeedMaxMetersPerMinute,
  DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxFeetPerHour,
  DataVerticalSpeedMaxKilometerPerHour,
  DataVerticalSpeedMaxMilesPerHour,
  DataVerticalSpeedMinFeetPerSecond,
  DataVerticalSpeedMinMetersPerMinute,
  DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinFeetPerHour,
  DataVerticalSpeedMinKilometerPerHour,
  DataVerticalSpeedMinMilesPerHour,
  DataIBI,
  DataSteps,
  DataElevation,
  DataPoolLength,
  DataDeviceLocation,
  DataPeakEPOC,
  DataActivityTypes,
  DataDeviceNames,
  DataStartAltitude,
  DataEndAltitude,
  DataSWOLFAvg,
};

export class DynamicDataLoader {

  // Convert to enums please
  static basicDataTypes =
    [
      DataHeartRate.type,
      DataAltitude.type,
      DataCadence.type,
      DataPower.type,
      DataPace.type,
      DataSpeed.type
    ];

  static advancedDataTypes = [
    DataVerticalSpeed.type,
    DataTemperature.type,
    DataSeaLevelPressure.type,
    DataSatellite5BestSNR.type,
    DataNumberOfSatellites.type,
    DataEVPE.type,
    DataEHPE.type,
    DataDistance.type,
    DataGPSAltitude.type,
    DataAbsolutePressure.type,
    DataPeakTrainingEffect.type,
    DataEPOC.type,
    DataEnergy.type,
    DataBatteryCharge.type,
    DataBatteryCurrent.type,
    DataBatteryVoltage.type,
    DataBatteryConsumption.type,
    DataFormPower.type,
    DataLegStiffness.type,
    DataVerticalOscillation.type,
    DataTotalTrainingEffect.type,
    DataIBI.type,
    DataElevation.type,
  ];

  static unitBasedDataTypes: DataTypeUnitGroups = {
    [DataSpeed.type]: [
      DataSpeedKilometersPerHour.type,
      DataSpeedMilesPerHour.type,
      DataSpeedFeetPerSecond.type,
      // Pace is also based on speed
      DataPace.type,
      DataPaceMinutesPerMile.type,
      // Swim pace as well
      DataSwimPace.type,
      DataSwimPaceMaxMinutesPer100Yard.type,
    ],
    [DataVerticalSpeed.type]: [
      DataVerticalSpeedFeetPerSecond.type,
      DataVerticalSpeedMetersPerMinute.type,
      DataVerticalSpeedFeetPerMinute.type,
      DataVerticalSpeedMetersPerHour.type,
      DataVerticalSpeedFeetPerHour.type,
      DataVerticalSpeedKilometerPerHour.type,
      DataVerticalSpeedMilesPerHour.type,
    ],
  };

  static allDataTypes = DynamicDataLoader.basicDataTypes.concat(DynamicDataLoader.advancedDataTypes);

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

  static isUnitDerivedDataType(dataType: string): boolean {
    return Object.values(this.unitBasedDataTypes).reduce((accu, item) => accu.concat(item), []).indexOf(dataType) !== -1;
  }
}


export interface DataTypeUnitGroups {
  [type: string]: string[]
}
