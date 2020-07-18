import {
  DataVerticalSpeed,
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';
import { DataTemperature } from './data.temperature';
import {
  DataSpeed,
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour, DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';
import { DataSeaLevelPressure } from './data.sea-level-pressure';
import { DataSatellite5BestSNR } from './data.satellite-5-best-snr';
import { DataAbsolutePressure } from './data.absolute-pressure';
import { DataAltitude } from './data.altitude';
import { DataCadence } from './data.cadence';
import { DataDistance, DataDistanceMiles } from './data.distance';
import { DataDuration } from './data.duration';
import { DataEHPE } from './data.ehpe';
import { DataEVPE } from './data.evpe';
import { DataHeartRate } from './data.heart-rate';
import { DataLatitudeDegrees } from './data.latitude-degrees';
import { DataLongitudeDegrees } from './data.longitude-degrees';
import { DataNumberOfSatellites } from './data.number-of-satellites';
import { DataPower } from './data.power';
import { DataGPSAltitude } from './data.altitude-gps';
import { DataInterface } from './data.interface';
import { DataAltitudeMin } from './data.altitude-min';
import { DataAltitudeMax } from './data.altitude-max';
import { DataVO2Max } from './data.vo2-max';
import {
  DataVerticalSpeedMin,
  DataVerticalSpeedMinFeetPerHour,
  DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinFeetPerSecond,
  DataVerticalSpeedMinKilometerPerHour,
  DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinMetersPerMinute,
  DataVerticalSpeedMinMilesPerHour
} from './data.vertical-speed-min';
import {
  DataVerticalSpeedMax,
  DataVerticalSpeedMaxFeetPerHour,
  DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxFeetPerSecond,
  DataVerticalSpeedMaxKilometerPerHour,
  DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxMetersPerMinute,
  DataVerticalSpeedMaxMilesPerHour
} from './data.vertical-speed-max';
import {
  DataVerticalSpeedAvg,
  DataVerticalSpeedAvgFeetPerHour,
  DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgFeetPerSecond,
  DataVerticalSpeedAvgKilometerPerHour,
  DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgMetersPerMinute,
  DataVerticalSpeedAvgMilesPerHour
} from './data.vertical-speed-avg';
import { DataTemperatureMin } from './data.temperature-min';
import { DataTemperatureMax } from './data.temperature-max';
import { DataTemperatureAvg } from './data.temperature-avg';
import {
  DataSpeedMin,
  DataSpeedMinFeetPerMinute,
  DataSpeedMinFeetPerSecond,
  DataSpeedMinKilometersPerHour, DataSpeedMinKnots,
  DataSpeedMinMetersPerMinute,
  DataSpeedMinMilesPerHour,
} from './data.speed-min';
import {
  DataSpeedMax,
  DataSpeedMaxFeetPerMinute,
  DataSpeedMaxFeetPerSecond,
  DataSpeedMaxKilometersPerHour, DataSpeedMaxKnots,
  DataSpeedMaxMetersPerMinute,
  DataSpeedMaxMilesPerHour,
} from './data.speed-max';
import {
  DataSpeedAvg,
  DataSpeedAvgFeetPerMinute,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgKilometersPerHour, DataSpeedAvgKnots,
  DataSpeedAvgMetersPerMinute,
  DataSpeedAvgMilesPerHour,
} from './data.speed-avg';
import { DataRecoveryTime } from './data.recovery-time';
import { DataPowerMin } from './data.power-min';
import { DataPowerMax } from './data.power-max';
import { DataPowerAvg } from './data.power-avg';
import { DataPeakTrainingEffect } from './data.peak-training-effect';
import { DataPause } from './data.pause';
import { DataHeartRateMin } from './data.heart-rate-min';
import { DataHeartRateMax } from './data.heart-rate-max';
import { DataHeartRateAvg } from './data.heart-rate-avg';
import { DataFeeling } from './data.feeling';
import { DataEPOC } from './data.epoc';
import { DataEnergy } from './data.energy';
import { DataDescentTime } from './data.descent-time';
import { DataDescent } from './data.descent';
import { DataCadenceMin } from './data.cadence-min';
import { DataCadenceMax } from './data.cadence-max';
import { DataCadenceAvg } from './data.cadence-avg';
import { DataAscentTime } from './data.ascent-time';
import { DataAscent } from './data.ascent';
import { DataAltitudeAvg } from './data.altitude-avg';
import { DataFusedLocation } from './data.fused-location';
import { DataPaceMin, DataPaceMinMinutesPerMile } from './data.pace-min';
import { DataPaceMax, DataPaceMaxMinutesPerMile } from './data.pace-max';
import { DataPaceAvg, DataPaceAvgMinutesPerMile } from './data.pace-avg';
import { DataPace, DataPaceMinutesPerMile } from './data.pace';
import { DataFusedAltitude } from './data.fused-altitude';
import { DataBatteryCharge } from './data.battery-charge';
import { DataBatteryCurrent } from './data.battery-current';
import { DataBatteryVoltage } from './data.battery-voltage';
import { DataBatteryConsumption } from './data.battery-consumption';
import { DataBatteryLifeEstimation } from './data.battery-life-estimation';
import { DataFormPower } from './data.form-power';
import { DataLegStiffness } from './data.leg-stiffness';
import { DataVerticalOscillation } from './data.vertical-oscillation';
import { DataTotalTrainingEffect } from './data.total-training-effect';
import { DataNumberOfSamples } from './data.number-of.samples';
import { DataFootPodUsed } from './data.foot-pod-used';
import { DataAutoPauseUsed } from './data.auto-pause-used';
import { DataAutoLapDuration } from './data.auto-lap-duration';
import { DataAutoLapDistance } from './data.auto-lap-distance';
import { DataAutoLapUsed } from './data.auto-lap-used';
import { DataBikePodUsed } from './data.bike-pod-used';
import { DataEnabledNavigationSystems } from './data.enabled-navigation-systems';
import { DataHeartRateUsed } from './data.heart-rate-used';
import { DataPowerPodUsed } from './data.power-pod-used';
import { DataAltiBaroProfile } from './data.alti-baro-profile';
import { DataIBI } from './data.ibi';
import { DataSteps } from './data.steps';
import { DataPoolLength } from './data.pool-length';
import { DataDeviceLocation } from './data.device-location';
import { DataPeakEPOC } from './data.peak-epoc';
import { DataDeviceNames } from './data.device-names';
import { DataActivityTypes } from './data.activity-types';
import { DataStartAltitude } from './data.start-altitude';
import { DataEndAltitude } from './data.end-altitude';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from './data.swim-pace';
import { DataSwimPaceAvg, DataSwimPaceAvgMinutesPer100Yard } from './data.swim-pace-avg';
import { DataSwimPaceMax, DataSwimPaceMaxMinutesPer100Yard } from './data.swim-pace-max';
import { DataSwimPaceMin, DataSwimPaceMinMinutesPer100Yard } from './data.swim-pace-min';
import { DataSWOLFAvg } from './data.swolf-avg';
import { DataAccumulatedPower } from './data.accumulated-power';
import { DataStrydDistance } from './data.stryd-distance';
import { DataStrydSpeed } from './data.stryd-speed';
import { DataStrydAltitude } from './data.stryd-altitude';
import { DataLeftBalance } from './data.left-balance';
import { DataRightBalance } from './data.right-balance';
import { DataRPE } from './data.rpe';
import { DataPowerRight } from './data.power-right';
import { DataPowerLeft } from './data.power-left';
import { DataStanceTime } from './data.stance-time';
import { DataStanceTimeBalance } from './data.stance-time-balance';
import { DataStepLength } from './data.step-length';
import { DataVerticalRatio } from './data.vertical-ratio';
import { DataDescription } from './data.description';
import { UserUnitSettingsInterface } from '../users/settings/user.unit.settings.interface';
import { DataAirPower } from './data.air-power';
import { DataGroundTime } from './data.ground-time';
import { DataAirPowerMax } from './data.air-power-max';
import { DataAirPowerMin } from './data.air-power-min';
import { DataAirPowerAvg } from './data.air-power-avg';
import { DataGNSSDistance } from './data.gnss-distance';
import { DataHeartRateZoneOneDuration } from './data.heart-rate-zone-one-duration';
import { DataHeartRateZoneTwoDuration } from './data.heart-rate-zone-two-duration';
import { DataHeartRateZoneThreeDuration } from './data.heart-rate-zone-three-duration';
import { DataHeartRateZoneFourDuration } from './data.heart-rate-zone-four-duration';
import { DataHeartRateZoneFiveDuration } from './data.heart-rate-zone-five-duration';
import { DataSpeedZoneOneDuration } from './data.speed-zone-one-duration';
import { DataSpeedZoneTwoDuration } from './data.speed-zone-two-duration';
import { DataSpeedZoneThreeDuration } from './data.speed-zone-three-duration';
import { DataSpeedZoneFourDuration } from './data.speed-zone-four-duration';
import { DataSpeedZoneFiveDuration } from './data.speed-zone-five-duration';
import { DataPowerZoneOneDuration } from './data.power-zone-one-duration';
import { DataPowerZoneTwoDuration } from './data.power-zone-two-duration';
import { DataPowerZoneThreeDuration } from './data.power-zone-three-duration';
import { DataPowerZoneFiveDuration } from './data.power-zone-five-duration';
import { DataPowerZoneFourDuration } from './data.power-zone-four-duration';
import { DataPosition } from './data.position';
import { DataStartPosition } from './data.start-position';
import { DataEndPosition } from './data.end-position';
import { DataGrade } from './data.grade';
import {
  DataGradeAdjustedSpeed,
  DataGradeAdjustedSpeedFeetPerMinute,
  DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour, DataGradeAdjustedSpeedKnots,
  DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';
import {
  DataGradeAdjustedSpeedMax,
  DataGradeAdjustedSpeedMaxFeetPerMinute,
  DataGradeAdjustedSpeedMaxFeetPerSecond,
  DataGradeAdjustedSpeedMaxKilometersPerHour, DataGradeAdjustedSpeedMaxKnots,
  DataGradeAdjustedSpeedMaxMetersPerMinute,
  DataGradeAdjustedSpeedMaxMilesPerHour
} from './data.grade-adjusted-speed-max';
import {
  DataGradeAdjustedSpeedMin,
  DataGradeAdjustedSpeedMinFeetPerMinute,
  DataGradeAdjustedSpeedMinFeetPerSecond,
  DataGradeAdjustedSpeedMinKilometersPerHour, DataGradeAdjustedSpeedMinKnots,
  DataGradeAdjustedSpeedMinMetersPerMinute,
  DataGradeAdjustedSpeedMinMilesPerHour
} from './data.grade-adjusted-speed-min';
import {
  DataGradeAdjustedSpeedAvg,
  DataGradeAdjustedSpeedAvgFeetPerMinute,
  DataGradeAdjustedSpeedAvgFeetPerSecond,
  DataGradeAdjustedSpeedAvgKilometersPerHour, DataGradeAdjustedSpeedAvgKnots,
  DataGradeAdjustedSpeedAvgMetersPerMinute,
  DataGradeAdjustedSpeedAvgMilesPerHour
} from './data.grade-adjusted-speed-avg';
import { DataGradeAdjustedPaceAvg, DataGradeAdjustedPaceAvgMinutesPerMile } from './data.grade-adjusted-pace-avg';
import { DataGradeAdjustedPaceMax, DataGradeAdjustedPaceMaxMinutesPerMile } from './data.grade-adjusted-pace-max';
import { DataGradeAdjustedPaceMin, DataGradeAdjustedPaceMinMinutesPerMile } from './data.grade-adjusted-pace-min';
import { DataStepsOld } from './data.steps-old';
import { DataStopEvent } from './data.stop-event';
import { DataStartEvent } from './data.start-event';
import { DataStopAllEvent } from './data.stop-all-event';
import { DataTime } from './data.time';
import {
  convertMetersToMiles,
  convertPaceToPaceInMinutesPerMile, convertSpeedToSpeedInKnots,
  convertSpeedToSpeedInFeetPerHour,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInMetersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour,
  convertSwimPaceToSwimPacePer100Yard
} from '../events/utilities/helpers';
import { Data } from './data';
import { DataMovingTime } from './data.moving-time';

/**
 * Only concrete classes no abstracts
 */
export const DataStore: any = {
  DataVerticalSpeed,
  DataTemperature,
  DataSpeed,
  DataGradeAdjustedSpeed,
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
  DataGradeAdjustedSpeedMin,
  DataGradeAdjustedSpeedMax,
  DataGradeAdjustedSpeedAvg,
  DataRecoveryTime,
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
  DataGradeAdjustedPace,
  DataGradeAdjustedPaceMin,
  DataGradeAdjustedPaceMax,
  DataGradeAdjustedPaceAvg,
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
  DataSpeedKnots,
  DataSpeedAvgKnots,
  DataSpeedMinKnots,
  DataSpeedMaxKnots,
  DataGradeAdjustedSpeedKilometersPerHour,
  DataGradeAdjustedSpeedMilesPerHour,
  DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedFeetPerMinute,
  DataGradeAdjustedSpeedAvgKilometersPerHour,
  DataGradeAdjustedSpeedAvgMilesPerHour,
  DataGradeAdjustedSpeedAvgFeetPerSecond,
  DataGradeAdjustedSpeedAvgMetersPerMinute,
  DataGradeAdjustedSpeedAvgFeetPerMinute,
  DataGradeAdjustedSpeedMinKilometersPerHour,
  DataGradeAdjustedSpeedMinMilesPerHour,
  DataGradeAdjustedSpeedMinFeetPerSecond,
  DataGradeAdjustedSpeedMinMetersPerMinute,
  DataGradeAdjustedSpeedMinFeetPerMinute,
  DataGradeAdjustedSpeedMaxKilometersPerHour,
  DataGradeAdjustedSpeedMaxMilesPerHour,
  DataGradeAdjustedSpeedMaxFeetPerSecond,
  DataGradeAdjustedSpeedMaxMetersPerMinute,
  DataGradeAdjustedSpeedMaxFeetPerMinute,
  DataGradeAdjustedSpeedKnots,
  DataGradeAdjustedSpeedAvgKnots,
  DataGradeAdjustedSpeedMinKnots,
  DataGradeAdjustedSpeedMaxKnots,
  DataPaceMinutesPerMile,
  DataPaceAvgMinutesPerMile,
  DataPaceMinMinutesPerMile,
  DataPaceMaxMinutesPerMile,
  DataGradeAdjustedPaceMinutesPerMile,
  DataGradeAdjustedPaceAvgMinutesPerMile,
  DataGradeAdjustedPaceMinMinutesPerMile,
  DataGradeAdjustedPaceMaxMinutesPerMile,
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
  DataStepsOld, // @todo find way to make this easy to migrate for projects that persist data based on types
  DataStrydAltitude,
  DataStrydSpeed,
  DataStrydDistance,
  DataPoolLength,
  DataDeviceLocation,
  DataPeakEPOC,
  DataActivityTypes,
  DataDeviceNames,
  DataStartAltitude,
  DataEndAltitude,
  DataSWOLFAvg,
  DataAccumulatedPower,
  DataLeftBalance,
  DataRightBalance,
  DataPowerLeft,
  DataPowerRight,
  DataRPE,
  DataStanceTime,
  DataStanceTimeBalance,
  DataStepLength,
  DataVerticalRatio,
  DataDescription,
  DataGroundTime,
  DataAirPower,
  DataAirPowerAvg,
  DataAirPowerMax,
  DataAirPowerMin,
  DataGNSSDistance,
  DataHeartRateZoneOneDuration,
  DataHeartRateZoneTwoDuration,
  DataHeartRateZoneThreeDuration,
  DataHeartRateZoneFourDuration,
  DataHeartRateZoneFiveDuration,
  DataPowerZoneOneDuration,
  DataPowerZoneTwoDuration,
  DataPowerZoneThreeDuration,
  DataPowerZoneFourDuration,
  DataPowerZoneFiveDuration,
  DataSpeedZoneOneDuration,
  DataSpeedZoneTwoDuration,
  DataSpeedZoneThreeDuration,
  DataSpeedZoneFourDuration,
  DataSpeedZoneFiveDuration,
  DataPosition,
  DataStartPosition,
  DataEndPosition,
  DataGrade,
  DataStartEvent,
  DataStopEvent,
  DataStopAllEvent,
  DataTime,
  DataDistanceMiles,
  DataMovingTime,
};

export class DynamicDataLoader {
  // @todo Convert to enums please and use them on Stream types

  static positionalDataTypes = [
    DataLatitudeDegrees.type,
    DataLongitudeDegrees.type,
  ]

  static baseDataTypes = [
    DataSpeed.type,
    DataDistance.type
  ]

  static basicDataTypes = [
    DataHeartRate.type,
    DataAltitude.type,
    DataCadence.type,
    DataPower.type,
    DataPace.type,
    DataGradeAdjustedSpeed.type,
    DataGradeAdjustedPace.type,
    DataSpeed.type,
  ];

  static advancedDataTypes = [
    DataGrade.type,
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
    DataStrydAltitude.type,
    DataAccumulatedPower.type,
    DataStrydAltitude.type,
    DataStrydDistance.type,
    DataStrydSpeed.type,
    DataLeftBalance.type,
    DataRightBalance.type,
    DataPowerLeft.type,
    DataPowerRight.type,
    DataStanceTime.type,
    DataStanceTimeBalance.type,
    DataStepLength.type,
    DataVerticalRatio.type,
    DataGroundTime.type,
    DataAirPower.type,
    DataGNSSDistance.type,
    DataGrade.type
  ];

  // @todo perhaps this can be simplified with using getValue if it becomes static of the data it self
  static dataTypeUnitGroups: DataTypeUnitGroups = {
    [DataSpeed.type]: {
      [DataSpeedKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataSpeedFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataSpeedMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataSpeedFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataSpeedKnots.type]: convertSpeedToSpeedInKnots,
    },
    [DataGradeAdjustedSpeed.type]: {
      [DataGradeAdjustedSpeedKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataGradeAdjustedSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataGradeAdjustedSpeedFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataGradeAdjustedSpeedMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataGradeAdjustedSpeedFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataGradeAdjustedSpeedKnots.type]: convertSpeedToSpeedInKnots,
    },
    [DataPace.type]: {
      [DataPaceMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataGradeAdjustedPace.type]: {
      [DataGradeAdjustedPaceMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataSwimPace.type]: {
      [DataSwimPaceMinutesPer100Yard.type]: convertSwimPaceToSwimPacePer100Yard
    },
    [DataVerticalSpeed.type]: {
      [DataVerticalSpeedFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataVerticalSpeedMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataVerticalSpeedFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataVerticalSpeedMetersPerHour.type]: convertSpeedToSpeedInMetersPerHour,
      [DataVerticalSpeedFeetPerHour.type]: convertSpeedToSpeedInFeetPerHour,
      [DataVerticalSpeedKilometerPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataVerticalSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
    },
    [DataDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles,
    }
  };

  // @todo perhaps GAS?
  static speedDerivedDataTypes = [
    DataPace.type,
    DataGradeAdjustedPace.type,
    DataSwimPace.type,
  ];

  static dataTypeMinDataType: {[type: string]: string} =  {
    [DataAltitude.type]: DataAltitudeMin.type,
    [DataHeartRate.type]: DataHeartRateMin.type,

    [DataSpeed.type]: DataSpeedMin.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedMinKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedMinMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedMinFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedMinMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedMinKnots.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedMin.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedMinKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedMinMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedMinFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedMinMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedMinKnots.type,

    [DataPace.type]: DataPaceMin.type,
    [DataPaceMinutesPerMile.type]: DataPaceMinMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceMin.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceMinMinutesPerMile.type,

    [DataPower.type]: DataPowerMin.type,
    [DataCadence.type]: DataCadenceMin.type,
    [DataTemperature.type]: DataTemperatureMin.type,
  }

  static dataTypeMaxDataType: {[type: string]: string} =  {
    [DataAltitude.type]: DataAltitudeMax.type,
    [DataHeartRate.type]: DataHeartRateMax.type,

    [DataSpeed.type]: DataSpeedMax.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedMaxKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedMaxMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedMaxFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedMaxMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedMaxKnots.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedMax.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedMaxKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedMaxMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedMaxFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedMaxMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedMaxKnots.type,

    [DataPace.type]: DataPaceMax.type,
    [DataPaceMinutesPerMile.type]: DataPaceMaxMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceMax.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceMaxMinutesPerMile.type,

    [DataPower.type]: DataPowerMax.type,
    [DataCadence.type]: DataCadenceMax.type,
    [DataTemperature.type]: DataTemperatureMax.type,
  }

  static dataTypeAvgDataType: {[type: string]: string} =  {
    [DataAltitude.type]: DataAltitudeAvg.type,
    [DataHeartRate.type]: DataHeartRateAvg.type,

    [DataSpeed.type]: DataSpeedAvg.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedAvgKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedAvgMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedAvgFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedAvgMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedAvgKnots.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedAvg.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedAvgKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedAvgMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedAvgFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedAvgMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedAvgKnots.type,

    [DataPace.type]: DataPaceAvg.type,
    [DataPaceMinutesPerMile.type]: DataPaceAvgMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceAvg.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceAvgMinutesPerMile.type,

    [DataPower.type]: DataPowerAvg.type,
    [DataCadence.type]: DataCadenceAvg.type,
    [DataTemperature.type]: DataTemperatureAvg.type,
  }

  static allUnitDerivedDataTypes = Object.keys(DynamicDataLoader.dataTypeUnitGroups).reduce((accu: string[], key) => accu.concat(Object.keys(DynamicDataLoader.dataTypeUnitGroups[key])), []);

  static getDataInstanceFromDataType(dataType: string, opts: any): DataInterface {
    const className = Object.keys(DataStore).find((dataClass) => {
      return DataStore[dataClass] && DataStore[dataClass].type && DataStore[dataClass].type === dataType;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of \'${dataType}\' is not in the store`);
    }
    return new DataStore[className](opts);
  }

  static getDataClassFromDataType(dataType: string): typeof Data {
    const className = Object.keys(DataStore).find((dataClass) => {
      return DataStore[dataClass] && DataStore[dataClass].type && DataStore[dataClass].type === dataType;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of \'${dataType}\' is not in the store`);
    }
    return DataStore[className];
  }

  static isUnitDerivedDataType(dataType: string): boolean {
    return this.allUnitDerivedDataTypes.indexOf(dataType) !== -1;
  }

  static isSpeedDerivedDataType(dataType: string): boolean {
    return this.speedDerivedDataTypes.indexOf(dataType) !== -1;
  }

  static isBlackListedStream(dataType: string): boolean {
    return [
      DataGNSSDistance.type,
      DataTime.type,
    ].indexOf(dataType) !== -1;
  }


  /**
   * This get's the basic data types for the charts depending or not on the user datatype settings
   * There are no unit specific datatypes here so if the user has selected pace it implies metric
   */
  public static getNonUnitBasedDataTypes(showAllData: boolean, dataTypesToUse: string[]): string[] {
    // let dataTypes = DynamicDataLoader.basicDataTypes;
    // Set the datatypes to show if all is selected
    if (showAllData) {
      return [...DynamicDataLoader.basicDataTypes, ...DynamicDataLoader.advancedDataTypes];
    }
    if (!dataTypesToUse) {
      return DynamicDataLoader.basicDataTypes;
    }
    return dataTypesToUse;
  }

  /**
   * This gets the base and extended unit datatypes from a datatype array depending on the user settings
   * @param dataTypes
   * @param userUnitSettings
   */
  static getUnitBasedDataTypesFromDataTypes(dataTypes: string[], userUnitSettings?: UserUnitSettingsInterface): string[] {
    let unitBasedDataTypes: any[] = [];
    if (!userUnitSettings) {
      return unitBasedDataTypes
    }
    if (dataTypes.indexOf(DataSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.speedUnits);
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.swimPaceUnits);
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.paceUnits);
    }
    if (dataTypes.indexOf(DataGradeAdjustedSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.gradeAdjustedSpeedUnits);
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.gradeAdjustedPaceUnits);
    }
    if (dataTypes.indexOf(DataVerticalSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.verticalSpeedUnits);
    }
    return unitBasedDataTypes;
  }

  /**
   * Gets the unitbased types
   * @param dataType
   * @param userUnitSettings
   */
  static getUnitBasedDataTypesFromDataType(dataType: string, userUnitSettings?: UserUnitSettingsInterface): string[] {
    if (!userUnitSettings) {
      return [dataType]
    }
    if (dataType === DataSpeed.type) {
      return userUnitSettings.speedUnits;
    }
    if (dataType === DataGradeAdjustedSpeed.type) {
      return userUnitSettings.gradeAdjustedSpeedUnits;
    }
    if (dataType === DataPace.type) {
      return userUnitSettings.paceUnits;
    }
    if (dataType === DataGradeAdjustedPace.type) {
      return userUnitSettings.gradeAdjustedPaceUnits;
    }
    if (dataType === DataSwimPace.type) {
      return userUnitSettings.swimPaceUnits;
    }
    if (dataType === DataVerticalSpeed.type) {
      return userUnitSettings.verticalSpeedUnits;
    }
    return [dataType];
  }

  /**
   * Gets back an array of the unit based data for the data that was asked
   * For example if the user has for speed selected m/s+km/h doing:
   * getUnitBasedDataFromData(speedData) will return an array of [DataSpeed, DataSpeedInKilometersPerHour] instances
   * @param data
   * @param userUnitSettings
   * @todo move to solo unit settings eg speed settings
   */
  static getUnitBasedDataFromDataInstance(data: DataInterface, userUnitSettings?: UserUnitSettingsInterface): DataInterface[] {
    if (!userUnitSettings) {
      return [data]
    }
    switch (data.getType()) {
      // Speed
      case DataSpeed.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataSpeedAvg.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvg.type, data.getValue(unit))];
            case DataSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgKilometersPerHour.type, data.getValue(unit))];
            case DataSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgMilesPerHour.type, data.getValue(unit))];
            case DataSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgFeetPerSecond.type, data.getValue(unit))];
            case DataSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgMetersPerMinute.type, data.getValue(unit))];
            case DataSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgFeetPerMinute.type, data.getValue(unit))];
            case DataSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvgKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);

      case DataSpeedMax.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMax.type, data.getValue(unit))];
            case DataSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxKilometersPerHour.type, data.getValue(unit))];
            case DataSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxMilesPerHour.type, data.getValue(unit))];
            case DataSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxFeetPerSecond.type, data.getValue(unit))];
            case DataSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxMetersPerMinute.type, data.getValue(unit))];
            case DataSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxFeetPerMinute.type, data.getValue(unit))];
            case DataSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMaxKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataSpeedMin.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMin.type, data.getValue(unit))];
            case DataSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinKilometersPerHour.type, data.getValue(unit))];
            case DataSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinMilesPerHour.type, data.getValue(unit))];
            case DataSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinFeetPerSecond.type, data.getValue(unit))];
            case DataSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinMetersPerMinute.type, data.getValue(unit))];
            case DataSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinFeetPerMinute.type, data.getValue(unit))];
            case DataSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedMinKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      // GradeAdjusted Speed
      case DataGradeAdjustedSpeed.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataGradeAdjustedSpeedAvg.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvg.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgKilometersPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgMilesPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgFeetPerSecond.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgMetersPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgFeetPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);

      case DataGradeAdjustedSpeedMax.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMax.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxKilometersPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxMilesPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxFeetPerSecond.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxMetersPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxFeetPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataGradeAdjustedSpeedMin.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMin.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinKilometersPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinMilesPerHour.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinFeetPerSecond.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinMetersPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinFeetPerMinute.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKnots.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinKnots.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      // Pace
      case DataPace.type:
        return userUnitSettings.paceUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataPaceAvg.type:
        return userUnitSettings.paceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceAvg.type, data.getValue(unit))];
            case DataPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceAvgMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataPaceMax.type:
        return userUnitSettings.paceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceMax.type, data.getValue(unit))];
            case DataPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceMaxMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataPaceMin.type:
        return userUnitSettings.paceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceMin.type, data.getValue(unit))];
            case DataPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataPaceMinMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);

      // GAP Pace
      case DataGradeAdjustedPace.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataGradeAdjustedPaceAvg.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceAvg.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceAvgMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataGradeAdjustedPaceMax.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMax.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMaxMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataGradeAdjustedPaceMin.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMin.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMinMinutesPerMile.type, data.getValue(unit))];
          }
          return accu;
        }, []);

      // Swim
      case DataSwimPace.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataSwimPaceAvg.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceAvg.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceAvgMinutesPer100Yard.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataSwimPaceMax.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMax.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMaxMinutesPer100Yard.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataSwimPaceMin.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMin.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMinMinutesPer100Yard.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      // Vertical speed
      case DataVerticalSpeed.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))]
        }, []);
      case DataVerticalSpeedAvg.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvg.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerMinute.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerSecond.type, data.getValue(unit))];
            case DataVerticalSpeedKilometerPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgKilometerPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgMilesPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgMetersPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvgMetersPerMinute.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataVerticalSpeedMax.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMax.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerMinute.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerSecond.type, data.getValue(unit))];
            case DataVerticalSpeedKilometerPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxKilometerPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxMilesPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxMetersPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMaxMetersPerMinute.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      case DataVerticalSpeedMin.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMin.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerMinute.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerSecond.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerSecond.type, data.getValue(unit))];
            case DataVerticalSpeedKilometerPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinKilometerPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMilesPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinMilesPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerHour.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinMetersPerHour.type, data.getValue(unit))];
            case DataVerticalSpeedMetersPerMinute.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMinMetersPerMinute.type, data.getValue(unit))];
          }
          return accu;
        }, []);
      default:
        return [data];
    }
  }
}


export interface DataTypeUnitGroups {
  [type: string]: {
    [type: string]: (value: number) => number
  }
}
