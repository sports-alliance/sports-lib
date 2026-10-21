import { takeImportedSensorFillTimes } from './imported-sensor-fill-times';
import { powerIntervals, meanMaxPower } from './power-intervals';
import type { PowerCoverage } from '../../activities/power-coverage';
import { DataEvent } from '../../data/data.event';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';
import { captureHeartRateCoverageBeforeFill, retainHeartRateCoverageAfterFill, getHeartRateSamplesWithCoverage } from './tss/hr-observation-coverage';
import { calculateNormalizedPower } from './normalized-power';
import { getHeartRateSamplesWithoutPauses } from './tss/hr-tss-samples';
import { recordedPoolHeartRate } from '../../streams/recorded-pool-heart-rate';
import { fileHeartRateCalibration, fileFunctionalThresholdPower, fileActiveDuration, trainingStressScoreEvaluations, TrainingStressScoreEvaluations, TrainingStressScoreEvaluation, TrainingStressScorePreference, TrainingStressScoreReason } from './tss/tss-evaluation';
import { ActivityInterface } from '../../activities/activity.interface';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataMaxHRSetting } from '../../data/data.max-hr-setting';
import { DataCadence } from '../../data/data.cadence';
import { DataSpeed } from '../../data/data.speed';
import { DataWeight } from '../../data/data.weight';
import { DataGender } from '../../data/data.gender';
import {
  DataVerticalSpeed,
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedMilesPerHour
} from '../../data/data.vertical-speed';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataEHPEMin } from '../../data/data.ehpe-min';
import { DataEHPEMax } from '../../data/data.ehpe-max';
import { DataEHPEAvg } from '../../data/data.ehpe-avg';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataNumberOfSatellitesMin } from '../../data/data.number-of-satellites-min';
import { DataNumberOfSatellitesMax } from '../../data/data.number-of-satellites-max';
import { DataNumberOfSatellitesAvg } from '../../data/data.number-of-satellites-avg';
import { DataAltitude } from '../../data/data.altitude';
import { DataPower } from '../../data/data.power';
import { DataAltitudeMax } from '../../data/data.altitude-max';
import { DataAltitudeMin } from '../../data/data.altitude-min';
import { DataAltitudeAvg } from '../../data/data.altitude-avg';
import { DataHeartRateMax } from '../../data/data.heart-rate-max';
import { DataHeartRateMin } from '../../data/data.heart-rate-min';
import { DataHeartRateAvg } from '../../data/data.heart-rate-avg';
import { DataCadenceMax } from '../../data/data.cadence-max';
import { DataCadenceMin } from '../../data/data.cadence-min';
import { DataCadenceAvg } from '../../data/data.cadence-avg';
import { DataStrokeRate } from '../../data/data.stroke-rate';
import { DataStrokeRateMax } from '../../data/data.stroke-rate-max';
import { DataStrokeRateMin } from '../../data/data.stroke-rate-min';
import { DataStrokeRateAvg } from '../../data/data.stroke-rate-avg';
import {
  DataSpeedMax,
  DataSpeedMaxFeetPerMinute,
  DataSpeedMaxFeetPerSecond,
  DataSpeedMaxKilometersPerHour,
  DataSpeedMaxKnots,
  DataSpeedMaxMetersPerMinute,
  DataSpeedMaxMilesPerHour
} from '../../data/data.speed-max';
import {
  DataSpeedMin,
  DataSpeedMinFeetPerMinute,
  DataSpeedMinFeetPerSecond,
  DataSpeedMinKilometersPerHour,
  DataSpeedMinKnots,
  DataSpeedMinMetersPerMinute,
  DataSpeedMinMilesPerHour
} from '../../data/data.speed-min';
import {
  DataSpeedAvg,
  DataSpeedAvgFeetPerMinute,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgKilometersPerHour,
  DataSpeedAvgKnots,
  DataSpeedAvgMetersPerMinute,
  DataSpeedAvgMilesPerHour
} from '../../data/data.speed-avg';
import {
  DataVerticalSpeedMax,
  DataVerticalSpeedMaxFeetPerHour,
  DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxFeetPerSecond,
  DataVerticalSpeedMaxKilometerPerHour,
  DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxMetersPerMinute,
  DataVerticalSpeedMaxMilesPerHour
} from '../../data/data.vertical-speed-max';
import {
  DataVerticalSpeedMin,
  DataVerticalSpeedMinFeetPerHour,
  DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinFeetPerSecond,
  DataVerticalSpeedMinKilometerPerHour,
  DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinMetersPerMinute,
  DataVerticalSpeedMinMilesPerHour
} from '../../data/data.vertical-speed-min';
import {
  DataVerticalSpeedAvg,
  DataVerticalSpeedAvgFeetPerHour,
  DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgFeetPerSecond,
  DataVerticalSpeedAvgKilometerPerHour,
  DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgMetersPerMinute,
  DataVerticalSpeedAvgMilesPerHour
} from '../../data/data.vertical-speed-avg';
import { DataPowerMax } from '../../data/data.power-max';
import { DataPowerMin } from '../../data/data.power-min';
import { DataPowerAvg } from '../../data/data.power-avg';
import { DataTemperatureMax } from '../../data/data.temperature-max';
import { DataTemperatureMin } from '../../data/data.temperature-min';
import { DataTemperatureAvg } from '../../data/data.temperature-avg';
import { DataAbsolutePressureMin } from '../../data/data.absolute-pressure-min';
import { DataAbsolutePressureMax } from '../../data/data.absolute-pressure-max';
import { DataAbsolutePressureAvg } from '../../data/data.absolute-pressure-avg';
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
import { DataAscent } from '../../data/data.ascent';
import { DataDescent } from '../../data/data.descent';
import { GeoLibAdapter } from '../../geodesy/adapters/geolib.adapter';
import { DataPaceMax, DataPaceMaxMinutesPerMile } from '../../data/data.pace-max';
import { DataPace } from '../../data/data.pace';
import { DataPaceMin, DataPaceMinMinutesPerMile } from '../../data/data.pace-min';
import { DataPaceAvg, DataPaceAvgMinutesPerMile } from '../../data/data.pace-avg';
import { DataEffortPaceAvg, DataEffortPaceAvgMinutesPerMile } from '../../data/data.effort-pace-avg';
import { DataEffortPaceMin, DataEffortPaceMinMinutesPerMile } from '../../data/data.effort-pace-min';
import { DataEffortPaceMax, DataEffortPaceMaxMinutesPerMile } from '../../data/data.effort-pace-max';
import { DataBatteryCharge } from '../../data/data.battery-charge';
import { DataBatteryConsumption } from '../../data/data.battery-consumption';
import { DataBatteryLifeEstimation } from '../../data/data.battery-life-estimation';
import { DataPositionInterface } from '../../data/data.position.interface';
import { DataLatitudeDegrees } from '../../data/data.latitude-degrees';
import { Stream } from '../../streams/stream';
import {
  convertPaceToPaceInMinutesPerMile,
  convertSpeedToPace,
  convertSpeedToSpeedInFeetPerHour,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInKnots,
  convertSpeedToSpeedInMetersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour,
  convertSpeedToSwimPace,
  convertSwimPaceToSpeed,
  convertSwimPaceToSwimPacePer100Yard,
  isNumber,
  isNumberOrString,
  medianFilter,
  standardDeviation
} from './helpers';
import { DataLongitudeDegrees } from '../../data/data.longitude-degrees';
import { StreamInterface } from '../../streams/stream.interface';
import { canDeriveStreamType } from '../../streams/stream.derivation.registry';
import { DataEnergy } from '../../data/data.energy';
import { DataStartAltitude } from '../../data/data.start-altitude';
import { DataEndAltitude } from '../../data/data.end-altitude';
import { DataSwimPaceMax, DataSwimPaceMaxMinutesPer100Yard } from '../../data/data.swim-pace-max';
import { DataSwimPace } from '../../data/data.swim-pace';
import { DataSwimPaceMin, DataSwimPaceMinMinutesPer100Yard } from '../../data/data.swim-pace-min';
import { DataSwimPaceAvg, DataSwimPaceAvgMinutesPer100Yard } from '../../data/data.swim-pace-avg';
import { DataFeeling } from '../../data/data.feeling';
import { DataPowerWattsPerKg } from '../../data/data.power-watts-per-kg';
import { DataCriticalPower } from '../../data/data.critical-power';
import { DataWPrime } from '../../data/data.w-prime';
import { DataFTP } from '../../data/data.ftp';
import { DataPowerLeft } from '../../data/data.power-left';
import { DataPowerBalanceLeft } from '../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../data/data.power-balance-right';
import { DataPowerRight } from '../../data/data.power-right';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataLegStiffnessAvg } from '../../data/data.leg-stiffness-avg';
import { DataInterface } from '../../data/data.interface';
import { DataRPE } from '../../data/data.rpe';
import { DataGNSSDistance } from '../../data/data.gnss-distance';
import { DataHeartRateZoneOneDuration } from '../../data/data.heart-rate-zone-one-duration';
import { DataHeartRateZoneTwoDuration } from '../../data/data.heart-rate-zone-two-duration';
import { DataHeartRateZoneThreeDuration } from '../../data/data.heart-rate-zone-three-duration';
import { DataHeartRateZoneFourDuration } from '../../data/data.heart-rate-zone-four-duration';
import { DataHeartRateZoneFiveDuration } from '../../data/data.heart-rate-zone-five-duration';
import { DataPowerZoneOneDuration } from '../../data/data.power-zone-one-duration';
import { DataPowerZoneTwoDuration } from '../../data/data.power-zone-two-duration';
import { DataPowerZoneThreeDuration } from '../../data/data.power-zone-three-duration';
import { DataPowerZoneFourDuration } from '../../data/data.power-zone-four-duration';
import { DataPowerZoneFiveDuration } from '../../data/data.power-zone-five-duration';
import { DataPowerZoneSixDuration } from '../../data/data.power-zone-six-duration';
import { DataPowerZoneSevenDuration } from '../../data/data.power-zone-seven-duration';
import { DataSpeedZoneOneDuration } from '../../data/data.speed-zone-one-duration';
import { DataSpeedZoneTwoDuration } from '../../data/data.speed-zone-two-duration';
import { DataSpeedZoneThreeDuration } from '../../data/data.speed-zone-three-duration';
import { DataSpeedZoneFourDuration } from '../../data/data.speed-zone-four-duration';
import { DataSpeedZoneFiveDuration } from '../../data/data.speed-zone-five-duration';
import { DataGroundContactTimeAvg } from '../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataIBI } from '../../data/data.ibi';
import { DataGroundContactTimeBalanceLeft } from '../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../data/data-ground-contact-time-balance-right';
import {
  DataContactTimeToFlightTimeRatioAvg,
  DataContactTimeToFlightTimeRatioMax,
  DataContactTimeToFlightTimeRatioMin,
  DataGroundContactTimePercentageAvg,
  DataGroundContactTimePercentageMax,
  DataGroundContactTimePercentageMin,
  DataRunningFlightTimeAvg,
  DataRunningFlightTimeMax,
  DataRunningFlightTimeMin
} from '../../data/data.running-dynamics';
import {
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight
} from '../../data/data.running-dynamics-balance';
import { DataVerticalOscillationAvg } from '../../data/data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';
import { DataVerticalRatioAvg } from '../../data/data.vertical-ratio-avg';
import { DataStanceTimeBalanceLeft } from '../../data/data-stance-time-balance-left';
import { DataStanceTimeBalanceRight } from '../../data/data-stance-time-balance-right';

import { DynamicDataLoader } from '../../data/data.store';
import { DataStartPosition } from '../../data/data.start-position';
import { DataEndPosition } from '../../data/data.end-position';
import {
  DataGradeAdjustedSpeedAvg,
  DataGradeAdjustedSpeedAvgFeetPerMinute,
  DataGradeAdjustedSpeedAvgFeetPerSecond,
  DataGradeAdjustedSpeedAvgKilometersPerHour,
  DataGradeAdjustedSpeedAvgKnots,
  DataGradeAdjustedSpeedAvgMetersPerMinute,
  DataGradeAdjustedSpeedAvgMilesPerHour
} from '../../data/data.grade-adjusted-speed-avg';
import {
  DataGradeAdjustedPaceAvg,
  DataGradeAdjustedPaceAvgMinutesPerMile
} from '../../data/data.grade-adjusted-pace-avg';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataGradeAdjustedPace } from '../../data/data.grade-adjusted-pace';
import {
  DataGradeAdjustedSpeedMax,
  DataGradeAdjustedSpeedMaxFeetPerMinute,
  DataGradeAdjustedSpeedMaxFeetPerSecond,
  DataGradeAdjustedSpeedMaxKilometersPerHour,
  DataGradeAdjustedSpeedMaxKnots,
  DataGradeAdjustedSpeedMaxMetersPerMinute,
  DataGradeAdjustedSpeedMaxMilesPerHour
} from '../../data/data.grade-adjusted-speed-max';
import {
  DataGradeAdjustedSpeedMin,
  DataGradeAdjustedSpeedMinFeetPerMinute,
  DataGradeAdjustedSpeedMinFeetPerSecond,
  DataGradeAdjustedSpeedMinKilometersPerHour,
  DataGradeAdjustedSpeedMinKnots,
  DataGradeAdjustedSpeedMinMetersPerMinute,
  DataGradeAdjustedSpeedMinMilesPerHour
} from '../../data/data.grade-adjusted-speed-min';
import {
  DataGradeAdjustedPaceMax,
  DataGradeAdjustedPaceMaxMinutesPerMile
} from '../../data/data.grade-adjusted-pace-max';
import {
  DataGradeAdjustedPaceMin,
  DataGradeAdjustedPaceMinMinutesPerMile
} from '../../data/data.grade-adjusted-pace-min';
import { DataGrade } from '../../data/data.grade';
import { DataGradeMin } from '../../data/data.grade-min';
import { DataGradeMax } from '../../data/data.grade-max';
import { DataGradeAvg } from '../../data/data.grade-avg';
import {
  type ActivityTypeGroup,
  ActivityTypeGroups,
  ActivityTypes,
  ActivityTypesHelper,
  ActivityTypesMoving
} from '../../activities/activity.types';
import { type ActivityParsingTssOverridesOptions } from '../../activities/activity-parsing-options';
import { DataMovingTime } from '../../data/data.moving-time';
import { StatsClassInterface } from '../../stats/stats.class.interface';
import { hydrateMissingSpeedDerivedStats } from '../../stats/speed-derived-stats';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataElapsedTime } from '../../data/data.elapsed-time';
import { DataNumber } from '../../data/data.number';
import { DataAltitudeSmooth } from '../../data/data.altitude-smooth';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataSWOLF25m } from '../../data/data.swolf-25m';
import { DataSWOLF50m } from '../../data/data.swolf-50m';
import { normalizeActivityMetricSemanticsForActivity } from '../../activities/activity.metric-semantics';
import { addMissingStreamSummaryStats } from './stream-summary-policies';

import { LowPassFilter } from './grade-calculator/low-pass-filter';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataTrainingStressScore } from '../../data/data.training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod,
  type TrainingStressScoreMethodType
} from '../../data/data.training-stress-score-method';
import { DataPowerWork } from '../../data/data.power-work';
import {
  speedFromDistance,
  gradeFromDistance,
  gradeSamplesForSpeed,
  adjustedSpeedFromGrade,
  intervalAverage,
  intervalValues,
  movingSeconds
} from './distance-intervals';
import { DataVO2Max } from '../../data/data.vo2-max';
import { DataTotalGrit } from '../../data/data.total-grit';
import { DataTotalFlow } from '../../data/data.total-flow';
import { DataJumpCount } from '../../data/data.jump-count';
import { DataJumpEvent } from '../../data/data.jump-event';
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
  DataJumpSpeedMax,
  DataJumpSpeedMin
} from '../../data/data.jump-stats';
import { DataPowerCurve, DataPowerCurvePoint } from '../../data/data.power-curve';
import {
  DataDurabilityEvidence,
  type DurabilityEvidenceValue,
  normalizeDurabilityEvidenceValue
} from '../../data/data.durability-evidence';
import { DataThreeDimensionalStrainEvidence } from '../../data/data.three-dimensional-strain-evidence';
import { TssCalculator, type TssCalculationResult } from './tss/tss-calculator';
import { supportsCalculatedTrainingStressScore } from './tss/tss-eligibility';
import {
  analyzeActivityDurability,
  calculateActivityDurabilitySourceFingerprint,
  hasActivityDurabilitySourceData
} from './activity-durability';

// @ts-ignore
import KalmanFilter from 'kalmanjs';

/* Configure filtering values */
// Altitude stream
const ALTITUDE_SPIKES_FILTER_WIN = 3;

// Fix abnormal streams
const SPEED_STREAM_STD_DEV_THRESHOLD_DEFAULT = 25 / 3.6; // Kph to mps
const SPEED_STREAM_STD_DEV_THRESHOLD_MAP = new Map<ActivityTypeGroup, number>([
  [ActivityTypeGroups.RunningGroup, 15 / 3.6], // kph to m/s
  [ActivityTypeGroups.CyclingGroup, 27 / 3.6], // kph to m/s
  [ActivityTypeGroups.MountainBikingGroup, 27 / 3.6], // kph to m/s
  [ActivityTypeGroups.SwimmingGroup, 5 / 3.6] // kph to m/s
]);

interface TssCandidate {
  result: TssCalculationResult | null;
  reason: TrainingStressScoreReason | null;
}

export class ActivityUtilities {
  private static readonly calculatedNormalizedPower = new WeakMap<ActivityInterface, { stat: DataPowerNormalized; value: number }>();
  private static readonly calculatedIntensityFactor = new WeakMap<ActivityInterface, { stat: DataPowerIntensityFactor; value: number }>();

  private static invalidateCalculatedPower(activity: ActivityInterface): { normalizedPower: boolean; intensityFactor: boolean } {
    const invalidated = { normalizedPower: false, intensityFactor: false };
    const np = this.calculatedNormalizedPower.get(activity);
    if (np && activity.getStat(DataPowerNormalized.type) === np.stat && np.stat.getValue() === np.value) {
      activity.removeStat(DataPowerNormalized.type);
      invalidated.normalizedPower = true;
    }
    const factor = this.calculatedIntensityFactor.get(activity);
    if (factor && activity.getStat(DataPowerIntensityFactor.type) === factor.stat && factor.stat.getValue() === factor.value) {
      activity.removeStat(DataPowerIntensityFactor.type);
      invalidated.intensityFactor = true;
    }
    this.calculatedNormalizedPower.delete(activity);
    this.calculatedIntensityFactor.delete(activity);
    return invalidated;
  }

  private static setCalculatedNormalizedPower(activity: ActivityInterface, value: number): void {
    const stat = new DataPowerNormalized(value);
    activity.addStat(stat);
    this.calculatedNormalizedPower.set(activity, { stat, value });
  }

  private static createCalculatedIntensityFactor(activity: ActivityInterface, value: number): DataPowerIntensityFactor {
    const stat = new DataPowerIntensityFactor(value);
    this.calculatedIntensityFactor.set(activity, { stat, value });
    return stat;
  }

  private static isCalculatedNormalizedPower(activity: ActivityInterface): boolean {
    const calculated = this.calculatedNormalizedPower.get(activity);
    return !!calculated && activity.getStat(DataPowerNormalized.type) === calculated.stat &&
      calculated.stat.getValue() === calculated.value;
  }

  /** Measures observed active power support without changing streams or persisted statistics.
   * Each reading supports at most one second. Missing watts remain unknown; recorded zeroes count as coverage.
   * Observed work is partial when coverageRatio is below one, not an estimate of missing work.
   */
  public static getPowerCoverage(activity: ActivityInterface): PowerCoverage {
    return powerIntervals(activity).coverage;
  }

  private static geoLibAdapter = new GeoLibAdapter();
  private static readonly MINIMUM_COMPUTED_POWER_TSS_COVERAGE = 0.8;
  private static readonly FTP_DURATION_SECONDS = 1200;
  private static readonly FTP_FACTOR = 0.95;
  private static readonly INTENSITY_FACTOR_DECIMALS = 3;
  private static readonly TRAINING_STRESS_SCORE_DECIMALS = 1;
  private static readonly jumpStatFamilies: Array<{
    key: string;
    minType: string;
    maxType: string;
    avgType: string;
    createMin: (value: number) => DataInterface;
    createMax: (value: number) => DataInterface;
    createAvg: (value: number) => DataInterface;
    getEventValue: (jumpEvent: DataJumpEvent) => number | undefined;
  }> = [
    {
      key: 'hang_time',
      minType: DataJumpHangTimeMin.type,
      maxType: DataJumpHangTimeMax.type,
      avgType: DataJumpHangTimeAvg.type,
      createMin: (value: number) => new DataJumpHangTimeMin(value),
      createMax: (value: number) => new DataJumpHangTimeMax(value),
      createAvg: (value: number) => new DataJumpHangTimeAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.hang_time?.getValue()
    },
    {
      key: 'distance',
      minType: DataJumpDistanceMin.type,
      maxType: DataJumpDistanceMax.type,
      avgType: DataJumpDistanceAvg.type,
      createMin: (value: number) => new DataJumpDistanceMin(value),
      createMax: (value: number) => new DataJumpDistanceMax(value),
      createAvg: (value: number) => new DataJumpDistanceAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.distance?.getValue()
    },
    {
      key: 'speed',
      minType: DataJumpSpeedMin.type,
      maxType: DataJumpSpeedMax.type,
      avgType: DataJumpSpeedAvg.type,
      createMin: (value: number) => new DataJumpSpeedMin(value),
      createMax: (value: number) => new DataJumpSpeedMax(value),
      createAvg: (value: number) => new DataJumpSpeedAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.speed?.getValue()
    },
    {
      key: 'rotations',
      minType: DataJumpRotationsMin.type,
      maxType: DataJumpRotationsMax.type,
      avgType: DataJumpRotationsAvg.type,
      createMin: (value: number) => new DataJumpRotationsMin(value),
      createMax: (value: number) => new DataJumpRotationsMax(value),
      createAvg: (value: number) => new DataJumpRotationsAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.rotations?.getValue()
    },
    {
      key: 'score',
      minType: DataJumpScoreMin.type,
      maxType: DataJumpScoreMax.type,
      avgType: DataJumpScoreAvg.type,
      createMin: (value: number) => new DataJumpScoreMin(value),
      createMax: (value: number) => new DataJumpScoreMax(value),
      createAvg: (value: number) => new DataJumpScoreAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.score?.getValue()
    },
    {
      key: 'height',
      minType: DataJumpHeightMin.type,
      maxType: DataJumpHeightMax.type,
      avgType: DataJumpHeightAvg.type,
      createMin: (value: number) => new DataJumpHeightMin(value),
      createMax: (value: number) => new DataJumpHeightMax(value),
      createAvg: (value: number) => new DataJumpHeightAvg(value),
      getEventValue: (jumpEvent: DataJumpEvent) => jumpEvent.jumpData?.height?.getValue()
    }
  ];

