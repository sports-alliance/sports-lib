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
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';
import { DataSeaLevelPressure } from './data.sea-level-pressure';
import { DataSatellite5BestSNR } from './data.satellite-5-best-snr';
import { DataSatellite5BestSNRMin } from './data.satellite-5-best-snr-min';
import { DataSatellite5BestSNRMax } from './data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRAvg } from './data.satellite-5-best-snr-avg';
import { DataAbsolutePressure } from './data.absolute-pressure';
import { DataAbsolutePressureMin } from './data.absolute-pressure-min';
import { DataAbsolutePressureMax } from './data.absolute-pressure-max';
import { DataAbsolutePressureAvg } from './data.absolute-pressure-avg';
import { DataAltitude } from './data.altitude';
import { DataCadence } from './data.cadence';
import { DataStrokeRate } from './data.stroke-rate';
import { DataDistance, DataDistanceFeet, DataDistanceMiles } from './data.distance';
import { DataDuration } from './data.duration';
import { DataElapsedTime } from './data.elapsed-time';
import { DataEHPE } from './data.ehpe';
import { DataEVPE } from './data.evpe';
import { DataEVPEMin } from './data.evpe-min';
import { DataEVPEMax } from './data.evpe-max';
import { DataEVPEAvg } from './data.evpe-avg';
import { DataHeartRate } from './data.heart-rate';
import { DataLatitudeDegrees } from './data.latitude-degrees';
import { DataLongitudeDegrees } from './data.longitude-degrees';
import { DataNumberOfSatellites } from './data.number-of-satellites';
import { DataNumberOfSatellitesMin } from './data.number-of-satellites-min';
import { DataNumberOfSatellitesMax } from './data.number-of-satellites-max';
import { DataNumberOfSatellitesAvg } from './data.number-of-satellites-avg';
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
  DataSpeedMinKilometersPerHour,
  DataSpeedMinKnots,
  DataSpeedMinMetersPerMinute,
  DataSpeedMinMilesPerHour
} from './data.speed-min';
import {
  DataSpeedMax,
  DataSpeedMaxFeetPerMinute,
  DataSpeedMaxFeetPerSecond,
  DataSpeedMaxKilometersPerHour,
  DataSpeedMaxKnots,
  DataSpeedMaxMetersPerMinute,
  DataSpeedMaxMilesPerHour
} from './data.speed-max';
import {
  DataSpeedAvg,
  DataSpeedAvgFeetPerMinute,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgKilometersPerHour,
  DataSpeedAvgKnots,
  DataSpeedAvgMetersPerMinute,
  DataSpeedAvgMilesPerHour
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
import { DataStrokeRateMin } from './data.stroke-rate-min';
import { DataStrokeRateMax } from './data.stroke-rate-max';
import { DataStrokeRateAvg } from './data.stroke-rate-avg';
import { DataAscentTime } from './data.ascent-time';
import { DataAscent } from './data.ascent';
import { DataAltitudeAvg } from './data.altitude-avg';
import { DataFusedLocation } from './data.fused-location';
import { DataPaceMin, DataPaceMinMinutesPerMile } from './data.pace-min';
import { DataPaceMax, DataPaceMaxMinutesPerMile } from './data.pace-max';
import { DataPaceAvg, DataPaceAvgMinutesPerMile } from './data.pace-avg';
import { DataPace, DataPaceMinutesPerMile } from './data.pace';
import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';
import { DataEffortPaceAvg, DataEffortPaceAvgMinutesPerMile } from './data.effort-pace-avg';
import { DataEffortPaceMin, DataEffortPaceMinMinutesPerMile } from './data.effort-pace-min';
import { DataEffortPaceMax, DataEffortPaceMaxMinutesPerMile } from './data.effort-pace-max';
import { DataFusedAltitude } from './data.fused-altitude';
import { DataBatteryCharge } from './data.battery-charge';
import { DataBatteryCurrent } from './data.battery-current';
import { DataBatteryVoltage } from './data.battery-voltage';
import { DataBatteryConsumption } from './data.battery-consumption';
import { DataBatteryLifeEstimation } from './data.battery-life-estimation';
import { DataFormPower } from './data.form-power';
import { DataLegStiffness, DataLegSpringStiffness } from './data.leg-stiffness';
import { DataLegStiffnessMin } from './data.leg-stiffness-min';
import { DataLegStiffnessMax } from './data.leg-stiffness-max';
import { DataLegStiffnessAvg } from './data.leg-stiffness-avg';
import { DataVerticalOscillation } from './data.vertical-oscillation';
import { DataAerobicTrainingEffect } from './data-aerobic-training-effect';
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
import { DataIntensity } from './data.intensity';
import { DataSteps } from './data.steps';
import { DataPoolLength } from './data.pool-length';
import { DataSwimDistance } from './data.swim-distance';
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
import { DataSWOLF25m } from './data.swolf-25m';
import { DataAccumulatedPower } from './data.accumulated-power';
import { DataStrydDistance } from './data.stryd-distance';
import { DataStrydSpeed } from './data.stryd-speed';
import { DataStrydAltitude } from './data.stryd-altitude';
import {
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight
} from './data.running-dynamics-balance';
import { DataLeftBalance } from './data.left-balance';
import { DataPowerBalanceLeft } from './data.power-balance-left';
import { DataPowerBalanceRight } from './data.power-balance-right';
import { DataRightBalance } from './data.right-balance';
import { DataRPE } from './data.rpe';
import { DataPowerRight } from './data.power-right';
import { DataPowerLeft } from './data.power-left';
import { DataStanceTime } from './data.stance-time';
import { DataStanceTimeBalanceLeft } from './data-stance-time-balance-left';
import { DataGroundContactTimeBalanceLeft } from './data-ground-contact-time-balance-left';

import { DataStepLength } from './data.step-length';
import { DataVerticalRatio } from './data.vertical-ratio';
import { DataVerticalRatioMin } from './data.vertical-ratio-min';
import { DataVerticalRatioMax } from './data.vertical-ratio-max';
import { DataVerticalRatioAvg } from './data.vertical-ratio-avg';
import { DataDescription } from './data.description';
import {
  DistanceUnits,
  SwimPaceUnits,
  UserUnitSettingsInterface
} from '../users/settings/user.unit.settings.interface';
import { DataAirPower } from './data.air-power';
import { DataGroundTime } from './data.ground-time';
import { DataAirPowerMax } from './data.air-power-max';
import { DataAirPowerMin } from './data.air-power-min';
import { DataAirPowerAvg } from './data.air-power-avg';
import { DataGNSSDistance } from './data.gnss-distance';
import { DataGNSSDistanceMiles } from './data.gnss-distance-miles';
import { DataHeartRateZoneOneDuration } from './data.heart-rate-zone-one-duration';
import { DataHeartRateZoneTwoDuration } from './data.heart-rate-zone-two-duration';
import { DataHeartRateZoneThreeDuration } from './data.heart-rate-zone-three-duration';
import { DataHeartRateZoneFourDuration } from './data.heart-rate-zone-four-duration';
import { DataHeartRateZoneFiveDuration } from './data.heart-rate-zone-five-duration';
import { DataHeartRateZoneSixDuration } from './data.heart-rate-zone-six-duration';
import { DataHeartRateZoneSevenDuration } from './data.heart-rate-zone-seven-duration';
import { DataSpeedZoneOneDuration } from './data.speed-zone-one-duration';
import { DataSpeedZoneTwoDuration } from './data.speed-zone-two-duration';
import { DataSpeedZoneThreeDuration } from './data.speed-zone-three-duration';
import { DataSpeedZoneFourDuration } from './data.speed-zone-four-duration';
import { DataSpeedZoneFiveDuration } from './data.speed-zone-five-duration';
import { DataSpeedZoneSixDuration } from './data.speed-zone-six-duration';
import { DataSpeedZoneSevenDuration } from './data.speed-zone-seven-duration';
import { DataPowerZoneOneDuration } from './data.power-zone-one-duration';
import { DataPowerZoneTwoDuration } from './data.power-zone-two-duration';
import { DataPowerZoneThreeDuration } from './data.power-zone-three-duration';
import { DataPowerZoneFourDuration } from './data.power-zone-four-duration';
import { DataPowerZoneFiveDuration } from './data.power-zone-five-duration';
import { DataPowerZoneSixDuration } from './data.power-zone-six-duration';
import { DataPowerZoneSevenDuration } from './data.power-zone-seven-duration';
import { DataPosition } from './data.position';
import { DataStartPosition } from './data.start-position';
import { DataEndPosition } from './data.end-position';
import { DataGrade } from './data.grade';
import { DataGradeMin } from './data.grade-min';
import { DataGradeMax } from './data.grade-max';
import { DataGradeAvg } from './data.grade-avg';
import {
  DataGradeAdjustedSpeed,
  DataGradeAdjustedSpeedFeetPerMinute,
  DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour,
  DataGradeAdjustedSpeedKnots,
  DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';
import {
  DataGradeAdjustedSpeedMax,
  DataGradeAdjustedSpeedMaxFeetPerMinute,
  DataGradeAdjustedSpeedMaxFeetPerSecond,
  DataGradeAdjustedSpeedMaxKilometersPerHour,
  DataGradeAdjustedSpeedMaxKnots,
  DataGradeAdjustedSpeedMaxMetersPerMinute,
  DataGradeAdjustedSpeedMaxMilesPerHour
} from './data.grade-adjusted-speed-max';
import {
  DataGradeAdjustedSpeedMin,
  DataGradeAdjustedSpeedMinFeetPerMinute,
  DataGradeAdjustedSpeedMinFeetPerSecond,
  DataGradeAdjustedSpeedMinKilometersPerHour,
  DataGradeAdjustedSpeedMinKnots,
  DataGradeAdjustedSpeedMinMetersPerMinute,
  DataGradeAdjustedSpeedMinMilesPerHour
} from './data.grade-adjusted-speed-min';
import {
  DataGradeAdjustedSpeedAvg,
  DataGradeAdjustedSpeedAvgFeetPerMinute,
  DataGradeAdjustedSpeedAvgFeetPerSecond,
  DataGradeAdjustedSpeedAvgKilometersPerHour,
  DataGradeAdjustedSpeedAvgKnots,
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
  convertMetersToFeet,
  convertMetersToMiles,
  convertPaceToPaceInMinutesPerMile,
  convertSpeedToSpeedInFeetPerHour,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInKnots,
  convertSpeedToSpeedInMetersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour,
  convertSwimPaceToSwimPacePer100Yard
} from '../events/utilities/helpers';
import { Data } from './data';
import { DataMovingTime } from './data.moving-time';
import { DataSWOLF50m } from './data.swolf-50m';
import { DataTimerTime } from './data.timer-time';
import { DataActiveLap } from './data-active-lap';
import { DataActiveLengths } from './data-active-lengths';
import { DataAnaerobicTrainingEffect } from './data-anaerobic-training-effect';
import { DataTotalCycles } from './data-total-cycles';
import { DataPowerIntensityFactor } from './data.power-intensity-factor';
import { DataPowerNormalized } from './data.power-normalized';
import { DataPowerPedalSmoothnessLeft } from './data.power-pedal-smoothness-left';
import { DataPowerPedalSmoothnessRight } from './data.power-pedal-smoothness-right';
import { DataPowerTorqueEffectivenessLeft } from './data.power-torque-effectiveness-left';
import { DataPowerTorqueEffectivenessRight } from './data.power-torque-effectiveness-right';
import { DataPowerTrainingStressScore } from './data.power-training-stress-score';
import { DataTrainingStressScore } from './data.training-stress-score';
import { DataTrainingStressScoreMethod } from './data.training-stress-score-method';
import { DataPowerWork } from './data.power-work';
import { DataPowerDown } from './data.power-down';
import { DataPowerUp } from './data.power-up';
import { DataTargetPowerZone } from './data.target-power-zone';
import { DataTargetHeartRateZone } from './data.target-heart-rate-zone';
import { DataTargetSpeedZone } from './data.target-speed-zone';
import { DataTargetDistance } from './data.target-distance';
import { DataTargetTime } from './data.target-time';
import { DataStanceTimeBalanceRight } from './data-stance-time-balance-right';
import { DataGroundContactTimeBalanceRight } from './data-ground-contact-time-balance-right';
import { DataGroundContactTimeBalance } from './data-ground-contact-time-balance';
import { DataCriticalPower } from './data.critical-power';
import { DataFTP } from './data.ftp';
import { DataPowerCurve } from './data.power-curve';
import { DataDurabilityEvidence } from './data.durability-evidence';
import { DataThreeDimensionalStrainEvidence } from './data.three-dimensional-strain-evidence';
import { DataPowerWattsPerKg } from './data.power-watts-per-kg';
import { DataWPrime } from './data.w-prime';

import { DataRiderPositionChangeEvent } from './data.rider-position-change-event';
import { DataSportProfileName } from './data.sport-profile-name';
import { DataBalance } from './data.balance';
import { DataAltitudeSmooth } from './data.altitude-smooth';
import { DataAvgStrideLength } from './data.avg-stride-length';
import { DataAvgStrokeDistance } from './data.avg-stroke-distance';
import { DataAvgStrokeCount } from './data.avg-stroke-count';
import { DataCyclingSeatedTime } from './data.cycling-seated-time';
import { DataCyclingStandingTime } from './data.cycling-standing-time';
import { DataGradeSmooth } from './data.grade-smooth';
import { DataWeight } from './data.weight';
import { DataHeight } from './data.height';
import { DataAge } from './data.age';
import { DataGender } from './data.gender';
import { DataAvgFlow } from './data.avg-flow';
import { DataAvgGrit } from './data.avg-grit';
import { DataAvgRespirationRate } from './data.avg-respiration-rate';
import { DataAvgVAM } from './data.avg-vam';
import { DataEstSweatLoss } from './data.est-sweat-loss';
import { DataFlow } from './data.flow';
import { DataGrit } from './data.grit';
import { DataJumpCount } from './data.jump-count';
import { DataJumpEvent, DataJumpScore, DataScore, DataRotations } from './data.jump-event';
import { DataLeftPedalSmoothness } from './data.left-pedal-smoothness';
import { DataLeftTorqueEffectiveness } from './data.left-torque-effectiveness';
import { DataMaxRespirationRate } from './data.max-respiration-rate';
import { DataMinRespirationRate } from './data.min-respiration-rate';
import { DataPrimaryBenefit } from './data.primary-benefit';
import { DataMetabolicCalories } from './data.metabolic-calories';
import { DataRestingCalories } from './data.resting-calories';
import { DataRightPedalSmoothness } from './data.right-pedal-smoothness';
import { DataRightTorqueEffectiveness } from './data.right-torque-effectiveness';
import { DataTotalFlow } from './data.total-flow';
import { DataTotalGrit } from './data.total-grit';
import { DataTrainingLoadPeak } from './data.training-load-peak';
import { DataGroundContactTime } from './data.ground-contact-time';
import { DataGroundContactTimeAvg } from './data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from './data.ground-contact-time-max';
import { DataGroundContactTimeMin } from './data.ground-contact-time-min';
import { DataVerticalOscillationAvg } from './data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from './data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from './data.vertical-oscillation-min';
import { DataFitnessAge } from './data.fitness-age';
import { DataMaxHRSetting } from './data.max-hr-setting';

import { DataDepth, DataDepthFeet } from './data.depth';
import { DataDepthMax, DataDepthMaxFeet } from './data.depth-max';
import {
  DataAirTimeRemaining,
  DataBottomTime,
  DataCNSLoad,
  DataDepthAvg,
  DataDepthAvgFeet,
  DataDiveAscentRate,
  DataDiveAscentRateAvg,
  DataDiveAscentRateAvgFeetPerSecond,
  DataDiveAscentRateFeetPerSecond,
  DataDiveAscentRateMax,
  DataDiveAscentRateMaxFeetPerSecond,
  DataDiveAscentTime,
  DataDiveDescentRateAvg,
  DataDiveDescentRateAvgFeetPerSecond,
  DataDiveDescentRateMax,
  DataDiveDescentRateMaxFeetPerSecond,
  DataDiveDescentTime,
  DataDiveHangTime,
  DataDiveNumber,
  DataEndingCNSLoad,
  DataEndingN2Load,
  DataN2Load,
  DataNextStopDepth,
  DataNextStopDepthFeet,
  DataNextStopTime,
  DataNoDecompressionLimit,
  DataOxygenToxicity,
  DataPO2,
  DataPressureSAC,
  DataPressureSACAvg,
  DataRMV,
  DataRMVAvg,
  DataStartingCNSLoad,
  DataStartingN2Load,
  DataSurfaceInterval,
  DataTimeToSurface,
  DataVolumeSAC,
  DataVolumeSACAvg
} from './data.dive';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMax,
  DataJumpDistanceMin,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMax,
  DataJumpHangTimeMin,
  DataJumpHeightAvg,
  DataJumpHeightMax,
  DataJumpHeightMin,
  DataJumpRotationsAvg,
  DataJumpRotationsMax,
  DataJumpRotationsMin,
  DataJumpScoreAvg,
  DataJumpScoreMax,
  DataJumpScoreMin,
  DataJumpSpeedAvg,
  DataJumpSpeedAvgFeetPerMinute,
  DataJumpSpeedAvgFeetPerSecond,
  DataJumpSpeedAvgKilometersPerHour,
  DataJumpSpeedAvgKnots,
  DataJumpSpeedAvgMetersPerMinute,
  DataJumpSpeedAvgMilesPerHour,
  DataJumpSpeedMax,
  DataJumpSpeedMaxFeetPerMinute,
  DataJumpSpeedMaxFeetPerSecond,
  DataJumpSpeedMaxKilometersPerHour,
  DataJumpSpeedMaxKnots,
  DataJumpSpeedMaxMetersPerMinute,
  DataJumpSpeedMaxMilesPerHour,
  DataJumpSpeedMin,
  DataJumpSpeedMinFeetPerMinute,
  DataJumpSpeedMinFeetPerSecond,
  DataJumpSpeedMinKilometersPerHour,
  DataJumpSpeedMinKnots,
  DataJumpSpeedMinMetersPerMinute,
  DataJumpSpeedMinMilesPerHour
} from './data.jump-stats';
import { DataJumpDistance } from './data.jump-distance';
import { DataEHPEMin } from './data.ehpe-min';
import { DataEHPEMax } from './data.ehpe-max';
import { DataEHPEAvg } from './data.ehpe-avg';
import {
  DataBeginningPotentialStamina,
  DataEndingPotentialStamina,
  DataPotentialStamina,
  DataPotentialStaminaAvg,
  DataPotentialStaminaMax,
  DataPotentialStaminaMin,
  DataStamina,
  DataStaminaAvg,
  DataStaminaMax,
  DataStaminaMin
} from './data.stamina';

const getBaseTypeFromStatType = (type: string): string => type.replace(/^(Average|Minimum|Maximum)\s+/i, '');

const JUMP_SPEED_KILOMETERS_PER_HOUR_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgKilometersPerHour.type);
const JUMP_SPEED_MILES_PER_HOUR_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgMilesPerHour.type);
const JUMP_SPEED_FEET_PER_SECOND_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgFeetPerSecond.type);
const JUMP_SPEED_METERS_PER_MINUTE_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgMetersPerMinute.type);
const JUMP_SPEED_FEET_PER_MINUTE_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgFeetPerMinute.type);
const JUMP_SPEED_KNOTS_BASE_TYPE = getBaseTypeFromStatType(DataJumpSpeedAvgKnots.type);