  /**
   * Provide average from laps a given stat type
   */
  public static getDataTypeAvgFromLaps(
    activity: ActivityInterface,
    statType: string,
    filterOver?: number
  ): number | null {
    const data = <number[]>activity
      .getLaps()
      .map(lap => (<DataNumber>lap.getStat(statType))?.getValue())
      .filter(d => Number.isFinite(d) && (Number.isFinite(filterOver) ? d > <number>filterOver : true));

    if (data.length > 0) {
      return this.getAverage(data);
    }

    return null;
  }

  /**
   * Provide average of a given stream type
   */
  public static getDataTypeAvg(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date,
    filterOver?: number
  ): number {
    if (startDate === undefined && endDate === undefined) {
      const data = activity.getStreamData(streamType);
      const shouldFilterOver = Number.isFinite(filterOver);
      let sum = 0;
      let count = 0;

      for (const value of data) {
        if (Number.isFinite(value) && (!shouldFilterOver || (value as number) > (filterOver as number))) {
          sum += value as number;
          count++;
        }
      }

      return sum / count;
    }

    const data = <number[]>(
      activity
        .getSquashedStreamData(streamType, startDate, endDate)
        .filter(
          streamData =>
            streamData !== Infinity &&
            streamData !== -Infinity &&
            (Number.isFinite(filterOver) ? streamData > <number>filterOver : true)
        )
    );
    return this.getAverage(data);
  }

  public static round(value: number, decimals = 0) {
    const decimalsFactor = Math.pow(10, decimals);
    return Math.round(value * decimalsFactor) / decimalsFactor;
  }

  private static addLeftRightBalanceStatsFromStreams(
    activity: ActivityInterface,
    LeftDataClass: { type: string; new (value: number): DataInterface },
    RightDataClass: { type: string; new (value: number): DataInterface }
  ): void {
    const leftStat = activity.getStat(LeftDataClass.type);
    const rightStat = activity.getStat(RightDataClass.type);
    const leftStatValue = leftStat?.getValue();
    const rightStatValue = rightStat?.getValue();
    if (leftStat && rightStat) {
      return;
    }

    if (leftStat && !rightStat && typeof leftStatValue === 'number') {
      activity.addStat(new RightDataClass(this.round(100 - leftStatValue, 2)));
      return;
    }

    if (rightStat && !leftStat && typeof rightStatValue === 'number') {
      activity.addStat(new LeftDataClass(this.round(100 - rightStatValue, 2)));
      return;
    }

    if (activity.hasStreamData(LeftDataClass.type)) {
      const avgLeftBalance = this.round(this.getDataTypeAvg(activity, LeftDataClass.type), 2);
      activity.addStat(new LeftDataClass(avgLeftBalance));
      activity.addStat(new RightDataClass(this.round(100 - avgLeftBalance, 2)));
      return;
    }

    if (activity.hasStreamData(RightDataClass.type)) {
      const avgRightBalance = this.round(this.getDataTypeAvg(activity, RightDataClass.type), 2);
      activity.addStat(new RightDataClass(avgRightBalance));
      activity.addStat(new LeftDataClass(this.round(100 - avgRightBalance, 2)));
    }
  }

  public static getAverage(data: number[]): number {
    return this.getSum(data) / data.length;
  }

  public static getSum(data: number[]): number {
    return data.reduce((sumbuff: number, value: number) => {
      sumbuff += value;
      return sumbuff;
    }, 0);
  }

  public static getDataTypeMax(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date
  ): number {
    return this.getActivityDataTypeMinOrMax(activity, streamType, true, startDate, endDate);
  }

  public static getDataTypeMin(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date,
    filterOver?: number
  ): number {
    return this.getActivityDataTypeMinOrMax(activity, streamType, false, startDate, endDate, filterOver);
  }

  public static getDataTypeMinToMaxDifference(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date
  ): number {
    return (
      this.getDataTypeMax(activity, streamType, startDate, endDate) -
      this.getDataTypeMin(activity, streamType, startDate, endDate)
    );
  }

  public static getDataTypeFirst(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date
  ): number {
    if (startDate === undefined && endDate === undefined) {
      const data = activity.getStreamData(streamType);
      for (const value of data) {
        if (isNumber(value)) {
          return value as number;
        }
      }
      return undefined as unknown as number;
    }

    const data = <number[]>activity.getSquashedStreamData(streamType, startDate, endDate);
    return data[0];
  }

  public static getDataTypeLast(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date
  ): number {
    if (startDate === undefined && endDate === undefined) {
      const data = activity.getStreamData(streamType);
      for (let index = data.length - 1; index >= 0; index--) {
        const value = data[index];
        if (isNumber(value)) {
          return value as number;
        }
      }
      return undefined as unknown as number;
    }

    const data = <number[]>activity.getSquashedStreamData(streamType, startDate, endDate);
    return data[data.length - 1];
  }

  public static cropDistance(
    startDistance: number,
    endDistance: number,
    activity: ActivityInterface
  ): ActivityInterface {
    // Short to do the search just in case
    let startDistanceDate: Date | undefined; // Does not sound right
    let endDistanceDate: Date | undefined;

    // debugger;
    activity.getStreamData(DataDistance.type).forEach((distanceFromData, index) => {
      // Find the index with greater dinstnce and convert it to time
      if (startDistance && !startDistanceDate && distanceFromData && distanceFromData >= startDistance) {
        startDistanceDate = new Date(activity.startDate.getTime() + index * 1000);
        return;
      }
      // Same for end
      if (endDistance && !endDistanceDate && distanceFromData && distanceFromData >= endDistance) {
        endDistanceDate = new Date(activity.startDate.getTime() + index * 1000);
        return;
      }
    });

    if (!startDistanceDate && !endDistanceDate) {
      return activity;
    }

    activity = this.cropTime(activity, startDistanceDate, endDistanceDate);

    // Remove because it is invalid, you cannot just offset the distance as a stream I think
    const distanceStream = activity.getAllStreams().find(s => DataDistance.type === s.type);
    if (distanceStream) {
      activity.removeStream(distanceStream);
    }
    const gnssDistanceStream = activity.getAllStreams().find(s => DataGNSSDistance.type === s.type);
    if (gnssDistanceStream) {
      activity.removeStream(gnssDistanceStream);
    }
    return activity;
  }

  /**
   * Crops inclusively within the original activity, rebasing events and preserving the initial timer state.
   * A fractional start advances to the first retained one-second sample. Invalid/empty ranges throw before mutation.
   * Existing summary stats are unchanged; callers remain responsible for refreshing cropped summaries.
   * @param activity
   * @param startDate
   * @param endDate
   */
  public static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface {
    if (!startDate && !endDate) return activity;
    // Streams use one-second slots relative to the original start. Keep the first
    // retained sample on that clock instead of moving it to a fractional requested start.
    const requestedStart = Math.max(+(startDate || activity.startDate), +activity.startDate);
    const croppedStart = new Date(
      +activity.startDate + Math.ceil((requestedStart - +activity.startDate) / 1000) * 1000
    );
    const croppedEnd = new Date(Math.min(+(endDate || activity.endDate), +activity.endDate));
    if (!Number.isFinite(+croppedStart) || !Number.isFinite(+croppedEnd) || +croppedStart > +croppedEnd) {
      throw new RangeError('Crop must retain at least one timestamp within the activity');
    }
    const startSeconds = (+croppedStart - +activity.startDate) / 1000;
    const endSeconds = (+croppedEnd - +activity.startDate) / 1000;
    const timerTypes = [DataStartEvent.type, DataStopEvent.type, DataStopAllEvent.type];
    const events = activity
      .getAllEvents()
      .filter(event => Number.isFinite(event.timestamp))
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp);
    const cloneAt = (event: DataEvent, seconds: number): DataEvent =>
      Object.assign(Object.create(Object.getPrototypeOf(event)), event).setValue(seconds);
    const croppedEvents = events
      .filter(event => event.timestamp >= startSeconds && event.timestamp <= endSeconds)
      .map(event => cloneAt(event, event.timestamp - startSeconds));
    const previousTimer = events
      .filter(event => event.timestamp < startSeconds && timerTypes.includes(event.getType()))
      .pop();
    // A crop beginning inside a pause must not default to an active timer. Retain the
    // existing stop kind, without changing shared source event objects or other payloads.
    if (
      previousTimer &&
      previousTimer.getType() !== DataStartEvent.type &&
      !croppedEvents.some(event => event.timestamp === 0 && timerTypes.includes(event.getType()))
    ) {
      croppedEvents.unshift(cloneAt(previousTimer, 0));
    }

    activity.getAllStreams().forEach(stream => {
      // Supply both bounds so one-sided crops retain the same inclusive sample clock.
      const trimmedStreamData = activity.getStreamData(stream.type, croppedStart, croppedEnd);
      const evidence = stream.getIntervalSupport?.();
      let croppedEvidence;
      if (evidence) {
        // Apply exactly the existing crop's boundary convention to the parallel weights.
        const durations = activity
          .getStreamData(new Stream(stream.type, evidence.durations), croppedStart, croppedEnd)
          .map((duration, index) => {
            if (duration === null) return null;
            const left = evidence.direction === 'ending' ? index - duration : index;
            const right = left + duration;
            return left < 0 || right >= trimmedStreamData.length ? null : duration;
          });
        croppedEvidence = { direction: evidence.direction, durations };
      }
      activity.removeStream(stream);
      activity.addStream(new Stream(stream.type, trimmedStreamData, croppedEvidence));
    });