const DIVE_IMPERIAL_DATA_TYPE_BY_CANONICAL_TYPE: Readonly<Record<string, string>> = {
  [DataDepth.type]: DataDepthFeet.type,
  [DataDepthMax.type]: DataDepthMaxFeet.type,
  [DataDepthAvg.type]: DataDepthAvgFeet.type,
  [DataNextStopDepth.type]: DataNextStopDepthFeet.type,
  [DataDiveAscentRate.type]: DataDiveAscentRateFeetPerSecond.type,
  [DataDiveAscentRateAvg.type]: DataDiveAscentRateAvgFeetPerSecond.type,
  [DataDiveAscentRateMax.type]: DataDiveAscentRateMaxFeetPerSecond.type,
  [DataDiveDescentRateAvg.type]: DataDiveDescentRateAvgFeetPerSecond.type,
  [DataDiveDescentRateMax.type]: DataDiveDescentRateMaxFeetPerSecond.type
};

// "Total Training effect" was renamed to "Aerobic Training Effect" in sports-lib 6.0
export class DataTotalTrainingEffectLegacy extends DataAerobicTrainingEffect {
  static override type = 'Total Training effect';
}

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
  DataSatellite5BestSNRMin,
  DataSatellite5BestSNRMax,
  DataSatellite5BestSNRAvg,
  DataPower,
  DataCriticalPower,
  DataFTP,
  DataPowerCurve,
  DataDurabilityEvidence,
  DataThreeDimensionalStrainEvidence,
  DataPowerWattsPerKg,
  DataWPrime,
  DataNumberOfSatellites,
  DataNumberOfSatellitesMin,
  DataNumberOfSatellitesMax,
  DataNumberOfSatellitesAvg,
  DataLongitudeDegrees,
  DataLatitudeDegrees,
  DataHeartRate,
  DataEVPE,
  DataEVPEMin,
  DataEVPEMax,
  DataEVPEAvg,
  DataEHPE,
  DataEHPEMin,
  DataEHPEMax,
  DataEHPEAvg,
  DataDuration,
  DataElapsedTime,
  DataDistance,
  DataCadence,
  DataStrokeRate,
  DataGPSAltitude,
  DataAltitude,
  DataAbsolutePressure,
  DataAbsolutePressureMin,
  DataAbsolutePressureMax,
  DataAbsolutePressureAvg,
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
  DataGrade,
  DataGradeMin,
  DataGradeMax,
  DataGradeAvg,
  DataStamina,
  DataStaminaMin,
  DataStaminaMax,
  DataStaminaAvg,
  DataPotentialStamina,
  DataPotentialStaminaMin,
  DataPotentialStaminaMax,
  DataPotentialStaminaAvg,
  DataBeginningPotentialStamina,
  DataEndingPotentialStamina,
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
  DataStrokeRateMin,
  DataStrokeRateMax,
  DataStrokeRateAvg,
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
  DataEffortPace,
  DataEffortPaceMin,
  DataEffortPaceMax,
  DataEffortPaceAvg,
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
  DataLegStiffnessMin,
  DataLegStiffnessMax,
  DataLegStiffnessAvg,
  DataLegSpringStiffness,
  DataVerticalOscillation,
  DataAerobicTrainingEffect,
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
  DataEffortPaceMinutesPerMile,
  DataEffortPaceAvgMinutesPerMile,
  DataEffortPaceMinMinutesPerMile,
  DataEffortPaceMaxMinutesPerMile,
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
  DataIntensity,
  DataSteps,
  DataStepsOld, // @todo find way to make this easy to migrate for projects that persist data based on types
  DataStrydAltitude,
  DataStrydSpeed,
  DataStrydDistance,
  DataPoolLength,
  DataSwimDistance,
  DataDeviceLocation,
  DataPeakEPOC,
  DataActivityTypes,
  DataDeviceNames,
  DataStartAltitude,
  DataEndAltitude,
  DataSWOLF25m,
  DataSWOLF50m,
  DataAccumulatedPower,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataPowerBalanceLeft,
  DataPowerBalanceRight,
  DataLeftBalance,
  DataRightBalance,
  DataPowerLeft,
  DataPowerRight,
  DataRPE,
  DataStanceTime,
  DataStanceTimeBalanceRight,
  DataStanceTimeBalanceLeft,
  DataStepLength,
  DataVerticalRatio,
  DataVerticalRatioMin,
  DataVerticalRatioMax,
  DataVerticalRatioAvg,
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
  DataHeartRateZoneSixDuration,
  DataHeartRateZoneSevenDuration,
  DataPowerZoneOneDuration,
  DataPowerZoneTwoDuration,
  DataPowerZoneThreeDuration,
  DataPowerZoneFourDuration,
  DataPowerZoneFiveDuration,
  DataPowerZoneSixDuration,
  DataPowerZoneSevenDuration,
  DataSpeedZoneOneDuration,
  DataSpeedZoneTwoDuration,
  DataSpeedZoneThreeDuration,
  DataSpeedZoneFourDuration,
  DataSpeedZoneFiveDuration,
  DataSpeedZoneSixDuration,
  DataSpeedZoneSevenDuration,
  DataPosition,
  DataStartPosition,
  DataEndPosition,
  DataStartEvent,
  DataStopEvent,
  DataStopAllEvent,
  DataTime,
  DataDistanceFeet,
  DataDistanceMiles,
  DataGNSSDistanceMiles,
  DataMovingTime,
  DataTimerTime,
  DataActiveLap,
  DataActiveLengths,
  DataAnaerobicTrainingEffect,
  DataTotalCycles,
  DataPowerIntensityFactor,
  DataPowerNormalized,
  DataPowerPedalSmoothnessLeft,
  DataPowerPedalSmoothnessRight,
  DataPowerTorqueEffectivenessLeft,
  DataPowerTorqueEffectivenessRight,
  DataTrainingStressScore,
  DataPowerTrainingStressScore,
  DataTrainingStressScoreMethod,
  DataPowerWork,
  DataRiderPositionChangeEvent,
  DataSportProfileName,
  DataBalance,
  DataAltitudeSmooth,
  DataAvgStrideLength,
  DataAvgStrokeDistance,
  DataAvgStrokeCount,
  DataCyclingSeatedTime,
  DataCyclingStandingTime,
  DataGradeSmooth,
  DataPowerDown,
  DataPowerUp,
  DataTargetPowerZone,
  DataTargetHeartRateZone,
  DataTargetSpeedZone,
  DataTargetDistance,
  DataTargetTime,
  DataTotalTrainingEffectLegacy,
  DataWeight,
  DataHeight,
  DataAge,
  DataGender,
  DataAvgFlow,
  DataAvgGrit,
  DataAvgRespirationRate,
  DataAvgVAM,
  DataEstSweatLoss,
  DataFlow,
  DataGrit,
  DataJumpCount,
  DataJumpEvent,
  DataJumpScore,
  DataScore,
  DataRotations,
  DataLeftPedalSmoothness,
  DataLeftTorqueEffectiveness,
  DataMaxRespirationRate,
  DataMinRespirationRate,
  DataPrimaryBenefit,
  DataMetabolicCalories,
  DataRestingCalories,
  DataRightPedalSmoothness,
  DataRightTorqueEffectiveness,
  DataTotalFlow,
  DataTotalGrit,
  DataTrainingLoadPeak,
  DataGroundContactTime,
  DataGroundContactTimeAvg,
  DataGroundContactTimeMax,
  DataGroundContactTimeMin,
  DataGroundContactTimeBalance,
  DataGroundContactTimeBalanceLeft,
  DataGroundContactTimeBalanceRight,
  DataVerticalOscillationAvg,
  DataVerticalOscillationMax,
  DataVerticalOscillationMin,
  DataFitnessAge,
  DataMaxHRSetting,
  DataDepth,
  DataDepthFeet,
  DataDepthMax,
  DataDepthMaxFeet,
  DataDepthAvg,
  DataDepthAvgFeet,
  DataSurfaceInterval,
  DataBottomTime,
  DataDiveNumber,
  DataDiveDescentTime,
  DataDiveAscentTime,
  DataDiveAscentRate,
  DataDiveAscentRateFeetPerSecond,
  DataDiveAscentRateAvg,
  DataDiveAscentRateAvgFeetPerSecond,
  DataDiveAscentRateMax,
  DataDiveAscentRateMaxFeetPerSecond,
  DataDiveDescentRateAvg,
  DataDiveDescentRateAvgFeetPerSecond,
  DataDiveDescentRateMax,
  DataDiveDescentRateMaxFeetPerSecond,
  DataDiveHangTime,
  DataStartingCNSLoad,
  DataEndingCNSLoad,
  DataStartingN2Load,
  DataEndingN2Load,
  DataOxygenToxicity,
  DataPressureSAC,
  DataPressureSACAvg,
  DataVolumeSAC,
  DataVolumeSACAvg,
  DataRMV,
  DataRMVAvg,
  DataNextStopDepth,
  DataNextStopDepthFeet,
  DataNextStopTime,
  DataTimeToSurface,
  DataNoDecompressionLimit,
  DataCNSLoad,
  DataN2Load,
  DataAirTimeRemaining,
  DataPO2,
  DataJumpHangTimeMin,
  DataJumpHangTimeMax,
  DataJumpHangTimeAvg,
  DataJumpDistanceMin,
  DataJumpDistanceMax,
  DataJumpDistanceAvg,
  DataJumpSpeedMin,
  DataJumpSpeedMax,
  DataJumpSpeedAvg,
  DataJumpSpeedMinKilometersPerHour,
  DataJumpSpeedMinMilesPerHour,
  DataJumpSpeedMinFeetPerSecond,
  DataJumpSpeedMinMetersPerMinute,
  DataJumpSpeedMinFeetPerMinute,
  DataJumpSpeedMinKnots,
  DataJumpSpeedMaxKilometersPerHour,
  DataJumpSpeedMaxMilesPerHour,
  DataJumpSpeedMaxFeetPerSecond,
  DataJumpSpeedMaxMetersPerMinute,
  DataJumpSpeedMaxFeetPerMinute,
  DataJumpSpeedMaxKnots,
  DataJumpSpeedAvgKilometersPerHour,
  DataJumpSpeedAvgMilesPerHour,
  DataJumpSpeedAvgFeetPerSecond,
  DataJumpSpeedAvgMetersPerMinute,
  DataJumpSpeedAvgFeetPerMinute,
  DataJumpSpeedAvgKnots,
  DataJumpRotationsMin,
  DataJumpRotationsMax,
  DataJumpRotationsAvg,
  DataJumpScoreMin,
  DataJumpScoreMax,
  DataJumpScoreAvg,
  DataJumpHeightMin,
  DataJumpHeightMax,
  DataJumpHeightAvg,
  DataJumpDistance
};

export class DynamicDataLoader {
  // @todo Convert to enums please and use them on Stream types

  private static readonly dataTypeFamilyTriplets: Record<string, { min: string; max: string; avg: string }> = {
    'Respiration Rate': {
      min: DataMinRespirationRate.type,
      max: DataMaxRespirationRate.type,
      avg: DataAvgRespirationRate.type
    },
    [DataEffortPace.type]: {
      min: DataEffortPaceMin.type,
      max: DataEffortPaceMax.type,
      avg: DataEffortPaceAvg.type
    },
    [DataStrokeRate.type]: {
      min: DataStrokeRateMin.type,
      max: DataStrokeRateMax.type,
      avg: DataStrokeRateAvg.type
    },
    [DataJumpDistance.type]: {
      min: DataJumpDistanceMin.type,
      max: DataJumpDistanceMax.type,
      avg: DataJumpDistanceAvg.type
    },
    [DataStamina.type]: {
      min: DataStaminaMin.type,
      max: DataStaminaMax.type,
      avg: DataStaminaAvg.type
    },
    [DataPotentialStamina.type]: {
      min: DataPotentialStaminaMin.type,
      max: DataPotentialStaminaMax.type,
      avg: DataPotentialStaminaAvg.type
    },
    'Jump Hang Time': {
      min: DataJumpHangTimeMin.type,
      max: DataJumpHangTimeMax.type,
      avg: DataJumpHangTimeAvg.type
    },
    'Jump Height': {
      min: DataJumpHeightMin.type,
      max: DataJumpHeightMax.type,
      avg: DataJumpHeightAvg.type
    },
    'Jump Speed': {
      min: DataJumpSpeedMin.type,
      max: DataJumpSpeedMax.type,
      avg: DataJumpSpeedAvg.type
    },
    'Jump Rotations': {
      min: DataJumpRotationsMin.type,
      max: DataJumpRotationsMax.type,
      avg: DataJumpRotationsAvg.type
    },
    'Jump Score': {
      min: DataJumpScoreMin.type,
      max: DataJumpScoreMax.type,
      avg: DataJumpScoreAvg.type
    }
  };