    activity.setAllEvents(croppedEvents);
    activity.startDate = croppedStart;
    activity.endDate = croppedEnd;
    return activity;
  }

  public static getStreamDataTypesBasedOnDataType(
    streamToBaseOn: StreamInterface,
    streams: StreamInterface[]
  ): { [type: string]: number | null }[] {
    return streamToBaseOn.getData().reduce((accu: { [type: string]: number | null }[], streamDataItem, index) => {
      if (!isNumberOrString(streamDataItem)) {
        return accu;
      }
      const dataItem: { [type: string]: number | null } = {
        [streamToBaseOn.type]: streamDataItem
      };
      streams.forEach(stream => {
        dataItem[stream.type] = stream.getData()[index];
      });
      accu.push(dataItem);
      return accu;
    }, []);
  }

  public static getStreamDataTypesBasedOnTime(
    startDate: Date,
    endDate: Date,
    streams: StreamInterface[]
  ): { [type: number]: { [type: string]: number | null } } {
    const streamDataBasedOnTime: { [type: number]: { [type: string]: number | null } } = {};
    for (let i = 0; i < this.getDataLength(startDate, endDate); i++) {
      // Perhaps this can be optimized with a search function
      streams.forEach((stream: StreamInterface) => {
        if (isNumber(stream.getData()[i])) {
          streamDataBasedOnTime[startDate.getTime() + i * 1000] =
            streamDataBasedOnTime[startDate.getTime() + i * 1000] || {};
          streamDataBasedOnTime[startDate.getTime() + i * 1000][stream.type] = stream.getData()[i];
        }
      });
    }
    return streamDataBasedOnTime;
  }

  public static getDataLength(startDate: Date, endDate: Date): number {
    return Math.ceil((+endDate - +startDate) / 1000) + 1;
  }

  private static createJumpAggregate(): { min: number; max: number; sum: number; count: number } {
    return {
      min: Infinity,
      max: -Infinity,
      sum: 0,
      count: 0
    };
  }

  private static getJumpEvents(activity: ActivityInterface): DataJumpEvent[] {
    const maybeGetAllEvents = (activity as ActivityInterface & { getAllEvents?: () => unknown[] }).getAllEvents;
    if (typeof maybeGetAllEvents !== 'function') {
      return [];
    }

    return maybeGetAllEvents
      .call(activity)
      .filter((event: unknown) => {
        if (!event || typeof (event as { getType?: () => string }).getType !== 'function') {
          return false;
        }
        if (event instanceof DataJumpEvent) {
          return true;
        }
        const typedEvent = event as { getType: () => string; jumpData?: unknown };
        return typedEvent.getType() === DataJumpEvent.type && typedEvent.jumpData !== undefined;
      })
      .map(event => event as DataJumpEvent);
  }

  private static getFiniteStatValue(activity: ActivityInterface, statType: string): number | null {
    const stat = activity.getStat(statType);
    if (!stat) {
      return null;
    }
    const value = stat.getValue();
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private static getJumpAggregatesFromEvents(
    jumpEvents: DataJumpEvent[]
  ): Map<string, { min: number; max: number; sum: number; count: number }> {
    const aggregates = new Map<string, { min: number; max: number; sum: number; count: number }>(
      this.jumpStatFamilies.map(family => [family.key, this.createJumpAggregate()])
    );

    jumpEvents.forEach(jumpEvent => {
      this.jumpStatFamilies.forEach(family => {
        const value = family.getEventValue(jumpEvent);
        if (typeof value === 'number' && Number.isFinite(value)) {
          const aggregate = aggregates.get(family.key)!;
          aggregate.min = Math.min(aggregate.min, value);
          aggregate.max = Math.max(aggregate.max, value);
          aggregate.sum += value;
          aggregate.count += 1;
        }
      });
    });

    return aggregates;
  }

  private static addMissingJumpStatsFromEvents(activity: ActivityInterface): void {
    const jumpEvents = this.getJumpEvents(activity);
    if (!jumpEvents.length) {
      return;
    }

    const aggregates = this.getJumpAggregatesFromEvents(jumpEvents);

    this.jumpStatFamilies.forEach(family => {
      const aggregate = aggregates.get(family.key)!;
      if (aggregate.count <= 0) {
        return;
      }

      if (!activity.getStat(family.minType)) {
        activity.addStat(family.createMin(aggregate.min));
      }
      if (!activity.getStat(family.maxType)) {
        activity.addStat(family.createMax(aggregate.max));
      }
      if (!activity.getStat(family.avgType)) {
        activity.addStat(family.createAvg(aggregate.sum / aggregate.count));
      }
    });
  }

  private static getSummaryJumpStatsForActivities(activities: ActivityInterface[]): DataInterface[] {
    const summaryAggregates = new Map<string, { min: number; max: number; sum: number; count: number }>(
      this.jumpStatFamilies.map(family => [family.key, this.createJumpAggregate()])
    );

    activities.forEach(activity => {
      const jumpEvents = this.getJumpEvents(activity);

      if (jumpEvents.length > 0) {
        const eventAggregates = this.getJumpAggregatesFromEvents(jumpEvents);
        this.jumpStatFamilies.forEach(family => {
          const eventAggregate = eventAggregates.get(family.key)!;
          if (eventAggregate.count <= 0) {
            return;
          }

          const summaryAggregate = summaryAggregates.get(family.key)!;
          summaryAggregate.min = Math.min(summaryAggregate.min, eventAggregate.min);
          summaryAggregate.max = Math.max(summaryAggregate.max, eventAggregate.max);
          summaryAggregate.sum += eventAggregate.sum;
          summaryAggregate.count += eventAggregate.count;
        });
        return;
      }

      const jumpCount = this.getFiniteStatValue(activity, DataJumpCount.type);
      this.jumpStatFamilies.forEach(family => {
        const summaryAggregate = summaryAggregates.get(family.key)!;

        const minValue = this.getFiniteStatValue(activity, family.minType);
        if (minValue !== null) {
          summaryAggregate.min = Math.min(summaryAggregate.min, minValue);
        }

        const maxValue = this.getFiniteStatValue(activity, family.maxType);
        if (maxValue !== null) {
          summaryAggregate.max = Math.max(summaryAggregate.max, maxValue);
        }

        const avgValue = this.getFiniteStatValue(activity, family.avgType);
        if (avgValue !== null) {
          const weight = jumpCount !== null ? Math.max(0, jumpCount) : 1;
          summaryAggregate.sum += avgValue * weight;
          summaryAggregate.count += weight;
        }
      });
    });

    const stats: DataInterface[] = [];

    this.jumpStatFamilies.forEach(family => {
      const aggregate = summaryAggregates.get(family.key)!;

      if (aggregate.min !== Infinity) {
        stats.push(family.createMin(aggregate.min));
      }
      if (aggregate.max !== -Infinity) {
        stats.push(family.createMax(aggregate.max));
      }
      if (aggregate.count > 0) {
        stats.push(family.createAvg(aggregate.sum / aggregate.count));
      }
    });

    return stats;
  }

  private static getSummaryRunningDynamicsStatsForActivities(activities: ActivityInterface[]): DataInterface[] {
    const families: {
      avg: { type: string; new (value: number): DataInterface };
      min: { type: string; new (value: number): DataInterface };
      max: { type: string; new (value: number): DataInterface };
    }[] = [
      {
        avg: DataGroundContactTimePercentageAvg,
        min: DataGroundContactTimePercentageMin,
        max: DataGroundContactTimePercentageMax
      },
      { avg: DataRunningFlightTimeAvg, min: DataRunningFlightTimeMin, max: DataRunningFlightTimeMax },
      {
        avg: DataContactTimeToFlightTimeRatioAvg,
        min: DataContactTimeToFlightTimeRatioMin,
        max: DataContactTimeToFlightTimeRatioMax
      }
    ];
    const stats: DataInterface[] = [];

    families.forEach(family => {
      const averages = activities
        .map(activity => this.getFiniteStatValue(activity, family.avg.type))
        .filter((value): value is number => value !== null);
      const minima = activities
        .map(activity => this.getFiniteStatValue(activity, family.min.type))
        .filter((value): value is number => value !== null);
      const maxima = activities
        .map(activity => this.getFiniteStatValue(activity, family.max.type))
        .filter((value): value is number => value !== null);

      if (averages.length > 0) {
        stats.push(new family.avg(averages.reduce((sum, value) => sum + value, 0) / averages.length));
      }
      if (minima.length > 0) {
        stats.push(new family.min(Math.min(...minima)));
      }
      if (maxima.length > 0) {
        stats.push(new family.max(Math.max(...maxima)));
      }
    });

    return stats;
  }

  /**
   * Fills missing activity streams and summary stats, then derives canonical min/max/average and
   * speed-derived pace summaries for existing laps. Lap stream windows are half-open so an exact
   * shared boundary belongs to the next lap; a terminal lap includes the activity endpoint.
   * Calculated interval streams instead use wholly contained intervals for averages and extrema.
   * Laps beginning before this activity retain source summaries without deriving from partial leg streams.
   * Explicit stats are preserved except terrain summaries excluded for locally scoped Diving laps/activities
   * and calculated TSS excluded for Motorized, Adaptive Mobility, and Video Gaming activities.
   * Those activities retain valid nonnegative source-imported TSS, including legacy scores without a method.
   */
  public static generateMissingStreamsAndStatsForActivity(activity: ActivityInterface): void {
    this.invalidateCalculatedPower(activity);
    normalizeActivityMetricSemanticsForActivity(activity);
    this.generateMissingStreams(activity);
    this.fixAbnormalStreamData(activity);
    this.generateMissingStatsForActivity(activity);
    hydrateMissingSpeedDerivedStats(activity);
    activity.getLaps().forEach(lap => {
      const activityStart = activity.startDate.getTime();
      const activityEnd = activity.endDate.getTime();
      const lapStart = lap.startDate.getTime();
      const lapEnd = lap.endDate.getTime();
      // A lap beginning before its ending leg may span sports. This leg's
      // streams cannot supply a whole-lap average. Keep terminal clipping
      // unchanged for laps that start locally but have a later source end.
      if (lapStart < activityStart) {
        hydrateMissingSpeedDerivedStats(lap);
        return;
      }
      const includesActivityEndpoint = lapEnd >= activityEnd;
      const startIndex = Math.max(0, Math.ceil((lapStart - activityStart) / 1000));
      const endIndex = Math.max(
        0,
        includesActivityEndpoint
          ? activity.getDateIndex(activity.endDate) + 1
          : Math.ceil((lapEnd - activityStart) / 1000)
      );

      const lapPower = activity.hasStreamData(DataPower.type) ? powerIntervals(activity,
        (lapStart - activityStart) / 1000, (Math.min(lapEnd, activityEnd) - activityStart) / 1000) : null;
      addMissingStreamSummaryStats({
        activityType: activity.type,
        target: lap,
        readAverage: streamType => {
          if (streamType === DataPower.type) return lapPower?.coverage.observedAveragePowerWatts ?? null;
          const stream = activity.getAllStreams().find(item => item.type === streamType);
          return stream ? intervalAverage(stream, (lapStart - activityStart) / 1000,
            (Math.min(lapEnd, activityEnd) - activityStart) / 1000) : undefined;
        },
        readStream: streamType => {
          if (!activity.hasStreamData(streamType)) {
            return undefined;
          }
          const stream = activity.getStream(streamType);
          return intervalValues(stream, (lapStart - activityStart) / 1000, (Math.min(lapEnd, activityEnd) - activityStart) / 1000)
            ?? stream.getData().slice(startIndex, endIndex);
        }
      });
      hydrateMissingSpeedDerivedStats(lap);
    });
    const existingDurability = activity.getStat<DurabilityEvidenceValue>(DataDurabilityEvidence.type)?.getValue();
    const canonicalExistingDurability = normalizeDurabilityEvidenceValue(existingDurability);
    const hasSourceData = canonicalExistingDurability ? hasActivityDurabilitySourceData(activity) : false;
    const canReuseExistingDurability =
      fileActiveDuration.get(activity) !== null &&
      !!canonicalExistingDurability &&
      (!hasSourceData ||
        canonicalExistingDurability.sourceFingerprint === calculateActivityDurabilitySourceFingerprint(activity));
    const existingIsCanonical =
      !!canonicalExistingDurability &&
      JSON.stringify(existingDurability) === JSON.stringify(canonicalExistingDurability);

    if (!canReuseExistingDurability) {
      activity.removeStat(DataDurabilityEvidence.type);
      const durability = analyzeActivityDurability(activity, { includeTimeline: false }).summary;
      if (durability) {
        activity.addStat(new DataDurabilityEvidence(durability));
      }
    } else if (!existingIsCanonical) {
      activity.removeStat(DataDurabilityEvidence.type);
      activity.addStat(new DataDurabilityEvidence(canonicalExistingDurability));
    }

    this.generateMissingUnitStatsForActivity(activity); // Perhaps this needs to happen on user level so needs to go out of here
  }

  public static fixAbnormalStreamData(activity: ActivityInterface): void {
    // Check if fix abnormal speed option has been enable and if we have stream data and position data (e.g. do not fix for swim pool activities)
    if (
      activity.parseOptions?.streams?.fixAbnormal?.speed &&
      activity.hasStreamData(DataSpeed.type) &&
      activity.hasStreamData(DataLatitudeDegrees.type) &&
      activity.hasStreamData(DataLongitudeDegrees.type)
    ) {
      // Check for speed data dispersion using standard deviation
      const speedStdDev = standardDeviation(activity.getSquashedStreamData(DataSpeed.type));

      // Get speed standard deviation threshold at which we will attempt to fix the stream
      const stdDevThreshold =
        SPEED_STREAM_STD_DEV_THRESHOLD_MAP.get(ActivityTypesHelper.getActivityGroupForActivityType(activity.type)) ||
        SPEED_STREAM_STD_DEV_THRESHOLD_DEFAULT;

      if (speedStdDev > stdDevThreshold) {
        // Fix/Predict speed stream through Kalman filtering
        this.shapeStream(DataSpeed.type, activity, squashedSpeedData => {
          // Grade stream
          const SPEED_KALMAN_SMOOTHING = {
            R: 0.01, // Speed model calculation is something stable
            Q: speedStdDev * 2 // We intend to get a measurement error which can be under and over std dev (explaining the double factor)
          };

          // Apply kalman filter
          const kf = new KalmanFilter(SPEED_KALMAN_SMOOTHING);
          return squashedSpeedData.map(v => (v === null ? null : kf.filter(v)));
        });
      }
    }
  }

  public static generateMissingStreams(activity: ActivityInterface): void {
    // Compute missing streams
    this.generateMissingStreamsForActivity(activity);

    // Always include derived base streams (like Pace), but conditionally include unit variants
    const includeUnitVariants = !activity.parseOptions || activity.parseOptions.generateUnitStreams;

    activity.addStreams(
      this.createUnitStreamsFromStreams(activity.getAllStreams(), activity.type, undefined, {
        includeDerivedTypes: true, // Always include derived base types (Pace etc)
        includeUnitVariants
      })
    );
  }

  /** Aggregates child summaries; timer/elapsed/moving totals require finite nonnegative values on every leg. */
  public static getSummaryStatsForActivities(activities: ActivityInterface[]): DataInterface[] {
    const stats: DataInterface[] = [];
    // If only one
    if (activities.length === 1) {
      return activities[0]
        .getStatsAsArray()
        .filter(
          stat =>
            stat.getType() !== DataDurabilityEvidence.type && stat.getType() !== DataThreeDimensionalStrainEvidence.type
        );
    }

    const terrainSummaryActivities = activities.filter(
      activity => !ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activity.type)
    );

    let duration = 0;
    let ascent = 0;
    let descent = 0;
    let energy = 0;
    let distance = 0;
    let pauseTime = 0;
    let averageHeartRate = 0;
    let averagePower = 0;
    let averagePowerWattsPerKg = 0;
    let hasAveragePowerWattsPerKg = false;
    let averagePowerNormalized = 0;
    let hasAveragePowerNormalized = false;
    let averageCadence = 0;
    let averageStrokeRate = 0;
    let averageSpeed = 0;
    let averageGradeAdjustedSpeed = 0;
    let averagePace = 0;
    let averageEffortPace = 0;
    let averageGradeAdjustedPace = 0;
    let averageSwimPace = 0;
    let averageTemperature = 0;
    let averageAbsolutePressure = 0;
    let averageEVPE = 0;
    let hasAverageEVPE = false;
    let averageEHPE = 0;
    let hasAverageEHPE = false;
    let averageSatellite5BestSNR = 0;
    let hasAverageSatellite5BestSNR = false;
    let averageNumberOfSatellites = 0;
    let hasAverageNumberOfSatellites = false;
    let averageGrade = 0;
    let hasAverageGrade = false;
    let averageAirPower = 0;
    let averageVerticalSpeed = 0;
    let averageAltitude = 0;
    let averageLegStiffness = 0;
    let hasAverageLegStiffness = false;
    let averageVerticalRatio = 0;
    let hasAverageVerticalRatio = false;
    let averageVerticalOscillation = 0;
    let hasAverageVerticalOscillation = false;
    let averageFeeling = 0;
    let averageRPE = 0;

    // Sum Duration
    const durations = activities.map(activity => activity.getDuration()?.getValue());
    if (durations.every((value): value is number => typeof value === 'number' && Number.isFinite(value))) {
      duration = durations.reduce((sum, value) => sum + value, 0);
      stats.push(new DataDuration(duration));
    }

    // Keep independent clocks independent: never substitute elapsed time or dates for a missing timer.
    for (const TimeData of [DataTimerTime, DataElapsedTime]) {
      const values = activities.map(activity => activity.getStat(TimeData.type)?.getValue());
      if (
        activities.length > 0 &&
        values.every((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
      ) {
        const total = values.reduce((sum, value) => sum + value, 0);
        if (Number.isFinite(total)) stats.push(new TimeData(total));
      }
    }

    // Sum pause time
    const pauses = activities.map(activity => activity.getPause()?.getValue());
    if (pauses.every((value): value is number => typeof value === 'number' && Number.isFinite(value))) {
      pauseTime = pauses.reduce((sum, value) => sum + value, 0);
      stats.push(new DataPause(pauseTime));
    }

    // Sum Distance
    activities.forEach(activity => {
      distance += activity.getDistance().getValue();
    });
    stats.push(new DataDistance(distance));

    // Sum ascent
    if (terrainSummaryActivities.length > 0) {
      terrainSummaryActivities.forEach(activity => {
        const activityAscent = activity.getStat(DataAscent.type);
        if (activityAscent) {
          ascent += <number>activityAscent.getValue();
        }
      });
      stats.push(new DataAscent(ascent));
    }

    // Sum descent
    if (terrainSummaryActivities.length > 0) {
      terrainSummaryActivities.forEach(activity => {
        const activityDescent = activity.getStat(DataDescent.type);
        if (activityDescent) {
          descent += <number>activityDescent.getValue();
        }
      });
      stats.push(new DataDescent(descent));
    }

    // Sum energy
    activities.forEach(activity => {
      const activityEnergy = activity.getStat(DataEnergy.type);
      if (activityEnergy) {
        energy += <number>activityEnergy.getValue();
      }
    });
    stats.push(new DataEnergy(energy));

    // Avg Avg HR
    activities.forEach(activity => {
      const activityAvgHeartRate = activity.getStat(DataHeartRateAvg.type);
      if (activityAvgHeartRate) {
        // The below will fallback for 0
        averageHeartRate = averageHeartRate
          ? (averageHeartRate + <number>activityAvgHeartRate.getValue()) / 2
          : <number>activityAvgHeartRate.getValue();
      }
    });
    if (averageHeartRate) {
      stats.push(new DataHeartRateAvg(averageHeartRate));
    }

    // Avg Avg HR
    activities.forEach(activity => {
      const activityAvgHeartRate = activity.getStat(DataHeartRateAvg.type);
      if (activityAvgHeartRate) {
        // The below will fallback for 0
        averageHeartRate = averageHeartRate
          ? (averageHeartRate + <number>activityAvgHeartRate.getValue()) / 2
          : <number>activityAvgHeartRate.getValue();
      }
    });
    if (averageHeartRate) {
      stats.push(new DataHeartRateAvg(averageHeartRate));
    }

    // Avg Avg Power
    activities.forEach(activity => {
      const activityAvgPower = activity.getStat(DataPowerAvg.type);
      if (activityAvgPower) {
        // The below will fallback for 0
        averagePower = averagePower
          ? (averagePower + <number>activityAvgPower.getValue()) / 2
          : <number>activityAvgPower.getValue();
      }
    });
    if (averagePower) {
      stats.push(new DataPowerAvg(averagePower));
    }

    // Avg Avg Power-to-Weight ratio (W/kg)
    activities.forEach(activity => {
      const activityPowerWattsPerKg = this.resolvePowerWattsPerKg(activity);
      if (activityPowerWattsPerKg !== null) {
        averagePowerWattsPerKg = hasAveragePowerWattsPerKg
          ? (averagePowerWattsPerKg + activityPowerWattsPerKg) / 2
          : activityPowerWattsPerKg;
        hasAveragePowerWattsPerKg = true;
      }
    });
    if (hasAveragePowerWattsPerKg) {
      stats.push(new DataPowerWattsPerKg(averagePowerWattsPerKg));
    }

    // Avg Normalized Power
    activities.forEach(activity => {
      const activityPowerNormalized = activity.getStat(DataPowerNormalized.type);
      if (activityPowerNormalized) {
        averagePowerNormalized = hasAveragePowerNormalized
          ? (averagePowerNormalized + <number>activityPowerNormalized.getValue()) / 2
          : <number>activityPowerNormalized.getValue();
        hasAveragePowerNormalized = true;
      }
    });
    if (hasAveragePowerNormalized) {
      stats.push(new DataPowerNormalized(averagePowerNormalized));
    }

    // Avg Avg Cadence
    activities.forEach(activity => {
      const activityAvgCadence = activity.getStat(DataCadenceAvg.type);
      if (activityAvgCadence) {
        // The below will fallback for 0
        averageCadence = averageCadence
          ? (averageCadence + <number>activityAvgCadence.getValue()) / 2
          : <number>activityAvgCadence.getValue();
      }
    });
    if (averageCadence) {
      stats.push(new DataCadenceAvg(averageCadence));
    }

    // Avg Avg Stroke Rate
    activities.forEach(activity => {
      const activityAvgStrokeRate = activity.getStat(DataStrokeRateAvg.type);
      if (activityAvgStrokeRate) {
        // Preserve the existing event-summary averaging behavior used by cadence.
        averageStrokeRate = averageStrokeRate
          ? (averageStrokeRate + <number>activityAvgStrokeRate.getValue()) / 2
          : <number>activityAvgStrokeRate.getValue();
      }
    });
    if (averageStrokeRate) {
      stats.push(new DataStrokeRateAvg(averageStrokeRate));
    }

    // Avg Avg Speed
    activities.forEach(activity => {
      const activityAvgSpeed = activity.getStat(DataSpeedAvg.type);
      if (activityAvgSpeed) {
        // The below will fallback for 0
        averageSpeed = averageSpeed
          ? (averageSpeed + <number>activityAvgSpeed.getValue()) / 2
          : <number>activityAvgSpeed.getValue();
      }
    });
    if (averageSpeed) {
      stats.push(new DataSpeedAvg(averageSpeed));
    }

    // Avg Avg Gap Speed
    activities.forEach(activity => {
      const activityAvgGradeAdjustedSpeed = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (activityAvgGradeAdjustedSpeed) {
        // The below will fallback for 0
        averageGradeAdjustedSpeed = averageGradeAdjustedSpeed
          ? (averageGradeAdjustedSpeed + <number>activityAvgGradeAdjustedSpeed.getValue()) / 2
          : <number>activityAvgGradeAdjustedSpeed.getValue();
      }
    });
    if (averageGradeAdjustedSpeed) {
      stats.push(new DataGradeAdjustedSpeedAvg(averageGradeAdjustedSpeed));
    }

    // Avg Avg Pace
    activities.forEach(activity => {
      const activityAvgPace = activity.getStat(DataPaceAvg.type);
      if (activityAvgPace) {
        // The below will fallback for 0
        averagePace = averagePace
          ? (averagePace + <number>activityAvgPace.getValue()) / 2
          : <number>activityAvgPace.getValue();
      }
    });
    if (averagePace) {
      stats.push(new DataPaceAvg(averagePace));
    }

    // Avg Avg Effort Pace
    activities.forEach(activity => {
      const activityAvgEffortPace = activity.getStat(DataEffortPaceAvg.type);
      if (activityAvgEffortPace) {
        // The below will fallback for 0
        averageEffortPace = averageEffortPace
          ? (averageEffortPace + <number>activityAvgEffortPace.getValue()) / 2
          : <number>activityAvgEffortPace.getValue();
      }
    });
    if (averageEffortPace) {
      stats.push(new DataEffortPaceAvg(averageEffortPace));
    }

    // Avg Avg GAP Pace
    activities.forEach(activity => {
      const activityAvgGradeAdjustedPace = activity.getStat(DataGradeAdjustedPaceAvg.type);
      if (activityAvgGradeAdjustedPace) {
        // The below will fallback for 0
        averageGradeAdjustedPace = averageGradeAdjustedPace
          ? (averageGradeAdjustedPace + <number>activityAvgGradeAdjustedPace.getValue()) / 2
          : <number>activityAvgGradeAdjustedPace.getValue();
      }
    });
    if (averageGradeAdjustedPace) {
      stats.push(new DataGradeAdjustedPaceAvg(averageGradeAdjustedPace));
    }

    // Avg Avg SwimPace
    activities.forEach(activity => {
      const activityAvgSwimPace = activity.getStat(DataSwimPaceAvg.type);
      if (activityAvgSwimPace) {
        // The below will fallback for 0
        averageSwimPace = averageSwimPace
          ? (averageSwimPace + <number>activityAvgSwimPace.getValue()) / 2
          : <number>activityAvgSwimPace.getValue();
      }
    });
    if (averageSwimPace) {
      stats.push(new DataSwimPaceAvg(averageSwimPace));
    }

    // Avg Avg Temperature
    activities.forEach(activity => {
      const activityAvgTemperature = activity.getStat(DataTemperatureAvg.type);
      if (activityAvgTemperature) {
        // The below will fallback for 0
        averageTemperature = averageTemperature
          ? (averageTemperature + <number>activityAvgTemperature.getValue()) / 2
          : <number>activityAvgTemperature.getValue();
      }
    });
    if (averageTemperature) {
      stats.push(new DataTemperatureAvg(averageTemperature));
    }

    // Avg Avg Absolute Pressure
    activities.forEach(activity => {
      const activityAvgAbsolutePressure = activity.getStat(DataAbsolutePressureAvg.type);
      if (activityAvgAbsolutePressure) {
        averageAbsolutePressure = averageAbsolutePressure
          ? (averageAbsolutePressure + <number>activityAvgAbsolutePressure.getValue()) / 2
          : <number>activityAvgAbsolutePressure.getValue();
      }
    });
    if (averageAbsolutePressure) {
      stats.push(new DataAbsolutePressureAvg(averageAbsolutePressure));
    }

    // Avg Avg EVPE
    activities.forEach(activity => {
      const activityAvgEVPE = activity.getStat(DataEVPEAvg.type);
      if (activityAvgEVPE) {
        averageEVPE = hasAverageEVPE
          ? (averageEVPE + <number>activityAvgEVPE.getValue()) / 2
          : <number>activityAvgEVPE.getValue();
        hasAverageEVPE = true;
      }
    });
    if (hasAverageEVPE) {
      stats.push(new DataEVPEAvg(averageEVPE));
    }

    // Avg Avg EHPE
    activities.forEach(activity => {
      const activityAvgEHPE = activity.getStat(DataEHPEAvg.type);
      if (activityAvgEHPE) {
        averageEHPE = hasAverageEHPE
          ? (averageEHPE + <number>activityAvgEHPE.getValue()) / 2
          : <number>activityAvgEHPE.getValue();
        hasAverageEHPE = true;
      }
    });
    if (hasAverageEHPE) {
      stats.push(new DataEHPEAvg(averageEHPE));
    }

    // Avg Avg Satellite 5 Best SNR
    activities.forEach(activity => {
      const activityAvgSatellite5BestSNR = activity.getStat(DataSatellite5BestSNRAvg.type);
      if (activityAvgSatellite5BestSNR) {
        averageSatellite5BestSNR = hasAverageSatellite5BestSNR
          ? (averageSatellite5BestSNR + <number>activityAvgSatellite5BestSNR.getValue()) / 2
          : <number>activityAvgSatellite5BestSNR.getValue();
        hasAverageSatellite5BestSNR = true;
      }
    });
    if (hasAverageSatellite5BestSNR) {
      stats.push(new DataSatellite5BestSNRAvg(averageSatellite5BestSNR));
    }

    // Avg Avg Number of Satellites
    activities.forEach(activity => {
      const activityAvgNumberOfSatellites = activity.getStat(DataNumberOfSatellitesAvg.type);
      if (activityAvgNumberOfSatellites) {
        averageNumberOfSatellites = hasAverageNumberOfSatellites
          ? (averageNumberOfSatellites + <number>activityAvgNumberOfSatellites.getValue()) / 2
          : <number>activityAvgNumberOfSatellites.getValue();
        hasAverageNumberOfSatellites = true;
      }
    });
    if (hasAverageNumberOfSatellites) {
      stats.push(new DataNumberOfSatellitesAvg(averageNumberOfSatellites));
    }

    // Avg Grade
    terrainSummaryActivities.forEach(activity => {
      const activityAvgGrade = activity.getStat(DataGradeAvg.type);
      if (activityAvgGrade) {
        averageGrade = hasAverageGrade
          ? (averageGrade + <number>activityAvgGrade.getValue()) / 2
          : <number>activityAvgGrade.getValue();
        hasAverageGrade = true;
      }
    });
    if (hasAverageGrade) {
      stats.push(new DataGradeAvg(averageGrade));
    }

    // Avg Avg Air Power
    activities.forEach(activity => {
      const activityAvgAirPower = activity.getStat(DataAirPowerAvg.type);
      if (activityAvgAirPower) {
        averageAirPower = averageAirPower
          ? (averageAirPower + <number>activityAvgAirPower.getValue()) / 2
          : <number>activityAvgAirPower.getValue();
      }
    });
    if (averageAirPower) {
      stats.push(new DataAirPowerAvg(averageAirPower));
    }

    // Avg Avg Vertical Speed
    activities.forEach(activity => {
      const activityAvgVerticalSpeed = activity.getStat(DataVerticalSpeedAvg.type);
      if (activityAvgVerticalSpeed) {
        averageVerticalSpeed = averageVerticalSpeed
          ? (averageVerticalSpeed + <number>activityAvgVerticalSpeed.getValue()) / 2
          : <number>activityAvgVerticalSpeed.getValue();
      }
    });
    if (averageVerticalSpeed) {
      stats.push(new DataVerticalSpeedAvg(averageVerticalSpeed));
    }

    // Avg Avg Altitude
    terrainSummaryActivities.forEach(activity => {
      const activityAvgAltitude = activity.getStat(DataAltitudeAvg.type);
      if (activityAvgAltitude) {
        averageAltitude = averageAltitude
          ? (averageAltitude + <number>activityAvgAltitude.getValue()) / 2
          : <number>activityAvgAltitude.getValue();
      }
    });
    if (averageAltitude) {
      stats.push(new DataAltitudeAvg(averageAltitude));
    }

    // Avg Avg Leg Stiffness
    activities.forEach(activity => {
      const activityAvgLegStiffness = activity.getStat(DataLegStiffnessAvg.type);
      if (activityAvgLegStiffness) {
        averageLegStiffness = hasAverageLegStiffness
          ? (averageLegStiffness + <number>activityAvgLegStiffness.getValue()) / 2
          : <number>activityAvgLegStiffness.getValue();
        hasAverageLegStiffness = true;
      }
    });
    if (hasAverageLegStiffness) {
      stats.push(new DataLegStiffnessAvg(averageLegStiffness));
    }

    // Avg Avg Vertical Ratio
    activities.forEach(activity => {
      const activityAvgVerticalRatio = activity.getStat(DataVerticalRatioAvg.type);
      if (activityAvgVerticalRatio) {
        averageVerticalRatio = hasAverageVerticalRatio
          ? (averageVerticalRatio + <number>activityAvgVerticalRatio.getValue()) / 2
          : <number>activityAvgVerticalRatio.getValue();
        hasAverageVerticalRatio = true;
      }
    });
    if (hasAverageVerticalRatio) {
      stats.push(new DataVerticalRatioAvg(averageVerticalRatio));
    }

    // Avg Feeling
    activities.forEach(activity => {
      const activityAvgFeeling = activity.getStat(DataFeeling.type);
      if (activityAvgFeeling) {
        // The below will fallback for 0
        averageFeeling = averageFeeling
          ? Math.ceil((averageFeeling + <number>activityAvgFeeling.getValue()) / 2)
          : <number>activityAvgFeeling.getValue();
      }
    });
    if (averageFeeling) {
      stats.push(new DataFeeling(averageFeeling));
    }

    // Avg RPE
    activities.forEach(activity => {
      const activityAvgRPE = activity.getStat(DataRPE.type);
      if (activityAvgRPE) {
        // The below will fallback for 0
        averageRPE = averageRPE
          ? Math.ceil((averageRPE + <number>activityAvgRPE.getValue()) / 2)
          : <number>activityAvgRPE.getValue();
      }
    });
    if (averageRPE) {
      stats.push(new DataRPE(averageRPE));
    }

    // Max VO2 Max
    let maxVO2Max = 0;
    activities.forEach(activity => {
      const activityVO2Max = activity.getStat(DataVO2Max.type);
      if (activityVO2Max) {
        maxVO2Max = Math.max(maxVO2Max, <number>activityVO2Max.getValue());
      }
    });
    if (maxVO2Max) {
      stats.push(new DataVO2Max(maxVO2Max));
    }

    // A partial sum is not a whole-workout moving time. Explicit stationary zero is valid.
    const movingTimes = activities.map(activity => activity.getStat(DataMovingTime.type)?.getValue());
    if (activities.length > 0 && movingTimes.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0) &&
      activities.every(activity => Number.isFinite(activity.getDuration()?.getValue()))) {
      stats.push(new DataMovingTime((movingTimes as number[]).reduce((sum, value) => sum + value, 0)));
    }

    // Sum Total Grit
    let totalGrit = 0;
    activities.forEach(activity => {
      const activityTotalGrit = activity.getStat(DataTotalGrit.type);
      if (activityTotalGrit) {
        totalGrit += <number>activityTotalGrit.getValue();
      }
    });
    if (totalGrit) {
      stats.push(new DataTotalGrit(totalGrit));
    }

    // Sum Total Flow
    let totalFlow = 0;
    activities.forEach(activity => {
      const activityTotalFlow = activity.getStat(DataTotalFlow.type);
      if (activityTotalFlow) {
        totalFlow += <number>activityTotalFlow.getValue();
      }
    });
    if (totalFlow) {
      stats.push(new DataTotalFlow(totalFlow));
    }

    // Sum Jump Count
    let jumpCount = 0;
    activities.forEach(activity => {
      const activityJumpCount = activity.getStat(DataJumpCount.type);
      if (activityJumpCount) {
        jumpCount += <number>activityJumpCount.getValue();
      }
    });
    if (jumpCount) {
      stats.push(new DataJumpCount(jumpCount));
    }

    this.getSummaryJumpStatsForActivities(activities).forEach(stat => stats.push(stat));

    // Max Heart Rate
    let maxHeartRate = 0;
    activities.forEach(activity => {
      const activityMaxHeartRate = activity.getStat(DataHeartRateMax.type);
      if (activityMaxHeartRate) {
        maxHeartRate = Math.max(maxHeartRate, <number>activityMaxHeartRate.getValue());
      }
    });
    if (maxHeartRate) {
      stats.push(new DataHeartRateMax(maxHeartRate));
    }

    // Min Heart Rate
    let minHeartRate: number | null = null;
    activities.forEach(activity => {
      const activityMinHeartRate = activity.getStat(DataHeartRateMin.type);
      if (activityMinHeartRate) {
        const val = <number>activityMinHeartRate.getValue();
        minHeartRate = minHeartRate === null ? val : Math.min(minHeartRate, val);
      }
    });
    if (minHeartRate !== null) {
      stats.push(new DataHeartRateMin(minHeartRate));
    }

    // Max Power
    let maxPower = 0;
    activities.forEach(activity => {
      const activityMaxPower = activity.getStat(DataPowerMax.type);
      if (activityMaxPower) {
        maxPower = Math.max(maxPower, <number>activityMaxPower.getValue());
      }
    });
    if (maxPower) {
      stats.push(new DataPowerMax(maxPower));
    }

    // Min Power
    let minPower: number | null = null;
    activities.forEach(activity => {
      const activityMinPower = activity.getStat(DataPowerMin.type);
      if (activityMinPower) {
        const val = <number>activityMinPower.getValue();
        minPower = minPower === null ? val : Math.min(minPower, val);
      }
    });
    if (minPower !== null) {
      stats.push(new DataPowerMin(minPower));
    }

    // Max Speed
    let maxSpeed = 0;
    activities.forEach(activity => {
      const activityMaxSpeed = activity.getStat(DataSpeedMax.type);
      if (activityMaxSpeed) {
        maxSpeed = Math.max(maxSpeed, <number>activityMaxSpeed.getValue());
      }
    });
    if (maxSpeed) {
      stats.push(new DataSpeedMax(maxSpeed));
    }

    // Min Speed
    let minSpeed: number | null = null;
    activities.forEach(activity => {
      const activityMinSpeed = activity.getStat(DataSpeedMin.type);
      if (activityMinSpeed) {
        const val = <number>activityMinSpeed.getValue();
        minSpeed = minSpeed === null ? val : Math.min(minSpeed, val);
      }
    });
    if (minSpeed !== null) {
      stats.push(new DataSpeedMin(minSpeed));
    }

    // Max Cadence
    let maxCadence = 0;
    activities.forEach(activity => {
      const activityMaxCadence = activity.getStat(DataCadenceMax.type);
      if (activityMaxCadence) {
        maxCadence = Math.max(maxCadence, <number>activityMaxCadence.getValue());
      }
    });
    if (maxCadence) {
      stats.push(new DataCadenceMax(maxCadence));
    }

    // Min Cadence
    let minCadence: number | null = null;
    activities.forEach(activity => {
      const activityMinCadence = activity.getStat(DataCadenceMin.type);
      if (activityMinCadence) {
        const val = <number>activityMinCadence.getValue();
        minCadence = minCadence === null ? val : Math.min(minCadence, val);
      }
    });
    if (minCadence !== null) {
      stats.push(new DataCadenceMin(minCadence));
    }

    // Max Stroke Rate
    let maxStrokeRate = 0;
    activities.forEach(activity => {
      const activityMaxStrokeRate = activity.getStat(DataStrokeRateMax.type);
      if (activityMaxStrokeRate) {
        maxStrokeRate = Math.max(maxStrokeRate, <number>activityMaxStrokeRate.getValue());
      }
    });
    if (maxStrokeRate) {
      stats.push(new DataStrokeRateMax(maxStrokeRate));
    }

    // Min Stroke Rate
    let minStrokeRate: number | null = null;
    activities.forEach(activity => {
      const activityMinStrokeRate = activity.getStat(DataStrokeRateMin.type);
      if (activityMinStrokeRate) {
        const val = <number>activityMinStrokeRate.getValue();
        minStrokeRate = minStrokeRate === null ? val : Math.min(minStrokeRate, val);
      }
    });
    if (minStrokeRate !== null) {
      stats.push(new DataStrokeRateMin(minStrokeRate));
    }

    // Max Altitude
    let maxAltitude = -Infinity;
    terrainSummaryActivities.forEach(activity => {
      const activityMaxAltitude = activity.getStat(DataAltitudeMax.type);
      if (activityMaxAltitude) {
        maxAltitude = Math.max(maxAltitude, <number>activityMaxAltitude.getValue());
      }
    });
    if (maxAltitude !== -Infinity) {
      stats.push(new DataAltitudeMax(maxAltitude));
    }

    // Min Altitude
    let minAltitude = Infinity;
    terrainSummaryActivities.forEach(activity => {
      const activityMinAltitude = activity.getStat(DataAltitudeMin.type);
      if (activityMinAltitude) {
        minAltitude = Math.min(minAltitude, <number>activityMinAltitude.getValue());
      }
    });
    if (minAltitude !== Infinity) {
      stats.push(new DataAltitudeMin(minAltitude));
    }

    // Max Temperature
    let maxTemperature = -Infinity;
    activities.forEach(activity => {
      const activityMaxTemperature = activity.getStat(DataTemperatureMax.type);
      if (activityMaxTemperature) {
        maxTemperature = Math.max(maxTemperature, <number>activityMaxTemperature.getValue());
      }
    });
    if (maxTemperature !== -Infinity) {
      stats.push(new DataTemperatureMax(maxTemperature));
    }

    // Min Temperature
    let minTemperature = Infinity;
    activities.forEach(activity => {
      const activityMinTemperature = activity.getStat(DataTemperatureMin.type);
      if (activityMinTemperature) {
        minTemperature = Math.min(minTemperature, <number>activityMinTemperature.getValue());
      }
    });
    if (minTemperature !== Infinity) {
      stats.push(new DataTemperatureMin(minTemperature));
    }

    // Max Air Power
    let maxAirPower = -Infinity;
    activities.forEach(activity => {
      const activityMaxAirPower = activity.getStat(DataAirPowerMax.type);
      if (activityMaxAirPower) {
        maxAirPower = Math.max(maxAirPower, <number>activityMaxAirPower.getValue());
      }
    });
    if (maxAirPower !== -Infinity) {
      stats.push(new DataAirPowerMax(maxAirPower));
    }

    // Min Air Power
    let minAirPower = Infinity;
    activities.forEach(activity => {
      const activityMinAirPower = activity.getStat(DataAirPowerMin.type);
      if (activityMinAirPower) {
        minAirPower = Math.min(minAirPower, <number>activityMinAirPower.getValue());
      }
    });
    if (minAirPower !== Infinity) {
      stats.push(new DataAirPowerMin(minAirPower));
    }

    // Max Vertical Speed
    let maxVerticalSpeed = -Infinity;
    activities.forEach(activity => {
      const activityMaxVerticalSpeed = activity.getStat(DataVerticalSpeedMax.type);
      if (activityMaxVerticalSpeed) {
        maxVerticalSpeed = Math.max(maxVerticalSpeed, <number>activityMaxVerticalSpeed.getValue());
      }
    });
    if (maxVerticalSpeed !== -Infinity) {
      stats.push(new DataVerticalSpeedMax(maxVerticalSpeed));
    }

    // Min Vertical Speed
    let minVerticalSpeed = Infinity;
    activities.forEach(activity => {
      const activityMinVerticalSpeed = activity.getStat(DataVerticalSpeedMin.type);
      if (activityMinVerticalSpeed) {
        minVerticalSpeed = Math.min(minVerticalSpeed, <number>activityMinVerticalSpeed.getValue());
      }
    });
    if (minVerticalSpeed !== Infinity) {
      stats.push(new DataVerticalSpeedMin(minVerticalSpeed));
    }

    // Max Ground Contact Time
    let maxGroundContactTime = -Infinity;
    activities.forEach(activity => {
      const activityMaxGroundContactTime = activity.getStat(DataGroundContactTimeMax.type);
      if (activityMaxGroundContactTime) {
        maxGroundContactTime = Math.max(maxGroundContactTime, <number>activityMaxGroundContactTime.getValue());
      }
    });
    if (maxGroundContactTime !== -Infinity) {
      stats.push(new DataGroundContactTimeMax(maxGroundContactTime));
    }

    // Min Ground Contact Time
    let minGroundContactTime = Infinity;
    activities.forEach(activity => {
      const activityMinGroundContactTime = activity.getStat(DataGroundContactTimeMin.type);
      if (activityMinGroundContactTime) {
        minGroundContactTime = Math.min(minGroundContactTime, <number>activityMinGroundContactTime.getValue());
      }
    });
    if (minGroundContactTime !== Infinity) {
      stats.push(new DataGroundContactTimeMin(minGroundContactTime));
    }

    // Max Vertical Oscillation
    let maxVerticalOscillation = -Infinity;
    activities.forEach(activity => {
      const activityMaxVerticalOscillation = activity.getStat(DataVerticalOscillationMax.type);
      if (activityMaxVerticalOscillation) {
        maxVerticalOscillation = Math.max(maxVerticalOscillation, <number>activityMaxVerticalOscillation.getValue());
      }
    });
    if (maxVerticalOscillation !== -Infinity) {
      stats.push(new DataVerticalOscillationMax(maxVerticalOscillation));
    }

    // Min Vertical Oscillation
    let minVerticalOscillation = Infinity;
    activities.forEach(activity => {
      const activityMinVerticalOscillation = activity.getStat(DataVerticalOscillationMin.type);
      if (activityMinVerticalOscillation) {
        minVerticalOscillation = Math.min(minVerticalOscillation, <number>activityMinVerticalOscillation.getValue());
      }
    });
    if (minVerticalOscillation !== Infinity) {
      stats.push(new DataVerticalOscillationMin(minVerticalOscillation));
    }

    // Max Leg Stiffness
    let maxLegStiffness = -Infinity;
    activities.forEach(activity => {
      const activityMaxLegStiffness = activity.getStat(DataLegStiffnessMax.type);
      if (activityMaxLegStiffness) {
        maxLegStiffness = Math.max(maxLegStiffness, <number>activityMaxLegStiffness.getValue());
      }
    });
    if (maxLegStiffness !== -Infinity) {
      stats.push(new DataLegStiffnessMax(maxLegStiffness));
    }

    // Min Leg Stiffness
    let minLegStiffness = Infinity;
    activities.forEach(activity => {
      const activityMinLegStiffness = activity.getStat(DataLegStiffnessMin.type);
      if (activityMinLegStiffness) {
        minLegStiffness = Math.min(minLegStiffness, <number>activityMinLegStiffness.getValue());
      }
    });
    if (minLegStiffness !== Infinity) {
      stats.push(new DataLegStiffnessMin(minLegStiffness));
    }

    // Max Vertical Ratio
    let maxVerticalRatio = -Infinity;
    activities.forEach(activity => {
      const activityMaxVerticalRatio = activity.getStat(DataVerticalRatioMax.type);
      if (activityMaxVerticalRatio) {
        maxVerticalRatio = Math.max(maxVerticalRatio, <number>activityMaxVerticalRatio.getValue());
      }
    });
    if (maxVerticalRatio !== -Infinity) {
      stats.push(new DataVerticalRatioMax(maxVerticalRatio));
    }

    // Min Vertical Ratio
    let minVerticalRatio = Infinity;
    activities.forEach(activity => {
      const activityMinVerticalRatio = activity.getStat(DataVerticalRatioMin.type);
      if (activityMinVerticalRatio) {
        minVerticalRatio = Math.min(minVerticalRatio, <number>activityMinVerticalRatio.getValue());
      }
    });
    if (minVerticalRatio !== Infinity) {
      stats.push(new DataVerticalRatioMin(minVerticalRatio));
    }

    // Max Pace
    let maxPace = -Infinity;
    activities.forEach(activity => {
      const activityMaxPace = activity.getStat(DataPaceMax.type);
      if (activityMaxPace) {
        maxPace = Math.max(maxPace, <number>activityMaxPace.getValue());
      }
    });
    if (maxPace !== -Infinity) {
      stats.push(new DataPaceMax(maxPace));
    }

    // Min Pace
    let minPace = Infinity;
    activities.forEach(activity => {
      const activityMinPace = activity.getStat(DataPaceMin.type);
      if (activityMinPace) {
        const value = Number(activityMinPace.getValue());
        if (Number.isFinite(value)) {
          minPace = Math.min(minPace, value);
        }
      }
    });
    if (minPace !== Infinity) {
      stats.push(new DataPaceMin(minPace));
    }

    // Max Effort Pace
    let maxEffortPace = -Infinity;
    activities.forEach(activity => {
      const activityMaxEffortPace = activity.getStat(DataEffortPaceMax.type);
      if (activityMaxEffortPace) {
        maxEffortPace = Math.max(maxEffortPace, <number>activityMaxEffortPace.getValue());
      }
    });
    if (maxEffortPace !== -Infinity) {
      stats.push(new DataEffortPaceMax(maxEffortPace));
    }

    // Min Effort Pace
    let minEffortPace = Infinity;
    activities.forEach(activity => {
      const activityMinEffortPace = activity.getStat(DataEffortPaceMin.type);
      if (activityMinEffortPace) {
        const value = Number(activityMinEffortPace.getValue());
        if (Number.isFinite(value)) {
          minEffortPace = Math.min(minEffortPace, value);
        }
      }
    });
    if (minEffortPace !== Infinity) {
      stats.push(new DataEffortPaceMin(minEffortPace));
    }

    // Max Grade Adjusted Pace
    let maxGradeAdjustedPace = -Infinity;
    activities.forEach(activity => {
      const activityMaxGradeAdjustedPace = activity.getStat(DataGradeAdjustedPaceMax.type);
      if (activityMaxGradeAdjustedPace) {
        maxGradeAdjustedPace = Math.max(maxGradeAdjustedPace, <number>activityMaxGradeAdjustedPace.getValue());
      }
    });
    if (maxGradeAdjustedPace !== -Infinity) {
      stats.push(new DataGradeAdjustedPaceMax(maxGradeAdjustedPace));
    }

    // Min Grade Adjusted Pace
    let minGradeAdjustedPace = Infinity;
    activities.forEach(activity => {
      const activityMinGradeAdjustedPace = activity.getStat(DataGradeAdjustedPaceMin.type);
      if (activityMinGradeAdjustedPace) {
        const value = Number(activityMinGradeAdjustedPace.getValue());
        if (Number.isFinite(value)) {
          minGradeAdjustedPace = Math.min(minGradeAdjustedPace, value);
        }
      }
    });
    if (minGradeAdjustedPace !== Infinity) {
      stats.push(new DataGradeAdjustedPaceMin(minGradeAdjustedPace));
    }

    // Max Swim Pace
    let maxSwimPace = -Infinity;
    activities.forEach(activity => {
      const activityMaxSwimPace = activity.getStat(DataSwimPaceMax.type);
      if (activityMaxSwimPace) {
        maxSwimPace = Math.max(maxSwimPace, <number>activityMaxSwimPace.getValue());
      }
    });
    if (maxSwimPace !== -Infinity) {
      stats.push(new DataSwimPaceMax(maxSwimPace));
    }

    // Min Swim Pace
    let minSwimPace = Infinity;
    activities.forEach(activity => {
      const activityMinSwimPace = activity.getStat(DataSwimPaceMin.type);
      if (activityMinSwimPace) {
        const value = Number(activityMinSwimPace.getValue());
        if (Number.isFinite(value)) {
          minSwimPace = Math.min(minSwimPace, value);
        }
      }
    });
    if (minSwimPace !== Infinity) {
      stats.push(new DataSwimPaceMin(minSwimPace));
    }

    // Max Grade Adjusted Speed
    let maxGradeAdjustedSpeed = -Infinity;
    activities.forEach(activity => {
      const activityMaxGradeAdjustedSpeed = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (activityMaxGradeAdjustedSpeed) {
        maxGradeAdjustedSpeed = Math.max(maxGradeAdjustedSpeed, <number>activityMaxGradeAdjustedSpeed.getValue());
      }
    });
    if (maxGradeAdjustedSpeed !== -Infinity) {
      stats.push(new DataGradeAdjustedSpeedMax(maxGradeAdjustedSpeed));
    }

    // Min Grade Adjusted Speed
    let minGradeAdjustedSpeed = Infinity;
    activities.forEach(activity => {
      const activityMinGradeAdjustedSpeed = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (activityMinGradeAdjustedSpeed) {
        minGradeAdjustedSpeed = Math.min(minGradeAdjustedSpeed, <number>activityMinGradeAdjustedSpeed.getValue());
      }
    });
    if (minGradeAdjustedSpeed !== Infinity) {
      stats.push(new DataGradeAdjustedSpeedMin(minGradeAdjustedSpeed));
    }

    // Max Grade
    let maxGrade = -Infinity;
    terrainSummaryActivities.forEach(activity => {
      const activityMaxGrade = activity.getStat(DataGradeMax.type);
      if (activityMaxGrade) {
        maxGrade = Math.max(maxGrade, <number>activityMaxGrade.getValue());
      }
    });
    if (maxGrade !== -Infinity) {
      stats.push(new DataGradeMax(maxGrade));
    }

    // Min Grade
    let minGrade = Infinity;
    terrainSummaryActivities.forEach(activity => {
      const activityMinGrade = activity.getStat(DataGradeMin.type);
      if (activityMinGrade) {
        minGrade = Math.min(minGrade, <number>activityMinGrade.getValue());
      }
    });
    if (minGrade !== Infinity) {
      stats.push(new DataGradeMin(minGrade));
    }

    // Max Absolute Pressure
    let maxAbsolutePressure = -Infinity;
    activities.forEach(activity => {
      const activityMaxAbsolutePressure = activity.getStat(DataAbsolutePressureMax.type);
      if (activityMaxAbsolutePressure) {
        maxAbsolutePressure = Math.max(maxAbsolutePressure, <number>activityMaxAbsolutePressure.getValue());
      }
    });
    if (maxAbsolutePressure !== -Infinity) {
      stats.push(new DataAbsolutePressureMax(maxAbsolutePressure));
    }

    // Min Absolute Pressure
    let minAbsolutePressure = Infinity;
    activities.forEach(activity => {
      const activityMinAbsolutePressure = activity.getStat(DataAbsolutePressureMin.type);
      if (activityMinAbsolutePressure) {
        minAbsolutePressure = Math.min(minAbsolutePressure, <number>activityMinAbsolutePressure.getValue());
      }
    });
    if (minAbsolutePressure !== Infinity) {
      stats.push(new DataAbsolutePressureMin(minAbsolutePressure));
    }

    // Max EVPE
    let maxEVPE = -Infinity;
    activities.forEach(activity => {
      const activityMaxEVPE = activity.getStat(DataEVPEMax.type);
      if (activityMaxEVPE) {
        maxEVPE = Math.max(maxEVPE, <number>activityMaxEVPE.getValue());
      }
    });
    if (maxEVPE !== -Infinity) {
      stats.push(new DataEVPEMax(maxEVPE));
    }

    // Min EVPE
    let minEVPE = Infinity;
    activities.forEach(activity => {
      const activityMinEVPE = activity.getStat(DataEVPEMin.type);
      if (activityMinEVPE) {
        minEVPE = Math.min(minEVPE, <number>activityMinEVPE.getValue());
      }
    });
    if (minEVPE !== Infinity) {
      stats.push(new DataEVPEMin(minEVPE));
    }

    // Max EHPE
    let maxEHPE = -Infinity;
    activities.forEach(activity => {
      const activityMaxEHPE = activity.getStat(DataEHPEMax.type);
      if (activityMaxEHPE) {
        maxEHPE = Math.max(maxEHPE, <number>activityMaxEHPE.getValue());
      }
    });
    if (maxEHPE !== -Infinity) {
      stats.push(new DataEHPEMax(maxEHPE));
    }

    // Min EHPE
    let minEHPE = Infinity;
    activities.forEach(activity => {
      const activityMinEHPE = activity.getStat(DataEHPEMin.type);
      if (activityMinEHPE) {
        minEHPE = Math.min(minEHPE, <number>activityMinEHPE.getValue());
      }
    });
    if (minEHPE !== Infinity) {
      stats.push(new DataEHPEMin(minEHPE));
    }

    // Max Satellite 5 Best SNR
    let maxSatellite5BestSNR = -Infinity;
    activities.forEach(activity => {
      const activityMaxSatellite5BestSNR = activity.getStat(DataSatellite5BestSNRMax.type);
      if (activityMaxSatellite5BestSNR) {
        maxSatellite5BestSNR = Math.max(maxSatellite5BestSNR, <number>activityMaxSatellite5BestSNR.getValue());
      }
    });
    if (maxSatellite5BestSNR !== -Infinity) {
      stats.push(new DataSatellite5BestSNRMax(maxSatellite5BestSNR));
    }

    // Min Satellite 5 Best SNR
    let minSatellite5BestSNR = Infinity;
    activities.forEach(activity => {
      const activityMinSatellite5BestSNR = activity.getStat(DataSatellite5BestSNRMin.type);
      if (activityMinSatellite5BestSNR) {
        minSatellite5BestSNR = Math.min(minSatellite5BestSNR, <number>activityMinSatellite5BestSNR.getValue());
      }
    });
    if (minSatellite5BestSNR !== Infinity) {
      stats.push(new DataSatellite5BestSNRMin(minSatellite5BestSNR));
    }

    // Max Number of Satellites
    let maxNumberOfSatellites = -Infinity;
    activities.forEach(activity => {
      const activityMaxNumberOfSatellites = activity.getStat(DataNumberOfSatellitesMax.type);
      if (activityMaxNumberOfSatellites) {
        maxNumberOfSatellites = Math.max(maxNumberOfSatellites, <number>activityMaxNumberOfSatellites.getValue());
      }
    });
    if (maxNumberOfSatellites !== -Infinity) {
      stats.push(new DataNumberOfSatellitesMax(maxNumberOfSatellites));
    }

    // Min Number of Satellites
    let minNumberOfSatellites = Infinity;
    activities.forEach(activity => {
      const activityMinNumberOfSatellites = activity.getStat(DataNumberOfSatellitesMin.type);
      if (activityMinNumberOfSatellites) {
        minNumberOfSatellites = Math.min(minNumberOfSatellites, <number>activityMinNumberOfSatellites.getValue());
      }
    });
    if (minNumberOfSatellites !== Infinity) {
      stats.push(new DataNumberOfSatellitesMin(minNumberOfSatellites));
    }

    // Avg Ground Contact Time
    let averageGroundContactTime = 0;
    activities.forEach(activity => {
      const activityGCT = activity.getStat(DataGroundContactTimeAvg.type);
      if (activityGCT) {
        averageGroundContactTime = averageGroundContactTime
          ? (averageGroundContactTime + <number>activityGCT.getValue()) / 2
          : <number>activityGCT.getValue();
      }
    });
    if (averageGroundContactTime) {
      stats.push(new DataGroundContactTimeAvg(averageGroundContactTime));
    }

    // Avg Vertical Oscillation
    activities.forEach(activity => {
      const activityVerticalOscillation = activity.getStat(DataVerticalOscillationAvg.type);
      if (activityVerticalOscillation) {
        averageVerticalOscillation = hasAverageVerticalOscillation
          ? (averageVerticalOscillation + <number>activityVerticalOscillation.getValue()) / 2
          : <number>activityVerticalOscillation.getValue();
        hasAverageVerticalOscillation = true;
      }
    });
    if (hasAverageVerticalOscillation) {
      stats.push(new DataVerticalOscillationAvg(averageVerticalOscillation));
    }

    stats.push(...this.getSummaryRunningDynamicsStatsForActivities(activities));
    stats.push(...this.getIntensityZonesStatsAggregated(activities));

    // Add start and end position
    // This expects the to be sorted
    const activitiesWithStartPosition = activities.filter(activity => activity.getStat(DataStartPosition.type));
    const activitiesWithEndPosition = activities.filter(activity => activity.getStat(DataEndPosition.type));
    if (activitiesWithStartPosition && activitiesWithStartPosition.length) {
      const startPositionStat = <DataStartPosition>activitiesWithStartPosition[0].getStat(DataStartPosition.type);
      stats.push(new DataStartPosition(startPositionStat.getValue()));
    }
    if (activitiesWithEndPosition && activitiesWithEndPosition.length) {
      const endPositionStat = <DataEndPosition>(
        activitiesWithEndPosition[activitiesWithEndPosition.length - 1].getStat(DataEndPosition.type)
      );
      stats.push(new DataEndPosition(endPositionStat.getValue()));
    }
    // debugger;
    return stats;
  }

  /**
   * Calculate Mean Max Power for specified durations
   * @param activity The activity to analyze
   * @param durations Array of durations in seconds. If not provided, a "Best-in-Class" high-granularity set is used.
   */
  public static calculateMeanMaxPower(activity: ActivityInterface, durations?: number[]): DataPowerCurve {
    if (!activity.hasStreamData(DataPower.type)) {
      return new DataPowerCurve([]);
    }

    // Default "Best-in-Class" granularity if no durations provided
    if (!durations || durations.length === 0) {
      durations = [
        // High Resolution Sprint (1s - 10s)
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        // Sprint Transition (12s - 50s)
        12, 15, 18, 20, 25, 30, 35, 40, 45, 50,
        // Anaerobic Capacity (1m - 4m)
        60, 75, 90, 120, 150, 180, 210, 240,
        // VO2 Max (5m - 10m)
        300, 360, 420, 480, 540, 600,
        // Threshold & Endurance (12m - 5h)
        720, 900, 1200, 1500, 1800, 2400, 3600, 5400, 7200, 10800, 14400, 18000
      ];
    }

    const supportedPower = powerIntervals(activity).watts;
    const powerData = supportedPower.map((value, index) =>
      value > 0 && index > 0 && index < supportedPower.length - 1 &&
      supportedPower[index - 1] === 0 && supportedPower[index + 1] === 0 ? 0 : value);
    const curvePoints: DataPowerCurvePoint[] = [];

    // Get user weight for W/kg calculation
    const weightStat = activity.getStat(DataWeight.type);
    const weight = weightStat ? <number>weightStat.getValue() : null;

    // Sort durations to ensure consistent processing order, though not strictly necessary
    const sortedDurations = [...durations].sort((a, b) => a - b);

    for (const duration of sortedDurations) {
      const maxAvgPower = meanMaxPower(powerData, duration);
      if (maxAvgPower === null) continue;

      const point: DataPowerCurvePoint = {
        duration: new DataDuration(duration),
        power: new DataPower(maxAvgPower)
      };

      if (weight && weight > 0) {
        // Calculate W/kg, round to 2 decimal places for cleanliness
        const wKg = Math.round((maxAvgPower / weight) * 100) / 100;
        point.wattsPerKg = new DataPowerWattsPerKg(wKg);
      }

      curvePoints.push(point);
    }

    return new DataPowerCurve(curvePoints);
  }

  private static calculateFTP(activity: ActivityInterface): DataFTP | null {
    let twentyMinutePower: number | undefined;
    const isValidPower = (value: number | undefined): value is number =>
      typeof value === 'number' && Number.isFinite(value) && value > 0;
    const curveStat = activity.getStat(DataPowerCurve.type);

    if (curveStat && curveStat.getValue()) {
      const points = <DataPowerCurvePoint[]>(<unknown>curveStat.getValue());
      const point = points.find(p => p.duration.getValue() === this.FTP_DURATION_SECONDS);
      if (point) {
        twentyMinutePower = point.power.getValue();
      }
    }

    if (!isValidPower(twentyMinutePower) && activity.hasStreamData(DataPower.type)) {
      const curve = this.calculateMeanMaxPower(activity, [this.FTP_DURATION_SECONDS]);
      const points = <DataPowerCurvePoint[]>(<unknown>curve.getValue());
      if (points.length > 0) {
        twentyMinutePower = points[0].power.getValue();
      }
    }

    if (!isValidPower(twentyMinutePower)) {
      return null;
    }

    return new DataFTP(this.round(twentyMinutePower * this.FTP_FACTOR));
  }

  private static calculatePowerIntensityFactor(activity: ActivityInterface): DataPowerIntensityFactor | null {
    const normalizedPower = this.resolveNormalizedPower(activity);
    const ftp = this.resolveFunctionalThresholdPower(activity);

    if (normalizedPower === null || ftp === null) {
      return null;
    }

    // IF may be generated even when imported TSS bypasses calculated TSS selection.
    // Keep its displayed denominator consistent with the calibration actually used.
    this.persistCalibratedFunctionalThresholdPower(activity);
    return this.createCalculatedIntensityFactor(activity, this.round(normalizedPower / ftp, this.INTENSITY_FACTOR_DECIMALS));
  }

  private static toPositiveFiniteNumber(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
  }

  private static resolvePowerWattsPerKg(activity: ActivityInterface): number | null {
    const existingPowerWattsPerKg = this.toPositiveFiniteNumber(
      this.getFiniteStatValue(activity, DataPowerWattsPerKg.type)
    );
    if (existingPowerWattsPerKg !== null) {
      return existingPowerWattsPerKg;
    }

    const averagePower = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataPowerAvg.type));
    const weight = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataWeight.type));
    if (averagePower === null || weight === null) {
      return null;
    }

    return this.round(averagePower / weight, 2);
  }

  private static getDurationSecondsWithoutPauses(activity: ActivityInterface): number {
    if (fileActiveDuration.get(activity) === null) return 0;
    const timerTime = this.getFiniteStatValue(activity, DataTimerTime.type);
    if (timerTime !== null && timerTime > 0) {
      return timerTime;
    }
    // A validated all-paused file has no eligible duration. Preserve the legacy
    // fallback for unproven zero summaries, including restored Activity JSON.
    if (timerTime === 0 && fileActiveDuration.get(activity) === 0) {
      return 0;
    }

    const movingTime = this.getFiniteStatValue(activity, DataMovingTime.type);
    if (movingTime !== null && movingTime > 0) {
      return movingTime;
    }

    const duration = this.getFiniteStatValue(activity, DataDuration.type);
    if (duration !== null && duration > 0) {
      const pause = this.getFiniteStatValue(activity, DataPause.type);
      if (pause !== null && pause >= 0 && duration - pause > 0) {
        return duration - pause;
      }
      return duration;
    }

    const fallbackDurationSeconds = (activity.endDate.getTime() - activity.startDate.getTime()) / 1000;
    if (Number.isFinite(fallbackDurationSeconds) && fallbackDurationSeconds > 0) {
      return fallbackDurationSeconds;
    }

    return 0;
  }

  private static getTssOverrideValue(
    activity: ActivityInterface,
    key: keyof ActivityParsingTssOverridesOptions
  ): number | null {
    return this.toPositiveFiniteNumber(activity.parseOptions?.tss?.overrides?.[key]);
  }

  private static getZoneFiveLowerLimit(activity: ActivityInterface, zoneType: string): number | null {
    const zone = activity.intensityZones.find(intensityZone => intensityZone.type === zoneType);
    return this.toPositiveFiniteNumber(zone?.zone5LowerLimit);
  }

  private static getStreamSamplesByDuration(
    activity: ActivityInterface,
    streamType: string
  ): Array<{ duration: number; value: number }> {
    if (!activity.hasStreamData(streamType)) {
      return [];
    }

    return activity
      .getStreamDataByDuration(streamType, true, true)
      .map(sample => ({ duration: sample.time / 1000, value: sample.value as number }))
      .filter(sample => Number.isFinite(sample.duration) && Number.isFinite(sample.value));
  }

  private static resolveNormalizedPower(activity: ActivityInterface): number | null {
    const existingNormalizedPower = this.toPositiveFiniteNumber(
      this.getFiniteStatValue(activity, DataPowerNormalized.type)
    );
    if (existingNormalizedPower !== null) {
      return existingNormalizedPower;
    }

    if (!activity.hasStreamData(DataPower.type)) {
      return null;
    }

    const power = powerIntervals(activity).watts;
    const computedNormalizedPower = calculateNormalizedPower(power, power.map((_, i) => i), activity.getAllEvents());
    if (!Number.isFinite(computedNormalizedPower) || computedNormalizedPower < 0) {
      return null;
    }

    this.setCalculatedNormalizedPower(activity, computedNormalizedPower);
    return computedNormalizedPower;
  }

  private static resolveFunctionalThresholdPower(activity: ActivityInterface): number | null {
    const override = this.getTssOverrideValue(activity, 'functionalThresholdPower');
    if (override !== null) {
      return override;
    }

    return this.toPositiveFiniteNumber(fileFunctionalThresholdPower.get(activity));
  }

  private static persistCalibratedFunctionalThresholdPower(activity: ActivityInterface): void {
    const calibratedFtp = this.resolveFunctionalThresholdPower(activity);
    if (calibratedFtp === null) {
      return;
    }

    const currentFtp = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataFTP.type));
    if (currentFtp !== calibratedFtp) {
      activity.addStat(new DataFTP(calibratedFtp));
    }
  }

  private static resolveLactateThresholdHr(activity: ActivityInterface): number | null {
    const override = this.getTssOverrideValue(activity, 'lactateThresholdHR');
    if (override !== null) {
      return override;
    }
    return fileHeartRateCalibration.get(activity)?.lactateThresholdHR ?? null;
  }

  private static resolveMaxHeartRate(activity: ActivityInterface): number | null {
    const override = this.getTssOverrideValue(activity, 'maxHeartRate');
    if (override !== null) {
      return override;
    }

    const setting = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataMaxHRSetting.type));
    if (setting !== null) {
      return setting;
    }

    return fileHeartRateCalibration.get(activity)?.maxHeartRate ?? null;
  }

  private static resolveRestingHeartRate(activity: ActivityInterface): number | null {
    return this.getTssOverrideValue(activity, 'restingHeartRate') ?? fileHeartRateCalibration.get(activity)?.restingHeartRate ?? null;
  }

  private static resolveGender(activity: ActivityInterface): string | undefined {
    const value = activity.getStat(DataGender.type)?.getValue();
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private static resolveFunctionalThresholdPace(activity: ActivityInterface): number | null {
    const override = this.getTssOverrideValue(activity, 'functionalThresholdPace');
    if (override !== null) {
      return override;
    }
    return this.getZoneFiveLowerLimit(activity, DataSpeed.type);
  }

  private static resolveSwimSpeed(activity: ActivityInterface): number | null {
    const averageSpeed = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataSpeedAvg.type));
    if (averageSpeed !== null) {
      return averageSpeed;
    }

    const speedSamples = this.getStreamSamplesByDuration(activity, DataSpeed.type);
    if (!speedSamples.length) {
      return null;
    }

    const averageFromStream = speedSamples.reduce((sum, sample) => sum + sample.value, 0) / speedSamples.length;
    return this.toPositiveFiniteNumber(averageFromStream);
  }

  private static resolveThresholdSwimSpeed(activity: ActivityInterface): number | null {
    const thresholdOverride = this.getTssOverrideValue(activity, 'thresholdSwimSpeed');
    if (thresholdOverride !== null) {
      return thresholdOverride;
    }

    const legacyOverride = this.getTssOverrideValue(activity, 'refSwimSpeed');
    if (legacyOverride !== null) {
      return legacyOverride;
    }

    const fromSwimPaceZones = this.getZoneFiveLowerLimit(activity, DataSwimPace.type);
    if (fromSwimPaceZones !== null) {
      const convertedSpeed = this.toPositiveFiniteNumber(convertSwimPaceToSpeed(fromSwimPaceZones));
      if (convertedSpeed !== null) {
        return convertedSpeed;
      }
    }

    const fromSpeedZones = this.getZoneFiveLowerLimit(activity, DataSpeed.type);
    if (fromSpeedZones !== null) {
      return fromSpeedZones;
    }

    // Workout speed is not an independent threshold: using it here forces IF=1.
    return null;
  }

  private static resolveMetThreshold(activity: ActivityInterface): number {
    return this.getTssOverrideValue(activity, 'thresholdMet') ?? 10;
  }

  private static calculatedTssCandidate(result: TssCalculationResult | null): TssCandidate {
    return { result, reason: result === null ? 'calculation-unavailable' : null };
  }

  private static calculatePowerTss(activity: ActivityInterface): TssCandidate {
    const ftp = this.resolveFunctionalThresholdPower(activity);
    if (ftp === null) {
      return { result: null, reason: 'missing-power-inputs' };
    }

    const normalizedPower = this.resolveNormalizedPower(activity);
    const durationSeconds = this.getDurationSecondsWithoutPauses(activity);
    if (normalizedPower === null || !(durationSeconds > 0)) {
      return { result: null, reason: 'missing-power-inputs' };
    }

    if (this.isCalculatedNormalizedPower(activity)) {
      const coverage = powerIntervals(activity).coverage;
      const denominator = Math.max(coverage.durationSeconds, durationSeconds);
      if (!(denominator > 0) || coverage.coveredDurationSeconds / denominator < this.MINIMUM_COMPUTED_POWER_TSS_COVERAGE - 1e-9) {
        return { result: null, reason: 'calculation-unavailable' };
      }
    }

    return this.calculatedTssCandidate(TssCalculator.calculatePowerTss({
      totalDurationWithoutPauses: durationSeconds,
      functionalThresholdPower: ftp,
      normalizedPower,
      samples: []
    }));
  }

  private static getHrTssSamples(activity: ActivityInterface): Array<{ duration: number; hr: number }> {
    return getHeartRateSamplesWithoutPauses(getHeartRateSamplesWithCoverage(activity),
      activity.getAllEvents()).map(sample => ({ duration: sample.duration, hr: sample.value }));
  }

  private static calculateHrTss(activity: ActivityInterface,
    samples = this.getHrTssSamples(activity)): TssCalculationResult | null {
    const maxHeartRate = this.resolveMaxHeartRate(activity);
    if (maxHeartRate === null) {
      return null;
    }

    const lactateThresholdHR = this.resolveLactateThresholdHr(activity);
    const restingHeartRate = this.resolveRestingHeartRate(activity);
    const gender = this.resolveGender(activity);

    if (!samples.length) {
      return null;
    }

    return TssCalculator.calculateHrTss({
      totalDurationWithoutPauses: this.getDurationSecondsWithoutPauses(activity),
      lactateThresholdHR: lactateThresholdHR ?? undefined,
      maxHeartRate,
      restingHeartRate: restingHeartRate ?? undefined,
      gender,
      samples
    });
  }

  private static calculatePaceTss(activity: ActivityInterface): TssCandidate {
    const functionalThresholdPace = this.resolveFunctionalThresholdPace(activity);
    if (functionalThresholdPace === null) {
      return { result: null, reason: 'missing-pace-inputs' };
    }

    const speedSamples = this.getStreamSamplesByDuration(activity, DataSpeed.type);
    if (!speedSamples.length) {
      return { result: null, reason: 'missing-pace-inputs' };
    }

    const enableHeuristicFallbacks = activity.parseOptions?.tss?.enableHeuristicFallbacks ?? true;
    const speedStream = activity.getStream(DataSpeed.type);
    const gradesAtSpeedTimes = (type: string): Map<number, number> => {
      const result = new Map<number, number>();
      if (activity.hasStreamData(type)) {
        gradeSamplesForSpeed(speedStream, activity.getStream(type)).forEach((grade, second) => {
          if (typeof grade === 'number' && Number.isFinite(grade)) result.set(second, grade / 100);
        });
      }
      return result;
    };
    const gradeSmoothByDuration = gradesAtSpeedTimes(DataGradeSmooth.type);
    const gradeByDuration = gradesAtSpeedTimes(DataGrade.type);
    const verticalSamples = this.getStreamSamplesByDuration(activity, DataVerticalSpeed.type);
    const verticalByDuration = new Map<number, number>(verticalSamples.map(sample => [sample.duration, sample.value]));

    const samples = speedSamples
      .map(sample => {
        const speed = sample.value;
        const verticalSpeed = verticalByDuration.get(sample.duration);

        let grade = gradeSmoothByDuration.get(sample.duration);
        if (grade === undefined) {
          grade = gradeByDuration.get(sample.duration);
        }
        if (grade === undefined && verticalSpeed !== undefined && speed > 0) {
          grade = verticalSpeed / speed;
        }
        if (grade === undefined && speed === 0) grade = 0;
        if (grade === undefined) {
          if (!enableHeuristicFallbacks) {
            return null;
          }
          grade = 0;
        }

        return {
          duration: sample.duration,
          speed,
          grade,
          verticalSpeed: verticalSpeed === undefined ? null : verticalSpeed
        };
      })
      .filter(
        (sample): sample is { duration: number; speed: number; grade: number; verticalSpeed: number | null } =>
          sample !== null
      );

    const durationSeconds = this.getDurationSecondsWithoutPauses(activity);
    if (!samples.length || samples.length !== speedSamples.length || !(durationSeconds > 0)) {
      return { result: null, reason: 'missing-pace-inputs' };
    }

    return this.calculatedTssCandidate(TssCalculator.calculatePaceTss({
      totalDurationWithoutPauses: durationSeconds,
      functionalThresholdPace,
      samples,
      timerEvents: activity.getAllEvents()
    }));
  }

  private static calculateSwimPaceTss(activity: ActivityInterface, thresholdSwimSpeed: number | null): TssCandidate {
    const swimSpeed = this.resolveSwimSpeed(activity);
    if (thresholdSwimSpeed === null) {
      return { result: null, reason: 'missing-swim-threshold' };
    }
    const durationSeconds = this.getDurationSecondsWithoutPauses(activity);
    if (swimSpeed === null || !(durationSeconds > 0)) {
      return { result: null, reason: 'missing-pace-inputs' };
    }

    return this.calculatedTssCandidate(TssCalculator.calculateSwimTss({
      totalDurationWithoutPauses: durationSeconds,
      swimSpeed,
      thresholdSwimSpeed,
      samples: []
    }));
  }

  private static calculateMetTss(activity: ActivityInterface): TssCandidate {
    const durationSeconds = this.getDurationSecondsWithoutPauses(activity);
    if (durationSeconds <= 0) {
      return { result: null, reason: 'missing-met-inputs' };
    }

    let metScore = this.getTssOverrideValue(activity, 'metScore');
    if (metScore === null) {
      const energy = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataEnergy.type));
      const weight = this.toPositiveFiniteNumber(this.getFiniteStatValue(activity, DataWeight.type));
      if (energy === null || weight === null) {
        return { result: null, reason: 'missing-met-inputs' };
      }
      metScore = this.toPositiveFiniteNumber(TssCalculator.estimateMetScore(energy, weight, durationSeconds));
    }
    if (metScore === null) {
      return { result: null, reason: 'calculation-unavailable' };
    }

    return this.calculatedTssCandidate(TssCalculator.calculateMetTss({
      totalDurationWithoutPauses: durationSeconds,
      metScore,
      thresholdMet: this.resolveMetThreshold(activity),
      samples: []
    }));
  }

  private static supportsPaceTss(activity: ActivityInterface): boolean {
    const activityGroup = ActivityTypesHelper.getActivityGroupForActivityType(activity.type);
    if (activityGroup === ActivityTypeGroups.RunningGroup || activityGroup === ActivityTypeGroups.TrailRunningGroup) {
      return true;
    }

    return activity.type === ActivityTypes.TrackAndField;
  }

  /**
   * Compute all requested policies once from currently available parsed inputs.
   * Explicit recalculation replaces the cached evaluation; known calculated scores
   * are never promoted to imported scores. Results contain no raw HR calibration.
   * Automatic prefers usable power over HR, including for walking and hiking.
   * Every sport eligible for calculated load can use threshold-HR when resting or maximum HR is missing.
   * Swimming without an independent threshold skips swim pace, even when heuristic
   * fallbacks are enabled, and reports `missing-swim-threshold` when needed.
   * HR integration excludes explicit timer pauses and invalid readings, and requires observed interval coverage.
   * Explicit reevaluation refreshes calculated NP; device-supplied NP and cached getter results retain priority.
   * Computed normalized power requires complete windows of recorded observations; importer padding adds no coverage.
   * Running pace uses grade cost, full eligible duration and complete rolling windows retaining recorded zeros.
   * Missing input reasons describe unresolved prerequisites. Once those inputs resolve, a calculator
   * rejection reports `calculation-unavailable`, including unusable rolling coverage or existing range checks.
   */
  public static evaluateTrainingStressScore(activity: ActivityInterface): TrainingStressScoreEvaluations {
    return this.evaluateTrainingStressScoreFromCurrentInputs(activity, true);
  }

  private static evaluateTrainingStressScoreFromCurrentInputs(activity: ActivityInterface, refreshCalculatedPower = false): TrainingStressScoreEvaluations {
    const walking = [
      ActivityTypes.Walking,
      ActivityTypes.IndoorWalking,
      ActivityTypes.NordicWalking,
      ActivityTypes.SpeedWalking,
      ActivityTypes.Hiking,
      ActivityTypes.Trekking
    ].includes(activity.type);
    const existingScore = this.getFiniteStatValue(activity, DataTrainingStressScore.type);
    const existingMethod = activity.getStat(DataTrainingStressScoreMethod.type)?.getValue();
    const imported = existingScore !== null && existingScore >= 0 &&
      (existingMethod === undefined || existingMethod === TrainingStressScoreMethod.IMPORTED);
    if (imported) {
      const importedResult = (preference: TrainingStressScorePreference): TrainingStressScoreEvaluation => ({
        preference, score: existingScore, method: TrainingStressScoreMethod.IMPORTED,
        estimated: false, provenance: 'imported', reasons: ['imported-score']
      });
      const result: TrainingStressScoreEvaluations = { version: 1, automatic: importedResult('AUTOMATIC'),
        hr: importedResult('HR'), met: importedResult('MET') };
      trainingStressScoreEvaluations.set(activity, result);
      return result;
    }
    if (refreshCalculatedPower) {
      const invalidated = this.invalidateCalculatedPower(activity);
      // These remain useful activity statistics even when this sport or its
      // calibration is ineligible for power TSS. Refresh only removed outputs.
      if (invalidated.normalizedPower) this.resolveNormalizedPower(activity);
      if (invalidated.intensityFactor) {
        const factor = this.calculatePowerIntensityFactor(activity);
        if (factor) activity.addStat(factor);
      }
    }
    const eligible = supportsCalculatedTrainingStressScore(activity.type);
    const fileCalibration = fileHeartRateCalibration.get(activity);
    const overrides = activity.parseOptions?.tss?.overrides;
    const calibrationKeys = ['maxHeartRate', 'restingHeartRate', 'lactateThresholdHR'] as const;
    const hasCalibrationOverride = calibrationKeys.some(key => overrides?.[key] !== undefined);
    const validOverrides = calibrationKeys.every(key => overrides?.[key] === undefined ||
      this.toPositiveFiniteNumber(overrides[key]) !== null);
    const completeOverride = validOverrides && calibrationKeys.every(key => overrides?.[key] !== undefined);
    const max = this.resolveMaxHeartRate(activity);
    const rest = this.resolveRestingHeartRate(activity);
    const threshold = this.resolveLactateThresholdHr(activity);
    // Invalid explicit overrides must not silently fall back to file values for
    // either HR algorithm. Only a complete valid override can replace rejected file calibration.
    let hrReason: TrainingStressScoreReason | null = !validOverrides ? 'invalid-hr-calibration'
      : !completeOverride && fileCalibration?.reason ? fileCalibration.reason
        : max === null || rest === null || threshold === null ? 'missing-hr-calibration'
          : !(0 < rest && rest < threshold && threshold < max) ? 'invalid-hr-calibration' : null;
    const partialCalibrationValid = validOverrides && (!fileCalibration?.reason || completeOverride) &&
      threshold !== null && threshold > 0 && (max === null || threshold < max) && (rest === null || rest < threshold);
    let fallbackThreshold: number | null = null;
    if (eligible && (max === null || rest === null)) {
      if (partialCalibrationValid) fallbackThreshold = threshold;
      else if (!hasCalibrationOverride) fallbackThreshold = fileCalibration?.thresholdFallbackHR ?? null;
    }
    if (fallbackThreshold !== null) hrReason = null;
    const hrSamples = hrReason ? [] : this.getHrTssSamples(activity);
    if (!hrReason && !hrSamples.length) hrReason = 'missing-hr-samples';
    const powerCandidate = eligible ? this.calculatePowerTss(activity) : null;
    const power = powerCandidate?.result ?? null;
    let hr: TssCalculationResult | null = null;
    if (eligible && !hrReason) {
      hr = fallbackThreshold !== null
        ? TssCalculator.calculateThresholdHrTss({ totalDurationWithoutPauses: this.getDurationSecondsWithoutPauses(activity),
          lactateThresholdHR: fallbackThreshold, samples: hrSamples })
        : this.calculateHrTss(activity, hrSamples);
    }
    const group = ActivityTypesHelper.getActivityGroupForActivityType(activity.type);
    // Pace is only an Automatic fallback; no preference can select it ahead of power or HR.
    const needsPace = eligible && !walking && !power && !hr;
    const swimming = group === ActivityTypeGroups.SwimmingGroup;
    const swimThreshold = needsPace && swimming ? this.resolveThresholdSwimSpeed(activity) : null;
    const paceCandidate = needsPace ? swimming
      ? this.calculateSwimPaceTss(activity, swimThreshold) : this.supportsPaceTss(activity) ? this.calculatePaceTss(activity) : null : null;
    const pace = paceCandidate?.result ?? null;
    const metCandidate = eligible ? this.calculateMetTss(activity) : null;
    const met = metCandidate?.result ?? null;
    const automatic = power ?? hr ?? pace ?? met;
    const automaticReasons: TrainingStressScoreReason[] = [];
    if (!eligible) automaticReasons.push('unsupported-sport');
    else {
      if (!power) automaticReasons.push(powerCandidate?.reason ?? 'missing-power-inputs');
      if (!power && !hr) automaticReasons.push(hrReason ?? 'calculation-unavailable');
      if (!power && !hr && !walking && !pace &&
        (swimming || this.supportsPaceTss(activity))) {
        automaticReasons.push(paceCandidate?.reason ?? 'missing-pace-inputs');
      }
      if (!automatic) automaticReasons.push(metCandidate?.reason ?? 'missing-met-inputs');
    }
    const powerCoverage = power && this.isCalculatedNormalizedPower(activity)
      ? powerIntervals(activity).coverage : null;
    const estimatedPower = !!powerCoverage && powerCoverage.coveredDurationSeconds <
      Math.max(powerCoverage.durationSeconds, this.getDurationSecondsWithoutPauses(activity)) - 1e-6;
    const resolve = (preference: TrainingStressScorePreference): TrainingStressScoreEvaluation => {
      const preferred = preference === 'HR' ? hr : preference === 'MET' ? met : automatic;
      const result = preferred ?? automatic;
      const reasons = preference === 'AUTOMATIC' ? automaticReasons : preferred ? [] :
        [...new Set<TrainingStressScoreReason>([
          preference === 'HR' ? hrReason ?? 'calculation-unavailable' : metCandidate?.reason ?? 'missing-met-inputs', ...automaticReasons
        ])];
      return { preference, score: result ? this.round(result.trainingStressScore, this.TRAINING_STRESS_SCORE_DECIMALS) : null,
        method: result?.calculationMethod ?? null,
        ...(result?.hrAlgorithm ? { hrAlgorithm: result.hrAlgorithm } : {}),
        estimated: result?.calculationMethod === TrainingStressScoreMethod.MET || result?.hrAlgorithm === 'THRESHOLD' ||
          (result?.calculationMethod === TrainingStressScoreMethod.POWER && estimatedPower),
        provenance: result ? 'calculated' : null,
        reasons: result?.hrAlgorithm === 'THRESHOLD' ? [...new Set<TrainingStressScoreReason>([...reasons, 'threshold-hr-fallback'])] : reasons };
    };
    const result: TrainingStressScoreEvaluations = { version: 1,
      automatic: resolve('AUTOMATIC'), hr: resolve('HR'), met: resolve('MET') };
    if (automatic?.calculationMethod === TrainingStressScoreMethod.POWER) {
      this.persistCalibratedFunctionalThresholdPower(activity);
      this.updatePowerOutputsFromPowerTss(activity, automatic);
    }
    trainingStressScoreEvaluations.set(activity, result);
    return result;
  }

  /** Read cached parse-time evaluations. Power requires independent file FTP or an explicit override;
   * per-activity FTP estimates and JSON-restored FTP stats are not calibration. */
  public static getTrainingStressScoreEvaluations(activity: ActivityInterface): TrainingStressScoreEvaluations {
    return trainingStressScoreEvaluations.get(activity) ?? this.evaluateTrainingStressScore(activity);
  }

  private static updatePowerOutputsFromPowerTss(
    activity: ActivityInterface,
    powerTss: Pick<TssCalculationResult, 'normalizedPower' | 'intensityFactor'>
  ): void {
    if (Number.isFinite(powerTss.normalizedPower) && !activity.getStat(DataPowerNormalized.type)) {
      this.setCalculatedNormalizedPower(activity, powerTss.normalizedPower as number);
    }

    if (Number.isFinite(powerTss.intensityFactor)) {
      activity.addStat(
        this.createCalculatedIntensityFactor(activity, this.round(powerTss.intensityFactor as number, this.INTENSITY_FACTOR_DECIMALS))
      );
    }
  }

  private static setTrainingStressScoreMethod(
    activity: ActivityInterface,
    method: TrainingStressScoreMethodType
  ): void {
    activity.addStat(new DataTrainingStressScoreMethod(method));
  }

  private static generateTrainingStressScore(activity: ActivityInterface): void {
    const result = this.evaluateTrainingStressScoreFromCurrentInputs(activity).automatic;
    // A failed recalculation must remove a previous calculated result, including its method.
    if (result.score === null || result.method === null) {
      activity.removeStat(DataTrainingStressScore.type);
      activity.removeStat(DataTrainingStressScoreMethod.type);
      return;
    }
    activity.addStat(new DataTrainingStressScore(result.score));
    this.setTrainingStressScoreMethod(activity, result.method);
  }

  /**
   * Calculate Critical Power (CP) and W' (Anaerobic Work Capacity)
   * using the Monod & Scherrer 2-parameter model (Power vs 1/Time).
   *
   * @deprecated A single activity curve is not sufficient evidence of current
   * athlete capacity. Use `fitThreeDimensionalCapacityModel` with a dated,
   * same-activity-type history instead.
   * @param activity
   */
  public static calculateCriticalPowerAndWPrime(
    activity: StatsClassInterface
  ): { cp: DataCriticalPower; wPrime: DataWPrime } | null {
    const curveStat = activity.getStat(DataPowerCurve.type);
    if (!curveStat || !curveStat.getValue()) {
      return null;
    }

    const points = <DataPowerCurvePoint[]>(<unknown>curveStat.getValue());

    // Filter for durations between 3 minutes (180s) and 20 minutes (1200s)
    // This range is standard to avoid anaerobic dominance (<3m) and aerobic drift/fatigue (>20m)
    const dataset = points.filter(p => {
      const d = p.duration.getValue();
      return d >= 180 && d <= 1200;
    });

    if (dataset.length < 2) {
      return null; // Not enough data points
    }

    // Linear Regression: y = mx + c
    // y = Power
    // x = 1 / time
    // m = W' (Slope)
    // c = CP (Intercept)

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    const n = dataset.length;

    dataset.forEach(p => {
      const t = p.duration.getValue();
      const P = p.power.getValue();

      const x = 1 / t;
      const y = P;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Validate results - CP and W' must be positive
    if (intercept <= 0 || slope <= 0) {
      return null;
    }

    return {
      cp: new DataCriticalPower(Math.round(intercept)),
      wPrime: new DataWPrime(Math.round(slope)) // W' is in Joules
    };
  }

  public static getIntensityZonesStatsAggregated(statClassInstances: StatsClassInterface[]): DataInterface[] {
    return [
      DataHeartRateZoneOneDuration.type,
      DataHeartRateZoneTwoDuration.type,
      DataHeartRateZoneThreeDuration.type,
      DataHeartRateZoneFourDuration.type,
      DataHeartRateZoneFiveDuration.type,
      DataPowerZoneOneDuration.type,
      DataPowerZoneTwoDuration.type,
      DataPowerZoneThreeDuration.type,
      DataPowerZoneFourDuration.type,
      DataPowerZoneFiveDuration.type,
      DataPowerZoneSixDuration.type,
      DataPowerZoneSevenDuration.type,
      DataSpeedZoneOneDuration.type,
      DataSpeedZoneTwoDuration.type,
      DataSpeedZoneThreeDuration.type,
      DataSpeedZoneFourDuration.type,
      DataSpeedZoneFiveDuration.type
    ].reduce((statsArray: DataInterface[], zone) => {
      const zoneDuration = statClassInstances.reduce((duration: number | null, statClassInstance) => {
        const durationStat = <DataDuration>statClassInstance.getStat(zone);
        if (durationStat) {
          duration = duration || 0;
          duration += durationStat.getValue();
        }
        return duration;
      }, null);

      if (isNumber(zoneDuration)) {
        statsArray.push(DynamicDataLoader.getDataInstanceFromDataType(zone, <number>zoneDuration));
      }
      return statsArray;
    }, []);
  }

  public static getActivityDataTypeGain(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff?: number
  ): number | null {
    return this.getActivityDataTypeGainOrLoss(activity, streamType, true, starDate, endDate, minDiff);
  }

  public static getActivityDataTypeLoss(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff?: number
  ): number | null {
    return this.getActivityDataTypeGainOrLoss(activity, streamType, false, starDate, endDate, minDiff);
  }

  public static getGainOrLoss(data: number[], gain: boolean, minDiff = 2): number | null {
    let gainOrLoss = 0;

    if (!data?.length) {
      return null;
    }

    data.reduce((previousValue: number, nextValue: number) => {
      // For gain
      if (gain) {
        // Increase the gain if eligible first check to be greater plus diff  [200, 300, 400, 100, 101, 102]
        if (previousValue + minDiff <= nextValue) {
          gainOrLoss += nextValue - previousValue;
          return nextValue;
        }
        // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
        if (previousValue < nextValue) {
          return previousValue;
        }
        return nextValue;
      }

      // For Loss
      if (previousValue - minDiff >= nextValue) {
        gainOrLoss += previousValue - nextValue;
        return nextValue;
      }
      // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
      if (previousValue > nextValue) {
        return previousValue;
      }
      return nextValue;
    }, data[0]);
    return gainOrLoss;
  }

  public static getMax(data: number[]): number {
    return data.reduce((previousValue, currentValue) => Math.max(previousValue, currentValue), -Infinity);
  }

  public static getMin(data: number[]): number {
    return data.reduce((previousValue, currentValue) => Math.min(previousValue, currentValue), Infinity);
  }

  public static calculateTotalDistanceForActivity(
    activity: ActivityInterface,
    startDate?: Date,
    endDate?: Date
  ): number {
    return this.geoLibAdapter.getDistance(
      <DataPositionInterface[]>activity.getPositionData(startDate, endDate).filter(position => position !== null)
    );
  }

  /**
   * Returns streams that derive from speed based on the activity type
   * @param speedStream
   * @param activityType
   */
  private static createByActivityTypeSpeedBasedStreams(
    speedStream: StreamInterface,
    activityType: ActivityTypes
  ): StreamInterface[] {
    return ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(activityType).reduce(
      (array: StreamInterface[], dataType) => {
        switch (dataType) {
          case DataPace.type:
            return array.concat([
              new Stream(
                DataPace.type,
                speedStream.getData().map(dataValue => {
                  if (!isNumber(dataValue)) {
                    return null;
                  }
                  return convertSpeedToPace(<number>dataValue);
                })
              )
            ]);
          case DataSwimPace.type:
            return array.concat([
              new Stream(
                DataSwimPace.type,
                speedStream.getData().map(dataValue => {
                  if (!isNumber(dataValue)) {
                    return null;
                  }
                  return convertSpeedToSwimPace(<number>dataValue);
                })
              )
            ]);
          case DataSpeed.type:
            return array.concat(speedStream);
          default:
            return array;
        }
      },
      []
    );
  }

  /**
   * Returns streams that derive from grade adjusted speed based on the activity type
   * @param gradeAdjustedSpeedStream
   * @param activityType
   */
  private static createByActivityTypeAltiDistanceSpeedBasedStreams(
    gradeAdjustedSpeedStream: StreamInterface,
    activityType: ActivityTypes
  ): StreamInterface[] {
    return ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(activityType).reduce(
      (array: StreamInterface[], dataType) => {
        switch (dataType) {
          case DataGradeAdjustedPace.type:
            return array.concat([
              new Stream(
                DataGradeAdjustedPace.type,
                gradeAdjustedSpeedStream.getData().map(dataValue => {
                  if (!isNumber(dataValue)) {
                    return null;
                  }
                  return convertSpeedToPace(<number>dataValue);
                })
              )
            ]);
          case DataGradeAdjustedSpeed.type:
            return array.concat(gradeAdjustedSpeedStream);
          default:
            return array;
        }
      },
      []
    );
  }

  /**

   * @todo unit test (get the pun?)
   * This creates streams that are deriving as unit based streams
   * For example it will create pace from speed, swim pace from speed but also speed in km/h as a unitstream
   * @param streams
   * @param activityType
   * @param unitStreamTypes DynamicDataLoader.allUnitDerivedDataTypes this acts like a whitelist for the unit derived units ONLY!
   * @param options
   */
  public static createUnitStreamsFromStreams(
    streams: StreamInterface[],
    activityType: ActivityTypes,
    unitStreamTypes?: string[],
    options: { includeDerivedTypes?: boolean; includeUnitVariants?: boolean } = {
      includeDerivedTypes: true,
      includeUnitVariants: true
    }
  ): StreamInterface[] {
    // @todo perhaps check input to be unitStreamTypesStrictly
    // TODO(sports-lib): make unit-stream generation canonical when both base and pre-existing unit streams
    // are present (or when multiple base streams map to the same unit variant), so downstream apps never
    // need dedupe heuristics for semantically-equivalent stream families.
    const unitStreamTypesToCreate = unitStreamTypes || [
      ...DynamicDataLoader.allUnitDerivedDataTypes,
      ...DynamicDataLoader.speedDerivedDataTypes
    ];
    const existingStreamTypes = new Set(streams.map(stream => stream.type));
    const generatedStreamsByType = new Map<string, StreamInterface>();

    let baseUnitStreams: StreamInterface[] = [];

    // Iterate over all possible base types that can have unit variants
    // This allows us to dynamically include ALL base streams (like Distance, Power, etc.) that need unit conversion
    Object.keys(DynamicDataLoader.dataTypeUnitGroups).forEach(baseDataType => {
      const stream = streams.find(s => s.type === baseDataType);
      if (!stream) {
        return;
      }

      // Special handling for derived types (Pace from Speed, etc.)
      if (baseDataType === DataSpeed.type && options.includeDerivedTypes) {
        baseUnitStreams = baseUnitStreams.concat(this.createByActivityTypeSpeedBasedStreams(stream, activityType));
        return;
      }

      if (baseDataType === DataGradeAdjustedSpeed.type && options.includeDerivedTypes) {
        baseUnitStreams = baseUnitStreams.concat(
          this.createByActivityTypeAltiDistanceSpeedBasedStreams(stream, activityType)
        );
        return;
      }

      if (baseDataType === DataVerticalSpeed.type) {
        // Vertical speed handling
        if (ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(activityType).length) {
          baseUnitStreams.push(stream);
        }
        return;
      }

      // For everything else (like Distance), just add the base stream so it can be used for unit generation
      baseUnitStreams.push(stream);
    });
    const startWith = baseUnitStreams.filter(
      baseUnitStream => unitStreamTypesToCreate.indexOf(baseUnitStream.type) !== -1
    );

    startWith.forEach(stream => {
      if (existingStreamTypes.has(stream.type) || generatedStreamsByType.has(stream.type)) {
        return;
      }
      generatedStreamsByType.set(stream.type, stream);
    });

    if (options.includeUnitVariants === false) {
      return Array.from(generatedStreamsByType.values());
    }

    Object.keys(DynamicDataLoader.dataTypeUnitGroups).forEach(baseDataType => {
      const baseStream = baseUnitStreams.find(stream => stream.type === baseDataType);
      if (!baseStream) {
        return;
      }

      Object.keys(DynamicDataLoader.dataTypeUnitGroups[baseDataType])
        .filter(unitBasedDataType => unitStreamTypesToCreate.indexOf(unitBasedDataType) !== -1) // @todo perhaps dont filter
        .forEach(unitBasedDataType => {
          if (existingStreamTypes.has(unitBasedDataType) || generatedStreamsByType.has(unitBasedDataType)) {
            return;
          }

          generatedStreamsByType.set(
            unitBasedDataType,
            new Stream(
              unitBasedDataType,
              baseStream.getData().map(dataValue => {
                if (!isNumber(dataValue)) {
                  return null;
                }
                return DynamicDataLoader.dataTypeUnitGroups[baseDataType][unitBasedDataType](<number>dataValue);
              })
            )
          );
        });
    });

    return Array.from(generatedStreamsByType.values());
  }

  /**
   * Generates eligible missing streams. Distance gaps remain null; calculated rates use
   * paired observations within active timer segments and retain their interval evidence.
   * @param activity
   */
  public static generateMissingStreamsForActivity(activity: ActivityInterface): ActivityInterface {
    // Create derived primitive streams which will be needed for others streams & stats computations
    this.createDerivedStreams(activity);

    // Keep the original altitude support for distance/grade pairing. Generic display
    // fill replaces its array below; it must not manufacture measured terrain pairs.
    const gradeAltitudeType = activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type;
    const gradeAltitude = activity.hasStreamData(gradeAltitudeType) ? activity.getStreamData(gradeAltitudeType) : [];

    // Fill supported non-distance display streams.
    this.addMissingDataToStreams(activity);

    if (
      activity.hasStreamData(DataLatitudeDegrees.type) &&
      activity.hasStreamData(DataLongitudeDegrees.type) &&
      (!activity.hasStreamData(DataDistance.type) || !activity.hasStreamData(DataGNSSDistance.type))
    ) {
      const streamData = activity.createStream(DataDistance.type).getData(); // Creating does not add it to activity just presets the resolution to 1s
      let distance = 0;
      activity
        .getPositionData()
        .reduce((prevPosition: DataPositionInterface | null, position: DataPositionInterface | null, index: number) => {
          if (!position) {
            return prevPosition;
          }
          if (prevPosition && position) {
            distance += this.geoLibAdapter.getDistance([prevPosition, position]);
          }
          streamData[index] = this.round(distance, 2);
          return position;
        }, null);

      if (!activity.hasStreamData(DataDistance.type)) {
        activity.addStream(new Stream(DataDistance.type, streamData));
      }

      if (!activity.hasStreamData(DataGNSSDistance.type)) {
        activity.addStream(new Stream(DataGNSSDistance.type, streamData));
      }

      if (!activity.hasStreamData(DataSpeed.type)) {
        activity.addStream(speedFromDistance(activity, activity.getStreamData(DataDistance.type)));
      }
    }

    // Check if we can get a grade stream
    if (
      !ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activity.type) &&
      activity.parseOptions?.streams?.smooth?.grade &&
      !activity.hasStreamData(DataGrade.type) &&
      this.canGenerateDerivedStream(activity, DataGrade.type)
    ) {
      gradeFromDistance(activity, activity.getStreamData(DataDistance.type), gradeAltitude,
        !!activity.parseOptions?.streams?.smooth?.gradeSmooth && !activity.hasStreamData(DataGradeSmooth.type))
        .forEach(stream => activity.addStream(stream));
    }

    // Get a grade adjusted speed (applies to running and cycling-like activity groups)
    const activityGroup = ActivityTypesHelper.getActivityGroupForActivityType(activity.type);
    if (
      (activityGroup === ActivityTypeGroups.RunningGroup ||
        activityGroup === ActivityTypeGroups.TrailRunningGroup ||
        activityGroup === ActivityTypeGroups.CyclingGroup ||
        activityGroup === ActivityTypeGroups.MountainBikingGroup) &&
      !activity.hasStreamData(DataGradeAdjustedSpeed.type) &&
      this.canGenerateDerivedStream(activity, DataGradeAdjustedSpeed.type)
    ) {
      const speed = activity.getAllStreams().find(stream => stream.type === DataSpeed.type)!;
      const grade = activity.getAllStreams().find(stream => stream.type === DataGradeSmooth.type) ||
        activity.getAllStreams().find(stream => stream.type === DataGrade.type);
      if (grade) activity.addStream(adjustedSpeedFromGrade(speed, grade));
    }

    // Derive each side from paired observations only. Keep every time slot explicit,
    // including trailing gaps, so in-memory reads and JSON restoration agree.
    for (const [powerType, balanceType] of [
      [DataPowerRight.type, DataPowerBalanceRight.type],
      [DataPowerLeft.type, DataPowerBalanceLeft.type]
    ]) {
      if (activity.hasStreamData(powerType) || !this.canGenerateDerivedStream(activity, powerType)) continue;
      const power = activity.getStreamData(DataPower.type);
      const balance = activity.getStreamData(balanceType);
      const data = Array.from({ length: Math.max(power.length, balance.length) }, (_, index) => {
        const watts = power[index], percent = balance[index];
        return typeof watts === 'number' && Number.isFinite(watts) &&
          typeof percent === 'number' && Number.isFinite(percent) ? watts * (percent / 100) : null;
      });
      activity.addStream(new Stream(powerType, data));
    }

    // If left stance time stream available, then add the right balance stream too
    if (
      !activity.hasStreamData(DataStanceTimeBalanceRight.type) &&
      this.canGenerateDerivedStream(activity, DataStanceTimeBalanceRight.type)
    ) {
      const rightStanceBalanceTimeStream = activity.createStream(DataStanceTimeBalanceRight.type);
      const leftStanceBalanceTimeStream = activity.getStreamData(DataStanceTimeBalanceLeft.type);

      const rightStanceBalanceTimeData = leftStanceBalanceTimeStream.map(leftBalance => {
        return Number.isFinite(leftBalance) ? 100 - (leftBalance as number) : null;
      });

      rightStanceBalanceTimeStream.setData(rightStanceBalanceTimeData);
      activity.addStream(rightStanceBalanceTimeStream);
    }

    return activity;
  }

  /**
   * Provides squashed stream data through callback for data manipulation.
   * Then rebuild the stream based on duration including the missing values (null, Infinity, ...) like the source stream
   * @param streamType
   * @param activity
   * @param shapeStreamData
   */
  public static shapeStream(
    streamType: string,
    activity: ActivityInterface,
    shapeStreamData: (squashedStreamData: number[]) => number[]
  ): void {
    if (streamType === DataIBI.type) {
      const sourceItems = activity.getStreamDataByDuration(streamType, true, true);
      const shapedValues = shapeStreamData(sourceItems.map(item => item.value) as number[]);
      activity.removeStream(streamType);
      const targetStream = activity.createStream(streamType);
      activity.addStream(targetStream);
      const targetData = targetStream.getData();

      for (let index = 0; index < sourceItems.length; index++) {
        targetData[activity.getDateIndex(new Date(activity.startDate.getTime() + sourceItems[index].time))] =
          shapedValues[index];
      }
      return;
    }

    const sourceStream = activity.getStream(streamType);
    const sourceData = sourceStream.getData();
    const evidence = sourceStream.getIntervalSupport?.();
    const sourceIndexes: number[] = [];
    const sourceValues: number[] = [];

    for (let index = 0; index < sourceData.length; index++) {
      const value = sourceData[index];
      if (Number.isFinite(value)) {
        sourceIndexes.push(index);
        sourceValues.push(value as number);
      }
    }

    const shapedValues = shapeStreamData(sourceValues);
    activity.removeStream(streamType);
    const targetData = activity.createStream(streamType).getData();

    for (let index = 0; index < sourceIndexes.length; index++) {
      targetData[sourceIndexes[index]] = shapedValues[index];
    }
    activity.addStream(new Stream(streamType, targetData, evidence ? {
      direction: evidence.direction,
      durations: targetData.map((value, index) => Number.isFinite(value) ? evidence.durations[index] ?? null : null)
    } : undefined));
  }

  public static cloneStream(activity: ActivityInterface, sourceStreamType: string, targetStreamType: string): void {
    const sourceStream = activity.getStream(sourceStreamType);
    const targetStream = new Stream(targetStreamType, Array.from(sourceStream.getData()), sourceStream.getIntervalSupport?.());
    activity.addStream(targetStream);
  }

  /**
   * Create derived primitive streams which will be needed for others streams & stats computations
   * @param activity
   */
  public static createDerivedStreams(activity: ActivityInterface): ActivityInterface {
    if (
      activity.parseOptions?.streams?.smooth?.altitudeSmooth &&
      this.canGenerateDerivedStream(activity, DataAltitudeSmooth.type) &&
      !activity.hasStreamData(DataAltitudeSmooth.type)
    ) {
      // Duplicate and create an altitude smooth stream (we want to keep original altitude stream available)
      // Activity stats will be computed on the smoothed altitude stream
      this.cloneStream(activity, DataAltitude.type, DataAltitudeSmooth.type);

      // Remove spiky data altitudes
      this.shapeStream(DataAltitudeSmooth.type, activity, squashedAltData => {
        squashedAltData = medianFilter(squashedAltData, ALTITUDE_SPIKES_FILTER_WIN); // Remove data spikes
        squashedAltData = LowPassFilter.smooth(squashedAltData) as number[]; // Remove too high altitude frequencies
        return squashedAltData;
      });
    }
    return activity;
  }

  private static canGenerateDerivedStream(activity: ActivityInterface, streamType: string): boolean {
    return canDeriveStreamType(streamType, requiredType => activity.hasStreamData(requiredType));
  }

  /**
   * Back and forth fills an activity's stream data so they can be more "tree" like
   * It does this for:
   *
   *  [DataAltitude.type,
   * DataHeartRate.type,
   * DataCadence.type,
   * DataStrokeRate.type]
   * Distance is deliberately excluded: missing distance is not a stationary measurement.
   *
   * Example
   *
   * Distance[0, 10, 30, 40, 50,null,60] #null here is legit eg missing record
   * Altitude[100, 101, null, 103, null, null, 106]
   * Should be
   * Altitude[100,101,101,103,103,103,106]
   *
   * @param activity
   */
  public static addMissingDataToStreams(activity: ActivityInterface) {
    captureHeartRateCoverageBeforeFill(activity);
    /**
     * This tries to align data with Strava.
     * Strava fills HR alti cadence with the last value.
     * For Power and temperature it doesn't but keeps nulls.
     * However, if you keep nulls for paused portions then strava doens't give back null
     * that typically indicates a sensor disconnect I suppose.
     */
    const streamTypesToBackAndForthFill = [
      DataAltitude.type,
      DataHeartRate.type,
      DataCadence.type,
      DataStrokeRate.type
      // DataSpeed.type, @todo should we be backfilling speed?
    ];
    // Recorded pool sensors have independent coverage. Their timestamps must
    // not extend length-derived streams. Lengths survive JSON restoration, so
    // power-only timestamps remain excluded after hydration as well.
    const hasPoolLengths = activity.getSwimLengths().length > 0;
    const timeStream = activity.generateTimeStream(
      recordedPoolHeartRate.has(activity) || hasPoolLengths
        ? activity
            .getAllStreams()
            .filter(
              stream =>
                stream.type !== DataIBI.type &&
                !(stream.type === DataHeartRate.type && recordedPoolHeartRate.has(activity)) &&
                !(stream.type === DataPower.type && hasPoolLengths)
            )
            .map(stream => stream.type)
        : []
    );
    // Original record timestamps preserve the existing fill behavior of other sensors
    // when missing watts stop supplying artificial zeros. They are consumed here only;
    // the public Time stream remains the union of actual sensor values.
    const importedFillTimes = takeImportedSensorFillTimes(activity);
    if (!hasPoolLengths && !recordedPoolHeartRate.has(activity)) {
      const fillGrid = timeStream.getData();
      for (const index of importedFillTimes) {
        if (index < fillGrid.length) fillGrid[index] = index;
      }
    }
    /**
     * We do a second pass here and we add missing data on crossing time indexes
     * for example:
     * Time[0,1,2,3,4,5,7]
     * Distance[0, 10, 30, 40, 50,null,60] #null here is legit eg missing record
     * Altitude[100, 101, null, 103, null, null, 106]
     * Should be
     * Altitude[100,101,101,103,103,103,106]
     */
    activity
      .getAllStreams()
      .filter(stream => streamTypesToBackAndForthFill.indexOf(stream.type) !== -1 &&
        !(stream.type === DataHeartRate.type && recordedPoolHeartRate.has(activity)))
      .forEach(stream => {
        // Find the first sample value
        let currentValue = <number>stream.getData(true, true)[0];
        // The time stream will always have more length than each stream when not back/forthfilled
        const timeStreamData = <number[]>timeStream.getData();
        stream.setData(
          timeStreamData.reduce((data: (number | null)[], time, timeIndex) => {
            // If there is no timeslot put whatever was
            if (!isNumber(time)) {
              data.push(stream.getData()[timeIndex]);
              return data;
            }

            // We have a time slot here on ...  (for the first run, old is the very first next)

            // If it's a number set the current , else leave it to old to forth fill
            if (isNumber(stream.getData()[time])) {
              currentValue = <number>stream.getData()[time];
            }
            // Fill the current or old...
            data.push(currentValue);
            return data;
          }, [])
        );
      });
    retainHeartRateCoverageAfterFill(activity);
    /**
     * @todo
     * Linear fill distance where:
     * a) There is not distance but it's not paused
     * b) There is no corespoding lat/long but there is distace (aka distance = not trusted)
     * About B I am not sure. That is because if there is for example an internal accelerometer
     * that reports better this can help with pace and other things. Even for GAP
     */

    // Fix activity having broken start lat/lng
    // Case: "fixtures/others/broken-start-latlng.fit"
    if (activity.hasStreamData(DataLongitudeDegrees.type)) {
      this.shapeStream(DataLongitudeDegrees.type, activity, (squashedData: number[]) => {
        const firstKnownCoord = (squashedData as number[]).find(l => l != 0);
        if (firstKnownCoord != null) {
          let index = 0;
          while (squashedData[index] === 0) {
            squashedData[index] = firstKnownCoord;
            index++;
          }
        }
        return squashedData;
      });
    }

    if (activity.hasStreamData(DataLatitudeDegrees.type)) {
      this.shapeStream(DataLatitudeDegrees.type, activity, (squashedData: number[]) => {
        const firstKnownCoord = (squashedData as number[]).find(l => l != 0);
        if (firstKnownCoord != null) {
          let index = 0;
          while (squashedData[index] === 0) {
            squashedData[index] = firstKnownCoord;
            index++;
          }
        }
        return squashedData;
      });
    }
  }

  /**
   *
   * @param secondsPer100m
   * @param avgStrokesPerMin
   * @param poolLength
   */
  public static computeSwimSwolf(secondsPer100m: number, avgStrokesPerMin: number, poolLength: number): number {
    const minutesPer100m = secondsPer100m / 60;
    const avgStrokePer100m = avgStrokesPerMin * minutesPer100m;
    const strokesPerMeter = avgStrokePer100m / 100;
    const secondsPerMeter = secondsPer100m / 100;
    return this.round((secondsPerMeter + strokesPerMeter) * poolLength, 1);
  }

  private static getActivityDataTypeGainOrLoss(
    activity: ActivityInterface,
    streamType: string,
    gain: boolean,
    startDate?: Date,
    endDate?: Date,
    minDiff?: number
  ): number | null {
    return this.getGainOrLoss(activity.getSquashedStreamData(streamType, startDate, endDate), gain, minDiff);
  }

  private static getActivityDataTypeMinOrMax(
    activity: ActivityInterface,
    streamType: string,
    max: boolean,
    startDate?: Date,
    endDate?: Date,
    filterOver?: number
  ): number {
    if (startDate === undefined && endDate === undefined) {
      const data = activity.getStreamData(streamType);
      const shouldFilterOver = Number.isFinite(filterOver);
      let result = max ? -Infinity : Infinity;

      for (const value of data) {
        if (Number.isFinite(value) && (!shouldFilterOver || (value as number) > (filterOver as number))) {
          result = max ? Math.max(result, value as number) : Math.min(result, value as number);
        }
      }

      return result;
    }

    const data = activity
      .getSquashedStreamData(streamType, startDate, endDate)
      .filter(
        streamData =>
          streamData !== Infinity &&
          streamData !== -Infinity &&
          (Number.isFinite(filterOver) ? streamData > <number>filterOver : true)
      );
    if (max) {
      return this.getMax(data);
    }
    return this.getMin(data);
  }

  /**
   * Generates the stats for an activity
   * @todo move to factory with next version
   * @param activity
   */
  private static generateMissingStatsForActivity(activity: ActivityInterface) {
    const power = activity.hasStreamData(DataPower.type) ? powerIntervals(activity) : null;
    if (power) {
      const c = power.coverage;
      const timer = this.getDurationSecondsWithoutPauses(activity);
      if (!activity.getStat(DataPowerWork.type) && c.durationSeconds > 0 && timer > 0 &&
        Math.abs(c.durationSeconds - timer) < 1e-6 &&
        c.coveredDurationSeconds >= c.durationSeconds - 1e-6) {
        activity.addStat(new DataPowerWork(c.observedWorkKilojoules));
      }
    }
    addMissingStreamSummaryStats({
      activityType: activity.type,
      target: activity,
      readStream: streamType => (activity.hasStreamData(streamType) ? activity.getStreamData(streamType) : undefined),
      readAverage: streamType => {
        if (streamType === DataPower.type) return power?.coverage.observedAveragePowerWatts ?? null;
        const stream = activity.getAllStreams().find(item => item.type === streamType);
        return stream ? intervalAverage(stream) : undefined;
      }
    });
    // If there is no distance or distance for some reason is 0
    const activityDistanceStat = activity.getStat(DataDistance.type);
    if (!activityDistanceStat || activityDistanceStat.getValue() === 0) {
      let distance = 0;
      if (activity.hasStreamData(DataDistance.type)) {
        const distanceData = activity.getSquashedStreamData(DataDistance.type);
        distance = distanceData[distanceData.length - 1] - distanceData[0] || 0;
      } else if (
        activity.hasStreamData(DataLongitudeDegrees.type) &&
        activity.hasStreamData(DataLatitudeDegrees.type)
      ) {
        distance = this.calculateTotalDistanceForActivity(activity, activity.startDate, activity.endDate);
      }
      activity.addStat(new DataDistance(distance));
    }

    if (!activity.getStat(DataGNSSDistance.type) && activity.hasStreamData(DataGNSSDistance.type)) {
      const observations = activity.getStreamData(DataGNSSDistance.type).filter(
        (value): value is number => typeof value === 'number' && Number.isFinite(value)
      );
      if (observations.length) activity.addStat(new DataGNSSDistance(observations[observations.length - 1]));
    }

    // Ascent (altitude gain)
    if (
      !ActivityTypesHelper.shouldExcludeAscent(activity.type) &&
      !activity.getStat(DataAscent.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      const gain = this.getActivityDataTypeGain(
        activity,
        activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
      );
      if (gain !== null) {
        activity.addStat(new DataAscent(gain));
      }
    }
    // Descent (altitude loss)
    if (
      !ActivityTypesHelper.shouldExcludeDescent(activity.type) &&
      !activity.getStat(DataDescent.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      const loss = this.getActivityDataTypeLoss(
        activity,
        activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
      );
      if (loss !== null) {
        activity.addStat(new DataDescent(loss));
      }
    }
    // Altitude start
    if (
      !activity.getStat(DataStartAltitude.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type)) &&
      this.getDataTypeFirst(
        activity,
        activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
      )
    ) {
      activity.addStat(
        new DataStartAltitude(
          this.getDataTypeFirst(
            activity,
            activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
          )
        )
      );
    }

    // Altitude end
    if (
      !activity.getStat(DataEndAltitude.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type)) &&
      this.getDataTypeLast(
        activity,
        activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
      )
    ) {
      activity.addStat(
        new DataEndAltitude(
          this.getDataTypeLast(
            activity,
            activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
          )
        )
      );
    }

    // Power-to-Weight Ratio (W/kg) from average power and body weight
    if (!activity.getStat(DataPowerWattsPerKg.type)) {
      const powerWattsPerKg = this.resolvePowerWattsPerKg(activity);
      if (powerWattsPerKg !== null) {
        activity.addStat(new DataPowerWattsPerKg(powerWattsPerKg));
      }
    }

    // A file-supplied summary wins; calculated NP uses only complete active windows.
    if (!activity.getStat(DataPowerNormalized.type)) this.resolveNormalizedPower(activity);

    // Power Curve
    if (!activity.getStat(DataPowerCurve.type) && activity.hasStreamData(DataPower.type)) {
      const powerCurve = this.calculateMeanMaxPower(activity);
      if (powerCurve) {
        activity.addStat(<any>powerCurve);
        activity.powerCurve = powerCurve;
      }
    }

    // FTP (0.95 * best 20 minute power)
    if (!activity.getStat(DataFTP.type)) {
      const calibratedFtp = this.resolveFunctionalThresholdPower(activity);
      const ftp = calibratedFtp === null ? this.calculateFTP(activity) : new DataFTP(calibratedFtp);
      if (ftp) {
        activity.addStat(ftp);
      }
    }

    // Intensity Factor (IF = Normalized Power / FTP)
    if (!activity.getStat(DataPowerIntensityFactor.type)) {
      const intensityFactor = this.calculatePowerIntensityFactor(activity);
      if (intensityFactor) {
        activity.addStat(intensityFactor);
      }
    }

    // Training Stress Score (priority: POWER -> HR -> PACE/SWIM_PACE -> MET)
    this.generateTrainingStressScore(activity);

    // Battery Consumption Avg
    if (!activity.getStat(DataBatteryConsumption.type) && activity.hasStreamData(DataBatteryCharge.type)) {
      activity.addStat(
        new DataBatteryConsumption(this.getDataTypeMinToMaxDifference(activity, DataBatteryCharge.type))
      );
    }

    // Battery Life Estimation based on Consumption
    if (!activity.getStat(DataBatteryLifeEstimation.type)) {
      const consumption = activity.getStat(DataBatteryConsumption.type);
      if (consumption && consumption.getValue()) {
        activity.addStat(
          new DataBatteryLifeEstimation(
            Number(((+activity.endDate - +activity.startDate) / 1000) * 100) / Number(consumption.getValue())
          )
        );
      }
    }

    // Start and end position
    if (
      (!activity.getStat(DataStartPosition.type) || !activity.getStat(DataEndPosition.type)) &&
      activity.hasPositionData()
    ) {
      const activityPositionData = activity.getPositionData().filter(data => data !== null);
      const startPosition = activityPositionData[0];
      const endPosition = activityPositionData[activityPositionData.length - 1];
      if (startPosition && !activity.getStat(DataStartPosition.type)) {
        activity.addStat(new DataStartPosition(startPosition));
      }
      if (endPosition && !activity.getStat(DataEndPosition.type)) {
        activity.addStat(new DataEndPosition(endPosition));
      }
    }

    this.addLeftRightBalanceStatsFromStreams(activity, DataPowerBalanceLeft, DataPowerBalanceRight);

    this.addLeftRightBalanceStatsFromStreams(
      activity,
      DataGroundContactTimeBalanceLeft,
      DataGroundContactTimeBalanceRight
    );
    this.addLeftRightBalanceStatsFromStreams(
      activity,
      DataVerticalOscillationBalanceLeft,
      DataVerticalOscillationBalanceRight
    );
    this.addLeftRightBalanceStatsFromStreams(
      activity,
      DataLegSpringStiffnessBalanceLeft,
      DataLegSpringStiffnessBalanceRight
    );
    this.addLeftRightBalanceStatsFromStreams(
      activity,
      DataImpactLoadingRateBalanceLeft,
      DataImpactLoadingRateBalanceRight
    );

    // Backward compatibility for Stance Time Balance
    this.addLeftRightBalanceStatsFromStreams(activity, DataStanceTimeBalanceLeft, DataStanceTimeBalanceRight);

    this.addMissingJumpStatsFromEvents(activity);
  }

  // @todo move to factory
  private static generateMissingUnitStatsForActivity(activity: ActivityInterface) {
    // Pace
    if (!activity.getStat(DataPaceMaxMinutesPerMile.type)) {
      const paceMax = activity.getStat(DataPaceMax.type);
      if (paceMax) {
        activity.addStat(new DataPaceMaxMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>paceMax.getValue())));
      }
    }
    if (!activity.getStat(DataPaceMinMinutesPerMile.type)) {
      const paceMin = activity.getStat(DataPaceMin.type);
      if (paceMin) {
        activity.addStat(new DataPaceMinMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>paceMin.getValue())));
      }
    }
    if (!activity.getStat(DataPaceAvgMinutesPerMile.type)) {
      const paceAvg = activity.getStat(DataPaceAvg.type);
      if (paceAvg) {
        activity.addStat(new DataPaceAvgMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>paceAvg.getValue())));
      }
    }
    // Effort Pace
    if (!activity.getStat(DataEffortPaceMaxMinutesPerMile.type)) {
      const effortPaceMax = activity.getStat(DataEffortPaceMax.type);
      if (effortPaceMax) {
        activity.addStat(
          new DataEffortPaceMaxMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>effortPaceMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataEffortPaceMinMinutesPerMile.type)) {
      const effortPaceMin = activity.getStat(DataEffortPaceMin.type);
      if (effortPaceMin) {
        activity.addStat(
          new DataEffortPaceMinMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>effortPaceMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataEffortPaceAvgMinutesPerMile.type)) {
      const effortPaceAvg = activity.getStat(DataEffortPaceAvg.type);
      if (effortPaceAvg) {
        activity.addStat(
          new DataEffortPaceAvgMinutesPerMile(convertPaceToPaceInMinutesPerMile(<number>effortPaceAvg.getValue()))
        );
      }
    }
    // Grade Adjusted Pace
    if (!activity.getStat(DataGradeAdjustedPaceMaxMinutesPerMile.type)) {
      const gradeAdjustedPaceMax = activity.getStat(DataGradeAdjustedPaceMax.type);
      if (gradeAdjustedPaceMax) {
        activity.addStat(
          new DataGradeAdjustedPaceMaxMinutesPerMile(
            convertPaceToPaceInMinutesPerMile(<number>gradeAdjustedPaceMax.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedPaceMinMinutesPerMile.type)) {
      const gradeAdjustedPaceMin = activity.getStat(DataGradeAdjustedPaceMin.type);
      if (gradeAdjustedPaceMin) {
        activity.addStat(
          new DataGradeAdjustedPaceMinMinutesPerMile(
            convertPaceToPaceInMinutesPerMile(<number>gradeAdjustedPaceMin.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedPaceAvgMinutesPerMile.type)) {
      const gradeAdjustedPaceAvg = activity.getStat(DataGradeAdjustedPaceAvg.type);
      if (gradeAdjustedPaceAvg) {
        activity.addStat(
          new DataGradeAdjustedPaceAvgMinutesPerMile(
            convertPaceToPaceInMinutesPerMile(<number>gradeAdjustedPaceAvg.getValue())
          )
        );
      }
    }
    // Swim Pace
    if (!activity.getStat(DataSwimPaceMaxMinutesPer100Yard.type)) {
      const swimPaceMax = activity.getStat(DataSwimPaceMax.type);
      if (swimPaceMax) {
        activity.addStat(
          new DataSwimPaceMaxMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSwimPaceMinMinutesPer100Yard.type)) {
      const swimPaceMin = activity.getStat(DataSwimPaceMin.type);
      if (swimPaceMin) {
        activity.addStat(
          new DataSwimPaceMinMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSwimPaceAvgMinutesPer100Yard.type)) {
      const swimPaceAvg = activity.getStat(DataPaceAvg.type);
      if (swimPaceAvg) {
        activity.addStat(
          new DataSwimPaceAvgMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceAvg.getValue()))
        );
      }
    }

    // Speed
    if (!activity.getStat(DataSpeedMaxKilometersPerHour.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataSpeedMaxKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMaxMilesPerHour.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(new DataSpeedMaxMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedMax.getValue())));
      }
    }
    if (!activity.getStat(DataSpeedMaxFeetPerSecond.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataSpeedMaxFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMaxFeetPerMinute.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataSpeedMaxFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMaxMetersPerMinute.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataSpeedMaxMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMaxKnots.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(new DataSpeedMaxKnots(convertSpeedToSpeedInKnots(<number>speedMax.getValue())));
      }
    }
    if (!activity.getStat(DataSpeedMinKilometersPerHour.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataSpeedMinKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMinMilesPerHour.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(new DataSpeedMinMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedMin.getValue())));
      }
    }
    if (!activity.getStat(DataSpeedMinFeetPerSecond.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataSpeedMinFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMinFeetPerMinute.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataSpeedMinFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMinMetersPerMinute.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataSpeedMinMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedMinKnots.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(new DataSpeedMinKnots(convertSpeedToSpeedInKnots(<number>speedMin.getValue())));
      }
    }
    if (!activity.getStat(DataSpeedAvgKilometersPerHour.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataSpeedAvgKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedAvgMilesPerHour.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(new DataSpeedAvgMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedAvg.getValue())));
      }
    }
    if (!activity.getStat(DataSpeedAvgFeetPerSecond.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedAvgFeetPerMinute.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataSpeedAvgFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedAvgMetersPerMinute.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataSpeedAvgMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataSpeedAvgKnots.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(new DataSpeedAvgKnots(convertSpeedToSpeedInKnots(<number>speedAvg.getValue())));
      }
    }

    // Grade Adjusted Speed
    if (!activity.getStat(DataGradeAdjustedSpeedMaxKilometersPerHour.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataGradeAdjustedSpeedMaxKilometersPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>speedMax.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMaxMilesPerHour.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataGradeAdjustedSpeedMaxMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMaxFeetPerSecond.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataGradeAdjustedSpeedMaxFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMaxFeetPerMinute.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataGradeAdjustedSpeedMaxFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedMax.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMaxMetersPerMinute.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(
          new DataGradeAdjustedSpeedMaxMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>speedMax.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMaxKnots.type)) {
      const speedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
      if (speedMax) {
        activity.addStat(new DataGradeAdjustedSpeedMaxKnots(convertSpeedToSpeedInKnots(<number>speedMax.getValue())));
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinKilometersPerHour.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataGradeAdjustedSpeedMinKilometersPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>speedMin.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinMilesPerHour.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataGradeAdjustedSpeedMinMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinFeetPerSecond.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataGradeAdjustedSpeedMinFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinFeetPerMinute.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataGradeAdjustedSpeedMinFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedMin.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinMetersPerMinute.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(
          new DataGradeAdjustedSpeedMinMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>speedMin.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedMinKnots.type)) {
      const speedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
      if (speedMin) {
        activity.addStat(new DataGradeAdjustedSpeedMinKnots(convertSpeedToSpeedInKnots(<number>speedMin.getValue())));
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgKilometersPerHour.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataGradeAdjustedSpeedAvgKilometersPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>speedAvg.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgMilesPerHour.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataGradeAdjustedSpeedAvgMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgFeetPerSecond.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataGradeAdjustedSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgFeetPerMinute.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataGradeAdjustedSpeedAvgFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedAvg.getValue()))
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgMetersPerMinute.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(
          new DataGradeAdjustedSpeedAvgMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>speedAvg.getValue())
          )
        );
      }
    }
    if (!activity.getStat(DataGradeAdjustedSpeedAvgKnots.type)) {
      const speedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(new DataGradeAdjustedSpeedAvgKnots(convertSpeedToSpeedInKnots(<number>speedAvg.getValue())));
      }
    }

    // Vertical speed
    const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
    if (verticalSpeedAvg) {
      const verticalSpeedAvgValue = <number>verticalSpeedAvg.getValue();
      if (!activity.getStat(DataVerticalSpeed.type)) {
        activity.addStat(new DataVerticalSpeed(verticalSpeedAvgValue));
      }
      if (!activity.getStat(DataVerticalSpeedFeetPerSecond.type)) {
        activity.addStat(new DataVerticalSpeedFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(verticalSpeedAvgValue)));
      }
      if (!activity.getStat(DataVerticalSpeedMetersPerMinute.type)) {
        activity.addStat(
          new DataVerticalSpeedMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(verticalSpeedAvgValue))
        );
      }
      if (!activity.getStat(DataVerticalSpeedFeetPerMinute.type)) {
        activity.addStat(new DataVerticalSpeedFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(verticalSpeedAvgValue)));
      }
      if (!activity.getStat(DataVerticalSpeedMetersPerHour.type)) {
        activity.addStat(new DataVerticalSpeedMetersPerHour(convertSpeedToSpeedInMetersPerHour(verticalSpeedAvgValue)));
      }
      if (!activity.getStat(DataVerticalSpeedFeetPerHour.type)) {
        activity.addStat(new DataVerticalSpeedFeetPerHour(convertSpeedToSpeedInFeetPerHour(verticalSpeedAvgValue)));
      }
      if (!activity.getStat(DataVerticalSpeedKilometerPerHour.type)) {
        activity.addStat(
          new DataVerticalSpeedKilometerPerHour(convertSpeedToSpeedInKilometersPerHour(verticalSpeedAvgValue))
        );
      }
      if (!activity.getStat(DataVerticalSpeedMilesPerHour.type)) {
        activity.addStat(new DataVerticalSpeedMilesPerHour(convertSpeedToSpeedInMilesPerHour(verticalSpeedAvgValue)));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerSecond.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerMinute.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedAvg.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerMinute.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerHour.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerHour.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgKilometerPerHour.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgKilometerPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedAvg.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMilesPerHour.type)) {
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerSecond.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedMax.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMetersPerMinute.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedMax.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerMinute.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedMax.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMetersPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedMax.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedMax.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxKilometerPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxKilometerPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedMax.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMilesPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(
          new DataVerticalSpeedMaxMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedMax.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerSecond.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedMin.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMetersPerMinute.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedMin.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerMinute.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedMin.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMetersPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedMin.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedMin.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinKilometerPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinKilometerPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedMin.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMilesPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(
          new DataVerticalSpeedMinMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedMin.getValue()))
        );
      }
    }

    // Test SWOLF existence for swimming activities
    if (
      (activity.type === ActivityTypes.Swimming || activity.type === ActivityTypes.OpenWaterSwimming) &&
      (!activity.getStat(DataSWOLF25m.type) || !activity.getStat(DataSWOLF50m.type)) &&
      (<DataSpeedAvg>activity.getStat(DataSpeedAvg.type))?.getValue() &&
      (<DataStrokeRateAvg>activity.getStat(DataStrokeRateAvg.type))?.getValue()
    ) {
      const avgPace100m = convertSpeedToSwimPace((<DataSpeedAvg>activity.getStat(DataSpeedAvg.type)).getValue());
      const avgStrokeRate = (<DataStrokeRateAvg>activity.getStat(DataStrokeRateAvg.type)).getValue();

      if (!activity.getStat(DataSWOLF25m.type)) {
        const swolf25m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgStrokeRate, 25);
        activity.addStat(new DataSWOLF25m(swolf25m));
      }

      if (!activity.getStat(DataSWOLF50m.type)) {
        const swolf50m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgStrokeRate, 50);
        activity.addStat(new DataSWOLF50m(swolf50m));
      }
    }

    if (fileActiveDuration.get(activity) === null) {
      // Contradictory file timing is unavailable, not zero or elapsed time. This
      // survives repeated same-instance generation without persisting evidence.
      for (const type of [
        DataDuration.type,
        DataTimerTime.type,
        DataPause.type,
        DataMovingTime.type,
        DataPowerWork.type
      ]) {
        activity.removeStat(type);
      }
      return;
    }

    let durationStat = activity.getDuration();
    if (!durationStat) {
      durationStat = new DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000);
      activity.setDuration(durationStat);
    }

    // If timer time not set, then assign elapsed time by default (e.g. GPX file dont support timer time)
    if (!activity.getStat(DataTimerTime.type)) {
      activity.addStat(new DataTimerTime(this.round(durationStat.getValue(), 2)));
    }

    // Preserve recorded moving time; use complete nonoverlapping source laps or observed speed intervals.
    if (!activity.getStat(DataMovingTime.type)) {
      const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type))?.getValue();
      const laps = activity.getLaps().slice().sort((a, b) => +a.startDate - +b.startDate);
      const completeLaps = laps.length > 0 && +laps[0].startDate === +activity.startDate &&
        +laps[laps.length - 1].endDate === +activity.endDate && laps.every((lap, index) => {
        const value = lap.getStat(DataMovingTime.type)?.getValue();
        return typeof value === 'number' && Number.isFinite(value) && value >= 0 &&
          value <= (+lap.endDate - +lap.startDate) / 1000 &&
          (index === 0 || +lap.startDate === +laps[index - 1].endDate);
      });
      let movingTime: number | null = completeLaps
        ? laps.reduce((sum, lap) => sum + (lap.getStat(DataMovingTime.type)!.getValue() as number), 0) : null;
      if (movingTime === null || movingTime > timerTime) {
        const speed = activity.getAllStreams().find(stream => stream.type === DataSpeed.type);
        movingTime = speed ? movingSeconds(activity, speed, ActivityTypesMoving.getSpeedThreshold(activity.type)) : null;
      }
      // Zero is a valid stationary result. Unsupported movement is not timer time.
      if (movingTime !== null && Number.isFinite(movingTime) && movingTime <= timerTime) {
        activity.addStat(new DataMovingTime(movingTime));
      }
    }

    // If there is no pause defined, derive it from explicit paused time semantics: elapsed - timer.
    if (!activity.getStat(DataPause.type)) {
      const elapsedTimeStat = <DataElapsedTime>activity.getStat(DataElapsedTime.type);
      const timerTimeStat = <DataTimerTime>activity.getStat(DataTimerTime.type);

      let pauseTime = 0;
      if (
        elapsedTimeStat &&
        isNumber(elapsedTimeStat.getValue()) &&
        timerTimeStat &&
        isNumber(timerTimeStat.getValue())
      ) {
        pauseTime = elapsedTimeStat.getValue() - timerTimeStat.getValue();
      } else {
        const movingTimeStat = <DataMovingTime>activity.getStat(DataMovingTime.type);
        pauseTime =
          movingTimeStat && movingTimeStat.getValue()
            ? durationStat.getValue() - movingTimeStat.getValue()
            : 0;
      }

      activity.addStat(new DataPause(this.round(Math.max(pauseTime, 0), 2)));
    }
  }
}