  private static readonly jumpSpeedUnitVariantTypes: Record<string, Record<string, string>> = {
    [DataJumpSpeedAvg.type]: {
      [DataSpeed.type]: DataJumpSpeedAvg.type,
      [DataSpeedKilometersPerHour.type]: DataJumpSpeedAvgKilometersPerHour.type,
      [DataSpeedMilesPerHour.type]: DataJumpSpeedAvgMilesPerHour.type,
      [DataSpeedFeetPerSecond.type]: DataJumpSpeedAvgFeetPerSecond.type,
      [DataSpeedMetersPerMinute.type]: DataJumpSpeedAvgMetersPerMinute.type,
      [DataSpeedFeetPerMinute.type]: DataJumpSpeedAvgFeetPerMinute.type,
      [DataSpeedKnots.type]: DataJumpSpeedAvgKnots.type
    },
    [DataJumpSpeedMin.type]: {
      [DataSpeed.type]: DataJumpSpeedMin.type,
      [DataSpeedKilometersPerHour.type]: DataJumpSpeedMinKilometersPerHour.type,
      [DataSpeedMilesPerHour.type]: DataJumpSpeedMinMilesPerHour.type,
      [DataSpeedFeetPerSecond.type]: DataJumpSpeedMinFeetPerSecond.type,
      [DataSpeedMetersPerMinute.type]: DataJumpSpeedMinMetersPerMinute.type,
      [DataSpeedFeetPerMinute.type]: DataJumpSpeedMinFeetPerMinute.type,
      [DataSpeedKnots.type]: DataJumpSpeedMinKnots.type
    },
    [DataJumpSpeedMax.type]: {
      [DataSpeed.type]: DataJumpSpeedMax.type,
      [DataSpeedKilometersPerHour.type]: DataJumpSpeedMaxKilometersPerHour.type,
      [DataSpeedMilesPerHour.type]: DataJumpSpeedMaxMilesPerHour.type,
      [DataSpeedFeetPerSecond.type]: DataJumpSpeedMaxFeetPerSecond.type,
      [DataSpeedMetersPerMinute.type]: DataJumpSpeedMaxMetersPerMinute.type,
      [DataSpeedFeetPerMinute.type]: DataJumpSpeedMaxFeetPerMinute.type,
      [DataSpeedKnots.type]: DataJumpSpeedMaxKnots.type
    }
  };

  private static readonly effortPaceUnitVariantTypes: Record<string, Record<string, string>> = {
    [DataEffortPace.type]: {
      [DataPace.type]: DataEffortPace.type,
      [DataPaceMinutesPerMile.type]: DataEffortPaceMinutesPerMile.type
    },
    [DataEffortPaceAvg.type]: {
      [DataPace.type]: DataEffortPaceAvg.type,
      [DataPaceMinutesPerMile.type]: DataEffortPaceAvgMinutesPerMile.type
    },
    [DataEffortPaceMin.type]: {
      [DataPace.type]: DataEffortPaceMin.type,
      [DataPaceMinutesPerMile.type]: DataEffortPaceMinMinutesPerMile.type
    },
    [DataEffortPaceMax.type]: {
      [DataPace.type]: DataEffortPaceMax.type,
      [DataPaceMinutesPerMile.type]: DataEffortPaceMaxMinutesPerMile.type
    }
  };

  static positionalDataTypes = [DataLatitudeDegrees.type, DataLongitudeDegrees.type];

  static baseDataTypes = [DataSpeed.type, DataDistance.type];

  static basicDataTypes = [
    DataHeartRate.type,
    DataAltitude.type,
    DataCadence.type,
    DataStrokeRate.type,
    DataPower.type,
    DataPace.type,
    DataGradeAdjustedSpeed.type,
    DataGradeAdjustedPace.type,
    DataSpeed.type,
    DataWeight.type,
    DataHeight.type,
    DataAge.type,
    DataGender.type
  ];

  static advancedDataTypes = [
    DataDepth.type,
    DataNextStopDepth.type,
    DataNextStopTime.type,
    DataTimeToSurface.type,
    DataNoDecompressionLimit.type,
    DataCNSLoad.type,
    DataN2Load.type,
    DataAirTimeRemaining.type,
    DataPressureSAC.type,
    DataVolumeSAC.type,
    DataRMV.type,
    DataPO2.type,
    DataDiveAscentRate.type,
    DataGrade.type,
    DataVerticalSpeed.type,
    DataTemperature.type,
    DataSeaLevelPressure.type,
    DataSatellite5BestSNR.type,
    DataNumberOfSatellites.type,
    DataEVPE.type,
    DataEHPE.type,
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
    DataAerobicTrainingEffect.type,
    DataIBI.type,
    DataStrydAltitude.type,
    DataAccumulatedPower.type,
    DataStrydAltitude.type,
    DataStrydDistance.type,
    DataStrydSpeed.type,
    DataVerticalOscillationBalanceLeft.type,
    DataVerticalOscillationBalanceRight.type,
    DataLegSpringStiffnessBalanceLeft.type,
    DataLegSpringStiffnessBalanceRight.type,
    DataImpactLoadingRateBalanceLeft.type,
    DataImpactLoadingRateBalanceRight.type,
    DataPowerBalanceLeft.type,
    DataPowerBalanceRight.type,
    DataPowerLeft.type,
    DataPowerRight.type,
    DataStanceTime.type,
    DataStanceTimeBalanceLeft.type,
    DataStepLength.type,
    DataEffortPace.type,
    DataVerticalRatio.type,
    DataGroundTime.type,
    DataAirPower.type,
    DataGNSSDistance.type,
    DataDistance.type
  ];

  // @todo perhaps this can be simplified with using getValue if it becomes static of the data it self
  static dataTypeUnitGroups: DataTypeUnitGroups = {
    [DataDepth.type]: {
      [DataDepthFeet.type]: convertMetersToFeet
    },
    [DataDepthMax.type]: {
      [DataDepthMaxFeet.type]: convertMetersToFeet
    },
    [DataDepthAvg.type]: {
      [DataDepthAvgFeet.type]: convertMetersToFeet
    },
    [DataNextStopDepth.type]: {
      [DataNextStopDepthFeet.type]: convertMetersToFeet
    },
    [DataDiveAscentRate.type]: {
      [DataDiveAscentRateFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond
    },
    [DataDiveAscentRateAvg.type]: {
      [DataDiveAscentRateAvgFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond
    },
    [DataDiveAscentRateMax.type]: {
      [DataDiveAscentRateMaxFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond
    },
    [DataDiveDescentRateAvg.type]: {
      [DataDiveDescentRateAvgFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond
    },
    [DataDiveDescentRateMax.type]: {
      [DataDiveDescentRateMaxFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond
    },
    [DataSpeed.type]: {
      [DataSpeedKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataSpeedFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataSpeedMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataSpeedFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataSpeedKnots.type]: convertSpeedToSpeedInKnots
    },
    [DataGradeAdjustedSpeed.type]: {
      [DataGradeAdjustedSpeedKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataGradeAdjustedSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataGradeAdjustedSpeedFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataGradeAdjustedSpeedMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataGradeAdjustedSpeedFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataGradeAdjustedSpeedKnots.type]: convertSpeedToSpeedInKnots
    },
    [DataPace.type]: {
      [DataPaceMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataEffortPace.type]: {
      [DataEffortPaceMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataEffortPaceAvg.type]: {
      [DataEffortPaceAvgMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataEffortPaceMin.type]: {
      [DataEffortPaceMinMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
    },
    [DataEffortPaceMax.type]: {
      [DataEffortPaceMaxMinutesPerMile.type]: convertPaceToPaceInMinutesPerMile
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
      [DataVerticalSpeedMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour
    },
    [DataJumpSpeedMin.type]: {
      [DataJumpSpeedMinKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataJumpSpeedMinMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataJumpSpeedMinFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataJumpSpeedMinMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataJumpSpeedMinFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataJumpSpeedMinKnots.type]: convertSpeedToSpeedInKnots
    },
    [DataJumpSpeedMax.type]: {
      [DataJumpSpeedMaxKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataJumpSpeedMaxMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataJumpSpeedMaxFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataJumpSpeedMaxMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataJumpSpeedMaxFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataJumpSpeedMaxKnots.type]: convertSpeedToSpeedInKnots
    },
    [DataJumpSpeedAvg.type]: {
      [DataJumpSpeedAvgKilometersPerHour.type]: convertSpeedToSpeedInKilometersPerHour,
      [DataJumpSpeedAvgMilesPerHour.type]: convertSpeedToSpeedInMilesPerHour,
      [DataJumpSpeedAvgFeetPerSecond.type]: convertSpeedToSpeedInFeetPerSecond,
      [DataJumpSpeedAvgMetersPerMinute.type]: convertSpeedToSpeedInMetersPerMinute,
      [DataJumpSpeedAvgFeetPerMinute.type]: convertSpeedToSpeedInFeetPerMinute,
      [DataJumpSpeedAvgKnots.type]: convertSpeedToSpeedInKnots
    },
    [DataJumpDistance.type]: {
      [DataDistanceFeet.type]: convertMetersToFeet
    },
    [DataJumpDistanceMin.type]: {
      [DataDistanceFeet.type]: convertMetersToFeet
    },
    [DataJumpDistanceMax.type]: {
      [DataDistanceFeet.type]: convertMetersToFeet
    },
    [DataJumpDistanceAvg.type]: {
      [DataDistanceFeet.type]: convertMetersToFeet
    },
    [DataDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataGNSSDistance.type]: {
      [DataGNSSDistanceMiles.type]: convertMetersToMiles
    },
    [DataAutoLapDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataAvgStrokeDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataAvgStrideLength.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataStepLength.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataTargetDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    },
    [DataStrydDistance.type]: {
      [DataDistanceMiles.type]: convertMetersToMiles
    }
  };

  // @todo perhaps GAS?
  static speedDerivedDataTypes = [DataPace.type, DataGradeAdjustedPace.type, DataSwimPace.type];

  static dataTypeMinDataType: { [type: string]: string } = {
    [DataAltitude.type]: DataAltitudeMin.type,
    [DataHeartRate.type]: DataHeartRateMin.type,

    [DataSpeed.type]: DataSpeedMin.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedMinKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedMinMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedMinFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedMinMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedMinKnots.type,

    [DataVerticalSpeed.type]: DataVerticalSpeedMin.type,
    [DataVerticalSpeedKilometerPerHour.type]: DataVerticalSpeedMinKilometerPerHour.type,
    [DataVerticalSpeedMilesPerHour.type]: DataVerticalSpeedMinMilesPerHour.type,
    [DataVerticalSpeedFeetPerSecond.type]: DataVerticalSpeedMinFeetPerSecond.type,
    [DataVerticalSpeedMetersPerMinute.type]: DataVerticalSpeedMinMetersPerMinute.type,
    [DataVerticalSpeedFeetPerMinute.type]: DataVerticalSpeedMinFeetPerMinute.type,
    [DataVerticalSpeedFeetPerHour.type]: DataVerticalSpeedMinFeetPerHour.type,
    [DataVerticalSpeedMetersPerHour.type]: DataVerticalSpeedMinMetersPerHour.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedMin.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedMinKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedMinMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedMinFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedMinMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedMinKnots.type,

    [DataPace.type]: DataPaceMin.type,
    [DataPaceMinutesPerMile.type]: DataPaceMinMinutesPerMile.type,
    [DataEffortPace.type]: DataEffortPaceMin.type,
    [DataEffortPaceMinutesPerMile.type]: DataEffortPaceMinMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceMin.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceMinMinutesPerMile.type,

    [DataPower.type]: DataPowerMin.type,
    [DataCadence.type]: DataCadenceMin.type,
    [DataTemperature.type]: DataTemperatureMin.type,
    [DataAbsolutePressure.type]: DataAbsolutePressureMin.type,
    [DataGroundContactTime.type]: DataGroundContactTimeMin.type,
    [DataGrade.type]: DataGradeMin.type,
    [DataLegStiffness.type]: DataLegStiffnessMin.type,
    [DataVerticalOscillation.type]: DataVerticalOscillationMin.type,
    [DataVerticalRatio.type]: DataVerticalRatioMin.type,
    [DataJumpDistance.type]: DataJumpDistanceMin.type,
    [JUMP_SPEED_KILOMETERS_PER_HOUR_BASE_TYPE]: DataJumpSpeedMinKilometersPerHour.type,
    [JUMP_SPEED_MILES_PER_HOUR_BASE_TYPE]: DataJumpSpeedMinMilesPerHour.type,
    [JUMP_SPEED_FEET_PER_SECOND_BASE_TYPE]: DataJumpSpeedMinFeetPerSecond.type,
    [JUMP_SPEED_METERS_PER_MINUTE_BASE_TYPE]: DataJumpSpeedMinMetersPerMinute.type,
    [JUMP_SPEED_FEET_PER_MINUTE_BASE_TYPE]: DataJumpSpeedMinFeetPerMinute.type,
    [JUMP_SPEED_KNOTS_BASE_TYPE]: DataJumpSpeedMinKnots.type,
    [DataSatellite5BestSNR.type]: DataSatellite5BestSNRMin.type,
    [DataNumberOfSatellites.type]: DataNumberOfSatellitesMin.type,
    [DataEVPE.type]: DataEVPEMin.type,
    [DataEHPE.type]: DataEHPEMin.type,
    ...Object.keys(DynamicDataLoader.dataTypeFamilyTriplets).reduce(
      (accu: Record<string, string>, dataType: string) => {
        accu[dataType] = DynamicDataLoader.dataTypeFamilyTriplets[dataType].min;
        return accu;
      },
      {}
    )
  };

  static dataTypeMaxDataType: { [type: string]: string } = {
    [DataAltitude.type]: DataAltitudeMax.type,
    [DataHeartRate.type]: DataHeartRateMax.type,

    [DataSpeed.type]: DataSpeedMax.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedMaxKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedMaxMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedMaxFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedMaxMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedMaxKnots.type,

    [DataVerticalSpeed.type]: DataVerticalSpeedMax.type,
    [DataVerticalSpeedKilometerPerHour.type]: DataVerticalSpeedMaxKilometerPerHour.type,
    [DataVerticalSpeedMilesPerHour.type]: DataVerticalSpeedMaxMilesPerHour.type,
    [DataVerticalSpeedFeetPerSecond.type]: DataVerticalSpeedMaxFeetPerSecond.type,
    [DataVerticalSpeedMetersPerMinute.type]: DataVerticalSpeedMaxMetersPerMinute.type,
    [DataVerticalSpeedFeetPerMinute.type]: DataVerticalSpeedMaxFeetPerMinute.type,
    [DataVerticalSpeedFeetPerHour.type]: DataVerticalSpeedMaxFeetPerHour.type,
    [DataVerticalSpeedMetersPerHour.type]: DataVerticalSpeedMaxMetersPerHour.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedMax.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedMaxKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedMaxMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedMaxFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedMaxMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedMaxKnots.type,

    [DataPace.type]: DataPaceMax.type,
    [DataPaceMinutesPerMile.type]: DataPaceMaxMinutesPerMile.type,
    [DataEffortPace.type]: DataEffortPaceMax.type,
    [DataEffortPaceMinutesPerMile.type]: DataEffortPaceMaxMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceMax.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceMaxMinutesPerMile.type,

    [DataPower.type]: DataPowerMax.type,
    [DataCadence.type]: DataCadenceMax.type,
    [DataTemperature.type]: DataTemperatureMax.type,
    [DataAbsolutePressure.type]: DataAbsolutePressureMax.type,
    [DataGroundContactTime.type]: DataGroundContactTimeMax.type,
    [DataGrade.type]: DataGradeMax.type,
    [DataLegStiffness.type]: DataLegStiffnessMax.type,
    [DataVerticalOscillation.type]: DataVerticalOscillationMax.type,
    [DataVerticalRatio.type]: DataVerticalRatioMax.type,
    [DataJumpDistance.type]: DataJumpDistanceMax.type,
    [JUMP_SPEED_KILOMETERS_PER_HOUR_BASE_TYPE]: DataJumpSpeedMaxKilometersPerHour.type,
    [JUMP_SPEED_MILES_PER_HOUR_BASE_TYPE]: DataJumpSpeedMaxMilesPerHour.type,
    [JUMP_SPEED_FEET_PER_SECOND_BASE_TYPE]: DataJumpSpeedMaxFeetPerSecond.type,
    [JUMP_SPEED_METERS_PER_MINUTE_BASE_TYPE]: DataJumpSpeedMaxMetersPerMinute.type,
    [JUMP_SPEED_FEET_PER_MINUTE_BASE_TYPE]: DataJumpSpeedMaxFeetPerMinute.type,
    [JUMP_SPEED_KNOTS_BASE_TYPE]: DataJumpSpeedMaxKnots.type,
    [DataSatellite5BestSNR.type]: DataSatellite5BestSNRMax.type,
    [DataNumberOfSatellites.type]: DataNumberOfSatellitesMax.type,
    [DataEVPE.type]: DataEVPEMax.type,
    [DataEHPE.type]: DataEHPEMax.type,
    ...Object.keys(DynamicDataLoader.dataTypeFamilyTriplets).reduce(
      (accu: Record<string, string>, dataType: string) => {
        accu[dataType] = DynamicDataLoader.dataTypeFamilyTriplets[dataType].max;
        return accu;
      },
      {}
    )
  };

  static dataTypeAvgDataType: { [type: string]: string } = {
    [DataAltitude.type]: DataAltitudeAvg.type,
    [DataHeartRate.type]: DataHeartRateAvg.type,

    [DataSpeed.type]: DataSpeedAvg.type,
    [DataSpeedKilometersPerHour.type]: DataSpeedAvgKilometersPerHour.type,
    [DataSpeedMilesPerHour.type]: DataSpeedAvgMilesPerHour.type,
    [DataSpeedFeetPerSecond.type]: DataSpeedAvgFeetPerSecond.type,
    [DataSpeedMetersPerMinute.type]: DataSpeedAvgMetersPerMinute.type,
    [DataSpeedKnots.type]: DataSpeedAvgKnots.type,

    [DataVerticalSpeed.type]: DataVerticalSpeedAvg.type,
    [DataVerticalSpeedKilometerPerHour.type]: DataVerticalSpeedAvgKilometerPerHour.type,
    [DataVerticalSpeedMilesPerHour.type]: DataVerticalSpeedAvgMilesPerHour.type,
    [DataVerticalSpeedFeetPerSecond.type]: DataVerticalSpeedAvgFeetPerSecond.type,
    [DataVerticalSpeedMetersPerMinute.type]: DataVerticalSpeedAvgMetersPerMinute.type,
    [DataVerticalSpeedFeetPerMinute.type]: DataVerticalSpeedAvgFeetPerMinute.type,
    [DataVerticalSpeedFeetPerHour.type]: DataVerticalSpeedAvgFeetPerHour.type,
    [DataVerticalSpeedMetersPerHour.type]: DataVerticalSpeedAvgMetersPerHour.type,

    [DataGradeAdjustedSpeed.type]: DataGradeAdjustedSpeedAvg.type,
    [DataGradeAdjustedSpeedKilometersPerHour.type]: DataGradeAdjustedSpeedAvgKilometersPerHour.type,
    [DataGradeAdjustedSpeedMilesPerHour.type]: DataGradeAdjustedSpeedAvgMilesPerHour.type,
    [DataGradeAdjustedSpeedFeetPerSecond.type]: DataGradeAdjustedSpeedAvgFeetPerSecond.type,
    [DataGradeAdjustedSpeedMetersPerMinute.type]: DataGradeAdjustedSpeedAvgMetersPerMinute.type,
    [DataGradeAdjustedSpeedKnots.type]: DataGradeAdjustedSpeedAvgKnots.type,

    [DataPace.type]: DataPaceAvg.type,
    [DataPaceMinutesPerMile.type]: DataPaceAvgMinutesPerMile.type,
    [DataEffortPace.type]: DataEffortPaceAvg.type,
    [DataEffortPaceMinutesPerMile.type]: DataEffortPaceAvgMinutesPerMile.type,

    [DataGradeAdjustedPace.type]: DataGradeAdjustedPaceAvg.type,
    [DataGradeAdjustedPaceMinutesPerMile.type]: DataGradeAdjustedPaceAvgMinutesPerMile.type,

    [DataPower.type]: DataPowerAvg.type,
    [DataCadence.type]: DataCadenceAvg.type,
    [DataTemperature.type]: DataTemperatureAvg.type,
    [DataAbsolutePressure.type]: DataAbsolutePressureAvg.type,
    [DataGroundContactTime.type]: DataGroundContactTimeAvg.type,
    [DataGrade.type]: DataGradeAvg.type,
    [DataLegStiffness.type]: DataLegStiffnessAvg.type,
    [DataVerticalOscillation.type]: DataVerticalOscillationAvg.type,
    [DataVerticalRatio.type]: DataVerticalRatioAvg.type,
    [DataJumpDistance.type]: DataJumpDistanceAvg.type,
    [JUMP_SPEED_KILOMETERS_PER_HOUR_BASE_TYPE]: DataJumpSpeedAvgKilometersPerHour.type,
    [JUMP_SPEED_MILES_PER_HOUR_BASE_TYPE]: DataJumpSpeedAvgMilesPerHour.type,
    [JUMP_SPEED_FEET_PER_SECOND_BASE_TYPE]: DataJumpSpeedAvgFeetPerSecond.type,
    [JUMP_SPEED_METERS_PER_MINUTE_BASE_TYPE]: DataJumpSpeedAvgMetersPerMinute.type,
    [JUMP_SPEED_FEET_PER_MINUTE_BASE_TYPE]: DataJumpSpeedAvgFeetPerMinute.type,
    [JUMP_SPEED_KNOTS_BASE_TYPE]: DataJumpSpeedAvgKnots.type,
    [DataFlow.type]: DataAvgFlow.type,
    [DataGrit.type]: DataAvgGrit.type,
    [DataSatellite5BestSNR.type]: DataSatellite5BestSNRAvg.type,
    [DataNumberOfSatellites.type]: DataNumberOfSatellitesAvg.type,
    [DataEVPE.type]: DataEVPEAvg.type,
    [DataEHPE.type]: DataEHPEAvg.type,
    ...Object.keys(DynamicDataLoader.dataTypeFamilyTriplets).reduce(
      (accu: Record<string, string>, dataType: string) => {
        accu[dataType] = DynamicDataLoader.dataTypeFamilyTriplets[dataType].avg;
        return accu;
      },
      {}
    )
  };

  static allUnitDerivedDataTypes = Array.from(
    new Set(
      Object.keys(DynamicDataLoader.dataTypeUnitGroups).reduce(
        (accu: string[], key) => accu.concat(Object.keys(DynamicDataLoader.dataTypeUnitGroups[key])),
        []
      )
    )
  );

  static zoneStatsTypeMap: { type: string; stats: string[] }[] = [
    {
      type: DataHeartRate.type,
      stats: [
        DataHeartRateZoneOneDuration.type,
        DataHeartRateZoneTwoDuration.type,
        DataHeartRateZoneThreeDuration.type,
        DataHeartRateZoneFourDuration.type,
        DataHeartRateZoneFiveDuration.type,
        DataHeartRateZoneSixDuration.type,
        DataHeartRateZoneSevenDuration.type
      ]
    },
    {
      type: DataSpeed.type,
      stats: [
        DataSpeedZoneOneDuration.type,
        DataSpeedZoneTwoDuration.type,
        DataSpeedZoneThreeDuration.type,
        DataSpeedZoneFourDuration.type,
        DataSpeedZoneFiveDuration.type,
        DataSpeedZoneSixDuration.type,
        DataSpeedZoneSevenDuration.type
      ]
    },
    {
      type: DataPower.type,
      stats: [
        DataPowerZoneOneDuration.type,
        DataPowerZoneTwoDuration.type,
        DataPowerZoneThreeDuration.type,
        DataPowerZoneFourDuration.type,
        DataPowerZoneFiveDuration.type,
        DataPowerZoneSixDuration.type,
        DataPowerZoneSevenDuration.type
      ]
    }
  ];

  static getDataInstanceFromDataType(dataType: string, opts: any): DataInterface {
    // Redirect legacy Stance Time types to Ground Contact Time
    if (dataType === DataStanceTime.type) {
      dataType = DataGroundContactTime.type;
    } else if (dataType === DataStanceTimeBalanceLeft.type) {
      dataType = DataGroundContactTimeBalanceLeft.type;
    } else if (dataType === DataStanceTimeBalanceRight.type) {
      dataType = DataGroundContactTimeBalanceRight.type;
    } else if (dataType === 'Ground Contact Time Avg') {
      dataType = DataGroundContactTimeAvg.type;
    } else if (dataType === 'Ground Contact Time Min') {
      dataType = DataGroundContactTimeMin.type;
    } else if (dataType === 'Ground Contact Time Max') {
      dataType = DataGroundContactTimeMax.type;
    }

    const className = Object.keys(DataStore).find(dataClass => {
      if (!DataStore[dataClass] || !DataStore[dataClass].type) {
        return false;
      }
      if (DataStore[dataClass].type === dataType) {
        return true;
      }
      return Array.isArray(DataStore[dataClass].aliases) && DataStore[dataClass].aliases.indexOf(dataType) !== -1;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of '${dataType}' is not in the store`);
    }
    return new DataStore[className](opts);
  }

  static getDataClassFromDataType(dataType: string): typeof Data {
    if (dataType === 'Ground Contact Time Avg') {
      dataType = DataGroundContactTimeAvg.type;
    } else if (dataType === 'Ground Contact Time Min') {
      dataType = DataGroundContactTimeMin.type;
    } else if (dataType === 'Ground Contact Time Max') {
      dataType = DataGroundContactTimeMax.type;
    }

    const className = Object.keys(DataStore).find(dataClass => {
      if (!DataStore[dataClass] || !DataStore[dataClass].type) {
        return false;
      }
      if (DataStore[dataClass].type === dataType) {
        return true;
      }
      return Array.isArray(DataStore[dataClass].aliases) && DataStore[dataClass].aliases.indexOf(dataType) !== -1;
    });
    if (!className || !DataStore[className]) {
      throw new Error(`Class type of '${dataType}' is not in the store`);
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
    return [DataGNSSDistance.type, DataTime.type].indexOf(dataType) !== -1;
  }

  private static getDistanceUnits(userUnitSettings?: UserUnitSettingsInterface): DistanceUnits {
    return userUnitSettings?.distanceUnits || DistanceUnits.Kilometers;
  }

  private static getDistanceImperialDataType(dataType: string): string | null {
    const unitGroup = DynamicDataLoader.dataTypeUnitGroups[dataType];
    if (!unitGroup) {
      return null;
    }
    if (unitGroup[DataGNSSDistanceMiles.type]) {
      return DataGNSSDistanceMiles.type;
    }
    if (unitGroup[DataDistanceFeet.type]) {
      return DataDistanceFeet.type;
    }
    if (unitGroup[DataDistanceMiles.type]) {
      return DataDistanceMiles.type;
    }
    return null;
  }

  private static getDistanceDerivedDataType(
    dataType: string,
    userUnitSettings?: UserUnitSettingsInterface
  ): string | null {
    const distanceImperialDataType = this.getDistanceImperialDataType(dataType);
    if (!distanceImperialDataType) {
      return null;
    }
    return this.getDistanceUnits(userUnitSettings) === DistanceUnits.Miles ? distanceImperialDataType : dataType;
  }

  private static getDiveUnitDataType(dataType: string, userUnitSettings?: UserUnitSettingsInterface): string | null {
    const usesYards = userUnitSettings?.swimPaceUnits?.[0] === SwimPaceUnits.MinutesPer100Yard;
    if (DIVE_IMPERIAL_DATA_TYPE_BY_CANONICAL_TYPE[dataType]) {
      return usesYards ? DIVE_IMPERIAL_DATA_TYPE_BY_CANONICAL_TYPE[dataType] : dataType;
    }
    return null;
  }

  private static getJumpSpeedUnitMappings(
    dataType: string,
    userUnitSettings?: UserUnitSettingsInterface
  ): { targetDataType: string; sourceUnitType: string }[] {
    if (!userUnitSettings) {
      return [];
    }
    const jumpSpeedUnitMap = DynamicDataLoader.jumpSpeedUnitVariantTypes[dataType];
    if (!jumpSpeedUnitMap) {
      return [];
    }
    return userUnitSettings.speedUnits.reduce((accu: { targetDataType: string; sourceUnitType: string }[], unit) => {
      const targetDataType = jumpSpeedUnitMap[unit];
      if (!targetDataType) {
        return accu;
      }
      accu.push({ targetDataType, sourceUnitType: unit });
      return accu;
    }, []);
  }

  private static getJumpSpeedUnitDataTypes(
    dataType: string,
    userUnitSettings?: UserUnitSettingsInterface
  ): string[] | null {
    const mappings = this.getJumpSpeedUnitMappings(dataType, userUnitSettings);
    if (!mappings.length) {
      return null;
    }
    return mappings.map(mapping => mapping.targetDataType);
  }

  private static getJumpSpeedUnitDataFromDataInstance(
    data: DataInterface,
    userUnitSettings?: UserUnitSettingsInterface
  ): DataInterface[] | null {
    const mappings = this.getJumpSpeedUnitMappings(data.getType(), userUnitSettings);
    if (!mappings.length) {
      return null;
    }
    return mappings.map(mapping =>
      this.getDataInstanceFromDataType(mapping.targetDataType, data.getValue(mapping.sourceUnitType))
    );
  }

  private static getEffortPaceUnitMappings(
    dataType: string,
    userUnitSettings?: UserUnitSettingsInterface
  ): { targetDataType: string; sourceUnitType: string }[] {
    if (!userUnitSettings) {
      return [];
    }
    const effortPaceUnitMap = DynamicDataLoader.effortPaceUnitVariantTypes[dataType];
    if (!effortPaceUnitMap) {
      return [];
    }
    return userUnitSettings.paceUnits.reduce((accu: { targetDataType: string; sourceUnitType: string }[], unit) => {
      const targetDataType = effortPaceUnitMap[unit];
      if (!targetDataType) {
        return accu;
      }
      accu.push({ targetDataType, sourceUnitType: unit });
      return accu;
    }, []);
  }

  private static getEffortPaceUnitDataTypes(
    dataType: string,
    userUnitSettings?: UserUnitSettingsInterface
  ): string[] | null {
    const mappings = this.getEffortPaceUnitMappings(dataType, userUnitSettings);
    if (!mappings.length) {
      return null;
    }
    return mappings.map(mapping => mapping.targetDataType);
  }

  private static getEffortPaceUnitDataFromDataInstance(
    data: DataInterface,
    userUnitSettings?: UserUnitSettingsInterface
  ): DataInterface[] | null {
    const mappings = this.getEffortPaceUnitMappings(data.getType(), userUnitSettings);
    if (!mappings.length) {
      return null;
    }
    return mappings.map(mapping =>
      this.getDataInstanceFromDataType(mapping.targetDataType, data.getValue(mapping.sourceUnitType))
    );
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
  static getUnitBasedDataTypesFromDataTypes(
    dataTypes: string[],
    userUnitSettings?: UserUnitSettingsInterface,
    options: { includeDerivedTypes?: boolean } = { includeDerivedTypes: true }
  ): string[] {
    let unitBasedDataTypes: any[] = [];
    if (!userUnitSettings) {
      return unitBasedDataTypes;
    }
    if (dataTypes.indexOf(DataSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.speedUnits);
      if (options.includeDerivedTypes) {
        unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.swimPaceUnits);
        unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.paceUnits);
      }
    }
    if (dataTypes.indexOf(DataGradeAdjustedSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.gradeAdjustedSpeedUnits);
      if (options.includeDerivedTypes) {
        unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.gradeAdjustedPaceUnits);
      }
    }
    if (dataTypes.indexOf(DataVerticalSpeed.type) !== -1) {
      unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.verticalSpeedUnits);
    }
    unitBasedDataTypes = unitBasedDataTypes.concat(
      dataTypes.reduce((accu: string[], dataType: string) => {
        const diveDataType = this.getDiveUnitDataType(dataType, userUnitSettings);
        if (diveDataType && accu.indexOf(diveDataType) === -1) {
          accu.push(diveDataType);
        }
        return accu;
      }, [])
    );
    unitBasedDataTypes = unitBasedDataTypes.concat(
      dataTypes.reduce((accu: string[], dataType: string) => {
        const jumpSpeedDataTypes = this.getJumpSpeedUnitDataTypes(dataType, userUnitSettings);
        if (!jumpSpeedDataTypes) {
          return accu;
        }
        jumpSpeedDataTypes.forEach(jumpSpeedDataType => {
          if (accu.indexOf(jumpSpeedDataType) === -1) {
            accu.push(jumpSpeedDataType);
          }
        });
        return accu;
      }, [])
    );
    unitBasedDataTypes = unitBasedDataTypes.concat(
      dataTypes.reduce((accu: string[], dataType: string) => {
        const effortPaceDataTypes = this.getEffortPaceUnitDataTypes(dataType, userUnitSettings);
        if (!effortPaceDataTypes) {
          return accu;
        }
        effortPaceDataTypes.forEach(effortPaceDataType => {
          if (accu.indexOf(effortPaceDataType) === -1) {
            accu.push(effortPaceDataType);
          }
        });
        return accu;
      }, [])
    );
    unitBasedDataTypes = unitBasedDataTypes.concat(
      dataTypes.reduce((accu: string[], dataType: string) => {
        const distanceDataType = this.getDistanceDerivedDataType(dataType, userUnitSettings);
        if (!distanceDataType || accu.indexOf(distanceDataType) !== -1) {
          return accu;
        }
        accu.push(distanceDataType);
        return accu;
      }, [])
    );
    return unitBasedDataTypes;
  }

  /**
   * Gets the unitbased types
   * @param dataType
   * @param userUnitSettings
   */
  static getUnitBasedDataTypesFromDataType(dataType: string, userUnitSettings?: UserUnitSettingsInterface): string[] {
    if (!userUnitSettings) {
      return [dataType];
    }
    const diveDataType = this.getDiveUnitDataType(dataType, userUnitSettings);
    if (diveDataType) {
      return [diveDataType];
    }
    const distanceDataType = this.getDistanceDerivedDataType(dataType, userUnitSettings);
    if (distanceDataType) {
      return [distanceDataType];
    }
    const jumpSpeedDataTypes = this.getJumpSpeedUnitDataTypes(dataType, userUnitSettings);
    if (jumpSpeedDataTypes) {
      return jumpSpeedDataTypes;
    }
    const effortPaceDataTypes = this.getEffortPaceUnitDataTypes(dataType, userUnitSettings);
    if (effortPaceDataTypes) {
      return effortPaceDataTypes;
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
  static getUnitBasedDataFromDataInstance(
    data: DataInterface,
    userUnitSettings?: UserUnitSettingsInterface
  ): DataInterface[] {
    if (data instanceof DataSwimDistance) {
      return [data];
    }
    if (!userUnitSettings) {
      return [data];
    }
    const dataType = data.getType();
    const diveDataType = this.getDiveUnitDataType(dataType, userUnitSettings);
    if (diveDataType) {
      if (diveDataType === dataType) {
        return [data];
      }
      return [
        this.getDataInstanceFromDataType(
          diveDataType,
          DynamicDataLoader.dataTypeUnitGroups[dataType][diveDataType](<number>data.getValue())
        )
      ];
    }
    const distanceDataType = this.getDistanceDerivedDataType(dataType, userUnitSettings);
    const distanceImperialDataType = this.getDistanceImperialDataType(dataType);
    const distanceUnitGroup = DynamicDataLoader.dataTypeUnitGroups[dataType];
    if (
      distanceDataType &&
      distanceImperialDataType &&
      distanceUnitGroup &&
      distanceUnitGroup[distanceImperialDataType]
    ) {
      if (distanceDataType === distanceImperialDataType) {
        return [
          this.getDataInstanceFromDataType(
            distanceImperialDataType,
            distanceUnitGroup[distanceImperialDataType](<number>data.getValue())
          )
        ];
      }
      return [data];
    }
    const jumpSpeedData = this.getJumpSpeedUnitDataFromDataInstance(data, userUnitSettings);
    if (jumpSpeedData) {
      return jumpSpeedData;
    }
    const effortPaceData = this.getEffortPaceUnitDataFromDataInstance(data, userUnitSettings);
    if (effortPaceData) {
      return effortPaceData;
    }
    switch (data.getType()) {
      // Speed
      case DataSpeed.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
        }, []);
      case DataSpeedAvg.type:
        return userUnitSettings.speedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataSpeedAvg.type, data.getValue(unit))];
            case DataSpeedKilometersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSpeedAvgKilometersPerHour.type, data.getValue(unit))
              ];
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
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSpeedMaxKilometersPerHour.type, data.getValue(unit))
              ];
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
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSpeedMinKilometersPerHour.type, data.getValue(unit))
              ];
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
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
        }, []);
      case DataGradeAdjustedSpeedAvg.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvg.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgKilometersPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgMilesPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgFeetPerSecond.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgMetersPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgFeetPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedKnots.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedAvgKnots.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);

      case DataGradeAdjustedSpeedMax.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMax.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxKilometersPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxMilesPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxFeetPerSecond.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxMetersPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxFeetPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedKnots.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMaxKnots.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataGradeAdjustedSpeedMin.type:
        return userUnitSettings.gradeAdjustedSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMin.type, data.getValue(unit))];
            case DataGradeAdjustedSpeedKilometersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinKilometersPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinMilesPerHour.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinFeetPerSecond.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinMetersPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinFeetPerMinute.type, data.getValue(unit))
              ];
            case DataGradeAdjustedSpeedKnots.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedSpeedMinKnots.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      // Pace
      case DataPace.type:
        return userUnitSettings.paceUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
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
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
        }, []);
      case DataGradeAdjustedPaceAvg.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceAvg.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedPaceAvgMinutesPerMile.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataGradeAdjustedPaceMax.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMax.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedPaceMaxMinutesPerMile.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataGradeAdjustedPaceMin.type:
        return userUnitSettings.gradeAdjustedPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataGradeAdjustedPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataGradeAdjustedPaceMin.type, data.getValue(unit))];
            case DataGradeAdjustedPaceMinutesPerMile.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataGradeAdjustedPaceMinMinutesPerMile.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);

      // Swim
      case DataSwimPace.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
        }, []);
      case DataSwimPaceAvg.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceAvg.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSwimPaceAvgMinutesPer100Yard.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataSwimPaceMax.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMax.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSwimPaceMaxMinutesPer100Yard.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataSwimPaceMin.type:
        return userUnitSettings.swimPaceUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataSwimPace.type:
              return [...accu, this.getDataInstanceFromDataType(DataSwimPaceMin.type, data.getValue(unit))];
            case DataSwimPaceMinutesPer100Yard.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataSwimPaceMinMinutesPer100Yard.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      // Vertical speed
      case DataVerticalSpeed.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          return [...accu, this.getDataInstanceFromDataType(unit, data.getValue(unit))];
        }, []);
      case DataVerticalSpeedAvg.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedAvg.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerMinute.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgFeetPerSecond.type, data.getValue(unit))
              ];
            case DataVerticalSpeedKilometerPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgKilometerPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgMilesPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgMetersPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedAvgMetersPerMinute.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataVerticalSpeedMax.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMax.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerMinute.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxFeetPerSecond.type, data.getValue(unit))
              ];
            case DataVerticalSpeedKilometerPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxKilometerPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxMilesPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxMetersPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMaxMetersPerMinute.type, data.getValue(unit))
              ];
          }
          return accu;
        }, []);
      case DataVerticalSpeedMin.type:
        return userUnitSettings.verticalSpeedUnits.reduce((accu: DataInterface[], unit) => {
          switch (unit) {
            case DataVerticalSpeed.type:
              return [...accu, this.getDataInstanceFromDataType(DataVerticalSpeedMin.type, data.getValue(unit))];
            case DataVerticalSpeedFeetPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerMinute.type, data.getValue(unit))
              ];
            case DataVerticalSpeedFeetPerSecond.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinFeetPerSecond.type, data.getValue(unit))
              ];
            case DataVerticalSpeedKilometerPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinKilometerPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMilesPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinMilesPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerHour.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinMetersPerHour.type, data.getValue(unit))
              ];
            case DataVerticalSpeedMetersPerMinute.type:
              return [
                ...accu,
                this.getDataInstanceFromDataType(DataVerticalSpeedMinMetersPerMinute.type, data.getValue(unit))
              ];
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
    [type: string]: (value: number) => number;
  };
}
