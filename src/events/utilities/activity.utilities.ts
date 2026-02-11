import { ActivityInterface } from '../../activities/activity.interface';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataCadence } from '../../data/data.cadence';
import { DataSpeed } from '../../data/data.speed';
import { DataWeight } from '../../data/data.weight';
import { DataVerticalSpeed } from '../../data/data.vertical-speed';
import { DataTemperature } from '../../data/data.temperature';
import { DataAbsolutePressure } from '../../data/data.absolute-pressure';
import { DataEVPE } from '../../data/data.evpe';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataSatellite5BestSNR } from '../../data/data.satellite-5-best-snr';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataNumberOfSatellites } from '../../data/data.number-of-satellites';
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
  convertSwimPaceToSwimPacePer100Yard,
  isNumber,
  isNumberOrString,
  medianFilter,
  standardDeviation
} from './helpers';
import { DataLongitudeDegrees } from '../../data/data.longitude-degrees';
import { StreamDataItem, StreamInterface } from '../../streams/stream.interface';
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
import { DataRightBalance } from '../../data/data.right-balance';
import { DataLeftBalance } from '../../data/data.left-balance';
import { DataPowerRight } from '../../data/data.power-right';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAirPower } from '../../data/data.air-power';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataLegStiffness } from '../../data/data.leg-stiffness';
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
import { DataGroundContactTime } from '../../data/data.ground-contact-time';
import { DataGroundContactTimeAvg } from '../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataGroundContactTimeBalanceLeft } from '../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../data/data-ground-contact-time-balance-right';
import { DataVerticalOscillation } from '../../data/data.vertical-oscillation';
import { DataVerticalOscillationAvg } from '../../data/data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataVerticalRatio } from '../../data/data.vertical-ratio';
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
  ActivityTypeGroups,
  ActivityTypes,
  ActivityTypesHelper,
  ActivityTypesMoving
} from '../../activities/activity.types';
import { DataMovingTime } from '../../data/data.moving-time';
import { StatsClassInterface } from '../../stats/stats.class.interface';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataNumber } from '../../data/data.number';
import { DataAltitudeSmooth } from '../../data/data.altitude-smooth';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataSWOLF25m } from '../../data/data.swolf-25m';
import { DataSWOLF50m } from '../../data/data.swolf-50m';

import { LowPassFilter } from './grade-calculator/low-pass-filter';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataPowerWork } from '../../data/data.power-work';
import { GradeCalculator } from './grade-calculator/grade-calculator';
import { DataVO2Max } from '../../data/data.vo2-max';
import { DataTotalGrit } from '../../data/data.total-grit';
import { DataTotalFlow } from '../../data/data.total-flow';
import { DataJumpCount } from '../../data/data.jump-count';
import { DataPowerCurve, DataPowerCurvePoint } from '../../data/data.power-curve';

// @ts-ignore
import KalmanFilter from 'kalmanjs';

/* Configure filtering values */
// Altitude stream
const ALTITUDE_SPIKES_FILTER_WIN = 3;

// Fix abnormal streams
const SPEED_STREAM_STD_DEV_THRESHOLD_DEFAULT = 25 / 3.6; // Kph to mps
const SPEED_STREAM_STD_DEV_THRESHOLD_MAP = new Map<ActivityTypeGroups, number>([
  [ActivityTypeGroups.Running, 15 / 3.6], // kph to m/s
  [ActivityTypeGroups.Cycling, 27 / 3.6], // kph to m/s
  [ActivityTypeGroups.Swimming, 5 / 3.6] // kph to m/s
]);

export class ActivityUtilities {
  private static geoLibAdapter = new GeoLibAdapter();
  private static readonly FTP_DURATION_SECONDS = 1200;
  private static readonly FTP_FACTOR = 0.95;

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
    const data = <number[]>activity.getSquashedStreamData(streamType, startDate, endDate);
    return data[0];
  }

  public static getDataTypeLast(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date
  ): number {
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
   * Crops left,right on time.
   * Start and end date need to be relative to the activity start / end time
   * @param activity
   * @param startDate
   * @param endDate
   */
  public static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface {
    activity.getAllStreams().forEach(stream => {
      // Get the data for the range specified
      const trimmedStreamData = activity.getStreamData(stream.type, startDate, endDate);
      activity.removeStream(stream);
      activity.addStream(new Stream(stream.type, trimmedStreamData));
    });

    activity.startDate = startDate || activity.startDate;
    activity.endDate = endDate || activity.endDate;
    // debugger
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

  public static generateMissingStreamsAndStatsForActivity(activity: ActivityInterface): void {
    this.generateMissingStreams(activity);
    this.fixAbnormalStreamData(activity);
    this.generateMissingStatsForActivity(activity);
    this.generateMissingSpeedDerivedStatsForActivity(activity);
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

  public static getSummaryStatsForActivities(activities: ActivityInterface[]): DataInterface[] {
    const stats: DataInterface[] = [];
    // If only one
    if (activities.length === 1) {
      return activities[0].getStatsAsArray();
    }

    let duration = 0;
    let ascent = 0;
    let descent = 0;
    let energy = 0;
    let distance = 0;
    let pauseTime = 0;
    let averageHeartRate = 0;
    let averagePower = 0;
    let averageCadence = 0;
    let averageSpeed = 0;
    let averageGradeAdjustedSpeed = 0;
    let averagePace = 0;
    let averageGradeAdjustedPace = 0;
    let averageSwimPace = 0;
    let averageTemperature = 0;
    let averageAbsolutePressure = 0;
    let averageEVPE = 0;
    let hasAverageEVPE = false;
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
    let averageFeeling = 0;
    let averageRPE = 0;

    // Sum Duration
    activities.forEach(activity => {
      duration += activity.getDuration().getValue();
    });
    stats.push(new DataDuration(duration));

    // Sum pause time
    activities.forEach(activity => {
      pauseTime += activity.getPause().getValue();
    });
    stats.push(new DataPause(pauseTime));

    // Sum Distance
    activities.forEach(activity => {
      distance += activity.getDistance().getValue();
    });
    stats.push(new DataDistance(distance));

    // Sum ascent
    activities.forEach(activity => {
      const activityAscent = activity.getStat(DataAscent.type);
      if (activityAscent) {
        ascent += <number>activityAscent.getValue();
      }
    });
    stats.push(new DataAscent(ascent));

    // Sum descent
    activities.forEach(activity => {
      const activityDescent = activity.getStat(DataDescent.type);
      if (activityDescent) {
        descent += <number>activityDescent.getValue();
      }
    });
    stats.push(new DataDescent(descent));

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
    activities.forEach(activity => {
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
    activities.forEach(activity => {
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

    // Sum Moving Time
    let movingTime = 0;
    activities.forEach(activity => {
      const activityMovingTime = activity.getStat(DataMovingTime.type);
      if (activityMovingTime) {
        movingTime += <number>activityMovingTime.getValue();
      }
    });
    if (movingTime) {
      stats.push(new DataMovingTime(movingTime));
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

    // Max Altitude
    let maxAltitude = -Infinity;
    activities.forEach(activity => {
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
    activities.forEach(activity => {
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
        minPace = Math.min(minPace, <number>activityMinPace.getValue());
      }
    });
    if (minPace !== Infinity) {
      stats.push(new DataPaceMin(minPace));
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
        minGradeAdjustedPace = Math.min(minGradeAdjustedPace, <number>activityMinGradeAdjustedPace.getValue());
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
        minSwimPace = Math.min(minSwimPace, <number>activityMinSwimPace.getValue());
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
    activities.forEach(activity => {
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
    activities.forEach(activity => {
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
    let averageVerticalOscillation = 0;
    activities.forEach(activity => {
      const activityVerticalOscillation = activity.getStat(DataVerticalOscillationAvg.type);
      if (activityVerticalOscillation) {
        averageVerticalOscillation = averageVerticalOscillation
          ? (averageVerticalOscillation + <number>activityVerticalOscillation.getValue()) / 2
          : <number>activityVerticalOscillation.getValue();
      }
    });
    if (averageVerticalOscillation) {
      stats.push(new DataVerticalOscillationAvg(averageVerticalOscillation));
    }

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
        // Threshold & Endurance (15m - 5h)
        900, 1200, 1500, 1800, 2400, 3600, 5400, 7200, 10800, 14400, 18000
      ];
    }

    const powerData = activity.getStreamData(DataPower.type);
    const curvePoints: DataPowerCurvePoint[] = [];

    // Get user weight for W/kg calculation
    const weightStat = activity.getStat(DataWeight.type);
    const weight = weightStat ? <number>weightStat.getValue() : null;

    // Sort durations to ensure consistent processing order, though not strictly necessary
    const sortedDurations = [...durations].sort((a, b) => a - b);

    for (const duration of sortedDurations) {
      if (duration <= 0 || duration > powerData.length) {
        continue;
      }

      let maxAvgPower = 0;
      let currentSum = 0;

      // Helper to treat null as 0
      const getValue = (val: number | null) => (typeof val === 'number' ? val : 0);

      // Initial window
      for (let i = 0; i < duration; i++) {
        currentSum += getValue(powerData[i]);
      }
      maxAvgPower = currentSum / duration;

      // Slide window
      for (let i = duration; i < powerData.length; i++) {
        currentSum = currentSum - getValue(powerData[i - duration]) + getValue(powerData[i]);
        const currentAvg = currentSum / duration;
        if (currentAvg > maxAvgPower) {
          maxAvgPower = currentAvg;
        }
      }

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

  /**
   * Calculate Critical Power (CP) and W' (Anaerobic Work Capacity)
   * using the Monod & Scherrer 2-parameter model (Power vs 1/Time).
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
    const unitStreamTypesToCreate = unitStreamTypes || [
      ...DynamicDataLoader.allUnitDerivedDataTypes,
      ...DynamicDataLoader.speedDerivedDataTypes
    ];

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
      baseUnitStream =>
        unitStreamTypesToCreate.indexOf(baseUnitStream.type) !== -1 && streams.indexOf(baseUnitStream) === -1
    );

    if (options.includeUnitVariants === false) {
      return startWith;
    }

    return Object.keys(DynamicDataLoader.dataTypeUnitGroups).reduce((array: StreamInterface[], baseDataType) => {
      const baseStream = baseUnitStreams.find(stream => stream.type === baseDataType);
      if (!baseStream) {
        return array;
      }
      const unitStreams = Object.keys(DynamicDataLoader.dataTypeUnitGroups[baseDataType])
        .filter(unitBasedDataType => unitStreamTypesToCreate.indexOf(unitBasedDataType) !== -1) // @todo perhaps dont filter
        .map(unitBasedDataType => {
          return new Stream(
            unitBasedDataType,
            baseStream.getData().map(dataValue => {
              if (!isNumber(dataValue)) {
                return null;
              }
              return DynamicDataLoader.dataTypeUnitGroups[baseDataType][unitBasedDataType](<number>dataValue);
            })
          );
        });
      return array.concat(unitStreams);
    }, startWith);
  }

  /**
   * Generates missing streams for an activity such as distance etc if they are missing
   * This will always create a steam even if the distance is 0
   * @param activity
   */
  public static generateMissingStreamsForActivity(activity: ActivityInterface): ActivityInterface {
    // Create derived primitive streams which will be needed for others streams & stats computations
    this.createDerivedStreams(activity);

    // First add any missing data to the streams via interpolating and extrapolating
    this.addMissingDataToStreams(activity);

    if (
      activity.hasStreamData(DataLatitudeDegrees.type) &&
      activity.hasStreamData(DataLongitudeDegrees.type) &&
      (!activity.hasStreamData(DataDistance.type) || !activity.hasStreamData(DataGNSSDistance.type))
    ) {
      const streamData = activity.createStream(DataDistance.type).getData(); // Creating does not add it to activity just presets the resolution to 1s
      let distance = 0;
      streamData[0] = distance; // Force first distance sample to be equal to 0 instead of null
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
        });

      if (!activity.hasStreamData(DataDistance.type)) {
        activity.addStream(new Stream(DataDistance.type, streamData));
      }

      if (!activity.hasStreamData(DataGNSSDistance.type)) {
        activity.addStream(new Stream(DataGNSSDistance.type, streamData));
      }

      if (!activity.hasStreamData(DataSpeed.type)) {
        const speedStreamData = activity.createStream(DataSpeed.type).getData();
        const distanceStream = activity.getStreamDataByDuration(DataDistance.type);
        let previousDistanceItem: StreamDataItem;
        distanceStream.forEach((distanceItem: StreamDataItem, index: number) => {
          // Use the first distance item value if previous distance is unknown
          if (!previousDistanceItem) {
            previousDistanceItem = distanceItem;
          }

          // If know distance then compute speed from last known distance item
          if (Number.isFinite(distanceItem.value)) {
            const deltaTime = (distanceItem.time - previousDistanceItem.time) / 1000;
            const deltaDistance = distanceItem?.value ? distanceItem.value - (previousDistanceItem?.value || 0) : 0;

            speedStreamData[index] = this.round(deltaTime > 0 ? deltaDistance / deltaTime : 0, 3);

            // Keep tracking of last know distance item
            previousDistanceItem = distanceItem;
          } else {
            speedStreamData[index] = null;
          }
        });
        activity.addStream(new Stream(DataSpeed.type, speedStreamData));
      }
    }

    // Check if we can get a grade stream
    if (
      activity.parseOptions?.streams?.smooth?.grade &&
      !activity.hasStreamData(DataGrade.type) &&
      activity.hasStreamData(DataDistance.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      const distanceData = activity.getStreamData(DataDistance.type);
      const altitudeData = activity.getStreamData(
        activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
      );

      // Create the grade stream from time, distance and altitude non-squashed streams
      const timeData = activity.generateTimeStream([DataDistance.type]);
      const gradeStreamData = GradeCalculator.computeGradeStream(timeData.getData(), distanceData, altitudeData);

      // Append new grade stream to activity
      activity.addStream(new Stream(DataGrade.type, gradeStreamData));

      if (activity.parseOptions?.streams?.smooth?.gradeSmooth) {
        // Duplicate and create an altitude smooth stream (we want to keep original altitude stream available)
        // Activity stats and grade adjusted speed will be computed on the smoothed altitude stream
        this.cloneStream(activity, DataGrade.type, DataGradeSmooth.type);

        // Smooth grade computed stream
        this.shapeStream(DataGradeSmooth.type, activity, squashedGradeData => {
          // Grade stream
          const GRADE_KALMAN_SMOOTHING = {
            R: 0.01, // Grade model is stable
            Q: 0.5 // Grade measurement error which can be expected
          };

          // Predict proper grade values
          const kf = new KalmanFilter(GRADE_KALMAN_SMOOTHING);
          return squashedGradeData.map(v => (v === null ? null : kf.filter(v)));
        });
      }
    }

    // Get a grade adjusted speed (the model applies to running only)
    if (
      (ActivityTypesHelper.getActivityGroupForActivityType(activity.type) === ActivityTypeGroups.Running ||
        ActivityTypesHelper.getActivityGroupForActivityType(activity.type) === ActivityTypeGroups.TrailRunning) &&
      !activity.hasStreamData(DataGradeAdjustedSpeed.type) &&
      activity.hasStreamData(DataGradeSmooth.type) &&
      activity.hasStreamData(DataSpeed.type)
    ) {
      const speedStreamData = activity.getStreamData(DataSpeed.type);
      const gradeStreamData = activity.getStreamData(DataGradeSmooth.type);
      const gradeAdjustedSpeedData = speedStreamData.map((value, index) =>
        value === null ? null : this.round(GradeCalculator.estimateAdjustedSpeed(value, gradeStreamData[index] || 0), 2)
      );

      // Ensure first grade adjusted pace dont start with 0 (it's common) meaning infinity
      if (!gradeAdjustedSpeedData[0]) {
        const firstKnownValue = gradeAdjustedSpeedData.find(v => (v as number) > 0);
        gradeAdjustedSpeedData[0] = firstKnownValue ? firstKnownValue : gradeAdjustedSpeedData[0];
      }

      activity.addStream(new Stream(DataGradeAdjustedSpeed.type, gradeAdjustedSpeedData));
    }

    if (
      activity.hasStreamData(DataPower.type) &&
      activity.hasStreamData(DataRightBalance.type) &&
      !activity.hasStreamData(DataPowerRight.type)
    ) {
      const rightPowerStream = activity.createStream(DataPowerRight.type);
      const powerStreamData = activity.getStreamData(DataPower.type);
      const rightBalanceStreamData = activity.getStreamData(DataRightBalance.type);
      rightPowerStream.setData(
        rightBalanceStreamData.reduce((accu: (number | null)[], streamData, index) => {
          const powerStreamDataItem = powerStreamData[index];
          if (streamData === null || !powerStreamData || powerStreamDataItem === null) {
            return accu;
          }
          accu[index] = (streamData / 100) * powerStreamDataItem;
          return accu;
        }, [])
      );
      activity.addStream(rightPowerStream);
    }

    if (
      activity.hasStreamData(DataPower.type) &&
      activity.hasStreamData(DataLeftBalance.type) &&
      !activity.hasStreamData(DataPowerLeft.type)
    ) {
      const leftPowerStream = activity.createStream(DataPowerLeft.type);
      const powerStreamData = activity.getStreamData(DataPower.type);
      const leftBalanceStreamData = activity.getStreamData(DataLeftBalance.type);
      leftPowerStream.setData(
        leftBalanceStreamData.reduce((accu: (number | null)[], streamData, index) => {
          const powerStreamDataItem = powerStreamData[index];
          if (streamData === null || !powerStreamData || powerStreamDataItem === null) {
            return accu;
          }
          accu[index] = (streamData / 100) * powerStreamDataItem;
          return accu;
        }, [])
      );
      activity.addStream(leftPowerStream);
    }

    // If left stance time stream available, then add the right balance stream too
    if (
      activity.hasStreamData(DataStanceTimeBalanceLeft.type) &&
      !activity.hasStreamData(DataStanceTimeBalanceRight.type)
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
    let streamDataByDuration = activity.getStreamDataByDuration(streamType, true, true);

    // Shape data along function param
    const streamData = shapeStreamData(streamDataByDuration.map(item => item.value) as number[]);

    // Update streamDataByDuration with shaped data
    streamDataByDuration = streamDataByDuration.map((item: StreamDataItem, index: number) => {
      item.value = streamData[index];
      return item;
    });

    // Rebuild/replace stream with new shaped value
    activity.removeStream(streamType);
    activity.addStream(activity.createStream(streamType));

    const activityStartTime = activity.startDate.getTime();
    streamDataByDuration.forEach(item => {
      activity.addDataToStream(streamType, new Date(activityStartTime + item.time), item.value as number);
    });
  }

  public static cloneStream(activity: ActivityInterface, sourceStreamType: string, targetStreamType: string): void {
    const sourceStream = activity.getStream(sourceStreamType);
    const targetStream = activity.createStream(targetStreamType);
    targetStream.setData(Array.from(sourceStream.getData())); // Shallow copy data to new stream
    activity.addStream(targetStream);
  }

  /**
   * Create derived primitive streams which will be needed for others streams & stats computations
   * @param activity
   */
  public static createDerivedStreams(activity: ActivityInterface): ActivityInterface {
    if (
      activity.parseOptions?.streams?.smooth?.altitudeSmooth &&
      activity.hasStreamData(DataAltitude.type) &&
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

  /**
   * Back and forth fills an activity's stream data so they can be more "tree" like
   * It does this for:
   *
   *  [DataAltitude.type,
   * DataHeartRate.type,
   * DataCadence.type,
   * DataDistance.type]
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
      DataDistance.type
      // DataSpeed.type, @todo should we be backfilling speed?
    ];
    // First generate the time stream
    const timeStream = activity.generateTimeStream();
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
      .filter(stream => streamTypesToBackAndForthFill.indexOf(stream.type) !== -1)
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

  /**
   * Andrew Coggan weighted power compute method
   * 1) starting at the 30s mark, calculate a rolling 30 s average (of the preceding time points, obviously).
   * 2) raise all the values obtained in step #1 to the 4th power.
   * 3) take the average of all of the values obtained in step #2.
   * 4) take the 4th root of the value obtained in step #3.
   * (And when you get tired of exporting every file to, e.g., Excel to perform such calculations, help develop a program
   * like WKO+ to do the work for you <g>.)
   */
  private static computeNormalizedPower(powerArray: number[], timeArray: number[]): number {
    const WEIGHTED_WATTS_TIME_BUFFER = 30; // Seconds

    const poweredWeightedWatts = [];

    let accumulatedTimeInBuffer = 0; // seconds
    let wattsInBuffer = [];

    for (const [index, current] of timeArray.entries()) {
      if (index === 0) {
        continue;
      }

      wattsInBuffer.push(powerArray[index]);

      if (accumulatedTimeInBuffer >= WEIGHTED_WATTS_TIME_BUFFER) {
        const meanWatts = this.getAverage(wattsInBuffer);

        if (Number.isFinite(meanWatts)) {
          poweredWeightedWatts.push(Math.pow(meanWatts, 4));
        }

        // Reset
        accumulatedTimeInBuffer = 0;
        wattsInBuffer = [];
      }

      accumulatedTimeInBuffer += current - timeArray[index - 1];
    }

    return Math.sqrt(Math.sqrt(this.getAverage(poweredWeightedWatts)));
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
      activity.addStat(
        new DataGNSSDistance(
          activity.getSquashedStreamData(DataGNSSDistance.type)[
            activity.getSquashedStreamData(DataGNSSDistance.type).length - 1
          ]
        )
      );
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
    // Altitude Max
    if (
      !activity.getStat(DataAltitudeMax.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      activity.addStat(
        new DataAltitudeMax(
          this.getDataTypeMax(
            activity,
            activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
          )
        )
      );
    }
    // Altitude Min
    if (
      !activity.getStat(DataAltitudeMin.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      activity.addStat(
        new DataAltitudeMin(
          this.getDataTypeMin(
            activity,
            activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
          )
        )
      );
    }
    // Altitude Avg
    if (
      !activity.getStat(DataAltitudeAvg.type) &&
      (activity.hasStreamData(DataAltitudeSmooth.type) || activity.hasStreamData(DataAltitude.type))
    ) {
      activity.addStat(
        new DataAltitudeAvg(
          this.getDataTypeAvg(
            activity,
            activity.hasStreamData(DataAltitudeSmooth.type) ? DataAltitudeSmooth.type : DataAltitude.type
          )
        )
      );
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

    // Heart Rate  Max
    if (!activity.getStat(DataHeartRateMax.type) && activity.hasStreamData(DataHeartRate.type)) {
      activity.addStat(new DataHeartRateMax(this.getDataTypeMax(activity, DataHeartRate.type)));
    }
    // Heart Rate Min
    if (!activity.getStat(DataHeartRateMin.type) && activity.hasStreamData(DataHeartRate.type)) {
      activity.addStat(new DataHeartRateMin(this.getDataTypeMin(activity, DataHeartRate.type)));
    }
    // Heart Rate Avg
    if (!activity.getStat(DataHeartRateAvg.type) && activity.hasStreamData(DataHeartRate.type)) {
      activity.addStat(new DataHeartRateAvg(this.round(this.getDataTypeAvg(activity, DataHeartRate.type))));
    }
    // Cadence Max
    if (!activity.getStat(DataCadenceMax.type) && activity.hasStreamData(DataCadence.type)) {
      activity.addStat(new DataCadenceMax(this.getDataTypeMax(activity, DataCadence.type)));
    }
    // Cadence Min
    if (!activity.getStat(DataCadenceMin.type) && activity.hasStreamData(DataCadence.type)) {
      // Get min cadence except 0. A 0 cadence is not meaningful.
      const minCadenceOver = 0;
      activity.addStat(
        new DataCadenceMin(this.getDataTypeMin(activity, DataCadence.type, undefined, undefined, minCadenceOver))
      );
    }
    // Cadence Avg
    if (!activity.getStat(DataCadenceAvg.type) && activity.hasStreamData(DataCadence.type)) {
      // Get avg cadence except 0 values. Platforms like garmin/strava don't include 0 cadences in their averages.
      const avgCadenceOver = 0;
      const avgCadence = this.getDataTypeAvg(activity, DataCadence.type, undefined, undefined, avgCadenceOver);
      activity.addStat(new DataCadenceAvg(this.round(avgCadence)));
    }

    // Speed Max
    if (!activity.getStat(DataSpeedMax.type) && activity.hasStreamData(DataSpeed.type)) {
      activity.addStat(new DataSpeedMax(this.getDataTypeMax(activity, DataSpeed.type)));
    }
    // Speed Min
    if (!activity.getStat(DataSpeedMin.type) && activity.hasStreamData(DataSpeed.type)) {
      activity.addStat(new DataSpeedMin(this.getDataTypeMin(activity, DataSpeed.type)));
    }
    // Speed Avg
    if (!activity.getStat(DataSpeedAvg.type) && activity.hasStreamData(DataSpeed.type)) {
      activity.addStat(new DataSpeedAvg(this.getDataTypeAvg(activity, DataSpeed.type)));
    }

    // Grade Adjusted Speed Max
    if (!activity.getStat(DataGradeAdjustedSpeedMax.type) && activity.hasStreamData(DataGradeAdjustedSpeed.type)) {
      activity.addStat(new DataGradeAdjustedSpeedMax(this.getDataTypeMax(activity, DataGradeAdjustedSpeed.type)));
    }
    // Grade Adjusted Speed Min
    if (!activity.getStat(DataGradeAdjustedSpeedMin.type) && activity.hasStreamData(DataGradeAdjustedSpeed.type)) {
      activity.addStat(new DataGradeAdjustedSpeedMin(this.getDataTypeMin(activity, DataGradeAdjustedSpeed.type)));
    }
    // Grade Adjusted Speed Avg
    if (!activity.getStat(DataGradeAdjustedSpeedAvg.type) && activity.hasStreamData(DataGradeAdjustedSpeed.type)) {
      activity.addStat(new DataGradeAdjustedSpeedAvg(this.getDataTypeAvg(activity, DataGradeAdjustedSpeed.type)));
    }

    // Grade Max/Min/Avg (prefer smoothed grade when available)
    const gradeStreamType = activity.hasStreamData(DataGradeSmooth.type)
      ? DataGradeSmooth.type
      : activity.hasStreamData(DataGrade.type)
        ? DataGrade.type
        : null;
    if (gradeStreamType) {
      if (!activity.getStat(DataGradeMax.type)) {
        activity.addStat(new DataGradeMax(this.getDataTypeMax(activity, gradeStreamType)));
      }
      if (!activity.getStat(DataGradeMin.type)) {
        activity.addStat(new DataGradeMin(this.getDataTypeMin(activity, gradeStreamType)));
      }
      if (!activity.getStat(DataGradeAvg.type)) {
        activity.addStat(new DataGradeAvg(this.getDataTypeAvg(activity, gradeStreamType)));
      }
    }

    // Vertical Speed Max
    if (!activity.getStat(DataVerticalSpeedMax.type) && activity.hasStreamData(DataVerticalSpeed.type)) {
      activity.addStat(new DataVerticalSpeedMax(this.getDataTypeMax(activity, DataVerticalSpeed.type)));
    }
    // Vertical Speed Min
    if (!activity.getStat(DataVerticalSpeedMin.type) && activity.hasStreamData(DataVerticalSpeed.type)) {
      activity.addStat(new DataVerticalSpeedMin(this.getDataTypeMin(activity, DataVerticalSpeed.type)));
    }
    // Vertical Speed Avg
    if (!activity.getStat(DataVerticalSpeedAvg.type) && activity.hasStreamData(DataVerticalSpeed.type)) {
      activity.addStat(new DataVerticalSpeedAvg(this.getDataTypeAvg(activity, DataVerticalSpeed.type)));
    }
    // Power Max
    if (!activity.getStat(DataPowerMax.type) && activity.hasStreamData(DataPower.type)) {
      activity.addStat(new DataPowerMax(this.getDataTypeMax(activity, DataPower.type)));
    }
    // Power Min
    if (!activity.getStat(DataPowerMin.type) && activity.hasStreamData(DataPower.type)) {
      activity.addStat(new DataPowerMin(this.getDataTypeMin(activity, DataPower.type)));
    }
    // Power AVG
    if (!activity.getStat(DataPowerAvg.type) && activity.hasStreamData(DataPower.type)) {
      activity.addStat(new DataPowerAvg(this.getDataTypeAvg(activity, DataPower.type)));
    }

    // Power Normalized
    if (!activity.getStat(DataPowerNormalized.type) && activity.hasStreamData(DataPower.type)) {
      const powerDurationStream = activity.getStreamDataByDuration(DataPower.type, true, true);
      const timeStream = powerDurationStream.map(item => item.time / 1000) as number[];
      const powerStream = powerDurationStream.map(item => item.value) as number[];
      const normalizedPower = this.computeNormalizedPower(powerStream, timeStream);
      activity.addStat(new DataPowerNormalized(normalizedPower));
    }

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
      const ftp = this.calculateFTP(activity);
      if (ftp) {
        activity.addStat(ftp);
      }
    }

    // Critical Power & W'
    // calculateCriticalPowerAndWPrime requires DataPowerCurve to be present (which we just added if missing)
    if (
      (!activity.getStat(DataCriticalPower.type) || !activity.getStat(DataWPrime.type)) &&
      activity.getStat(DataPowerCurve.type)
    ) {
      const cpWPrime = this.calculateCriticalPowerAndWPrime(activity);
      if (cpWPrime) {
        activity.addStat(cpWPrime.cp);
        activity.addStat(cpWPrime.wPrime);
      }
    }

    // Air AirPower Max
    if (!activity.getStat(DataAirPowerMax.type) && activity.hasStreamData(DataAirPower.type)) {
      activity.addStat(new DataAirPowerMax(this.getDataTypeMax(activity, DataAirPower.type)));
    }
    // Air AirPower Min
    if (!activity.getStat(DataAirPowerMin.type) && activity.hasStreamData(DataAirPower.type)) {
      activity.addStat(new DataAirPowerMin(this.getDataTypeMin(activity, DataAirPower.type)));
    }
    // Air AirPower AVG
    if (!activity.getStat(DataAirPowerAvg.type) && activity.hasStreamData(DataAirPower.type)) {
      activity.addStat(new DataAirPowerAvg(this.getDataTypeAvg(activity, DataAirPower.type)));
    }

    // Absolute Pressure Max
    if (!activity.getStat(DataAbsolutePressureMax.type) && activity.hasStreamData(DataAbsolutePressure.type)) {
      activity.addStat(new DataAbsolutePressureMax(this.getDataTypeMax(activity, DataAbsolutePressure.type)));
    }
    // Absolute Pressure Min
    if (!activity.getStat(DataAbsolutePressureMin.type) && activity.hasStreamData(DataAbsolutePressure.type)) {
      activity.addStat(new DataAbsolutePressureMin(this.getDataTypeMin(activity, DataAbsolutePressure.type)));
    }
    // Absolute Pressure Avg
    if (!activity.getStat(DataAbsolutePressureAvg.type) && activity.hasStreamData(DataAbsolutePressure.type)) {
      activity.addStat(new DataAbsolutePressureAvg(this.getDataTypeAvg(activity, DataAbsolutePressure.type)));
    }

    // EVPE Max
    if (!activity.getStat(DataEVPEMax.type) && activity.hasStreamData(DataEVPE.type)) {
      activity.addStat(new DataEVPEMax(this.getDataTypeMax(activity, DataEVPE.type)));
    }
    // EVPE Min
    if (!activity.getStat(DataEVPEMin.type) && activity.hasStreamData(DataEVPE.type)) {
      activity.addStat(new DataEVPEMin(this.getDataTypeMin(activity, DataEVPE.type)));
    }
    // EVPE Avg
    if (!activity.getStat(DataEVPEAvg.type) && activity.hasStreamData(DataEVPE.type)) {
      activity.addStat(new DataEVPEAvg(this.getDataTypeAvg(activity, DataEVPE.type)));
    }

    // Satellite 5 Best SNR Max
    if (!activity.getStat(DataSatellite5BestSNRMax.type) && activity.hasStreamData(DataSatellite5BestSNR.type)) {
      activity.addStat(new DataSatellite5BestSNRMax(this.getDataTypeMax(activity, DataSatellite5BestSNR.type)));
    }
    // Satellite 5 Best SNR Min
    if (!activity.getStat(DataSatellite5BestSNRMin.type) && activity.hasStreamData(DataSatellite5BestSNR.type)) {
      activity.addStat(new DataSatellite5BestSNRMin(this.getDataTypeMin(activity, DataSatellite5BestSNR.type)));
    }
    // Satellite 5 Best SNR Avg
    if (!activity.getStat(DataSatellite5BestSNRAvg.type) && activity.hasStreamData(DataSatellite5BestSNR.type)) {
      activity.addStat(new DataSatellite5BestSNRAvg(this.getDataTypeAvg(activity, DataSatellite5BestSNR.type)));
    }

    // Number of Satellites Max
    if (!activity.getStat(DataNumberOfSatellitesMax.type) && activity.hasStreamData(DataNumberOfSatellites.type)) {
      activity.addStat(new DataNumberOfSatellitesMax(this.getDataTypeMax(activity, DataNumberOfSatellites.type)));
    }
    // Number of Satellites Min
    if (!activity.getStat(DataNumberOfSatellitesMin.type) && activity.hasStreamData(DataNumberOfSatellites.type)) {
      activity.addStat(new DataNumberOfSatellitesMin(this.getDataTypeMin(activity, DataNumberOfSatellites.type)));
    }
    // Number of Satellites Avg
    if (!activity.getStat(DataNumberOfSatellitesAvg.type) && activity.hasStreamData(DataNumberOfSatellites.type)) {
      activity.addStat(new DataNumberOfSatellitesAvg(this.getDataTypeAvg(activity, DataNumberOfSatellites.type)));
    }

    // Temperature Max
    if (!activity.getStat(DataTemperatureMax.type) && activity.hasStreamData(DataTemperature.type)) {
      activity.addStat(new DataTemperatureMax(this.getDataTypeMax(activity, DataTemperature.type)));
    }
    // Temperature Min
    if (!activity.getStat(DataTemperatureMin.type) && activity.hasStreamData(DataTemperature.type)) {
      activity.addStat(new DataTemperatureMin(this.getDataTypeMin(activity, DataTemperature.type)));
    }
    // Temperature Avg
    if (!activity.getStat(DataTemperatureAvg.type) && activity.hasStreamData(DataTemperature.type)) {
      activity.addStat(new DataTemperatureAvg(this.getDataTypeAvg(activity, DataTemperature.type)));
    }

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

    // Assign L/R balance from streams if exists
    if (!activity.getStat(DataRightBalance.type) && activity.hasStreamData(DataRightBalance.type)) {
      const avgRightBalance = this.round(this.getDataTypeAvg(activity, DataRightBalance.type), 2);
      activity.addStat(new DataRightBalance(avgRightBalance));
      activity.addStat(new DataLeftBalance(100 - avgRightBalance));
    }

    // Assign L/R balance stance time from streams if exists
    if (
      !activity.getStat(DataGroundContactTimeBalanceLeft.type) &&
      activity.hasStreamData(DataGroundContactTimeBalanceLeft.type)
    ) {
      const avgStanceTimeLeftBalance = this.round(
        this.getDataTypeAvg(activity, DataGroundContactTimeBalanceLeft.type),
        2
      );
      activity.addStat(new DataGroundContactTimeBalanceLeft(avgStanceTimeLeftBalance));
      activity.addStat(new DataGroundContactTimeBalanceRight(100 - avgStanceTimeLeftBalance));
    }

    // Backward compatibility for Stance Time Balance
    if (!activity.getStat(DataStanceTimeBalanceLeft.type) && activity.hasStreamData(DataStanceTimeBalanceLeft.type)) {
      const avgStanceTimeLeftBalance = this.round(this.getDataTypeAvg(activity, DataStanceTimeBalanceLeft.type), 2);
      activity.addStat(new DataStanceTimeBalanceLeft(avgStanceTimeLeftBalance));
      activity.addStat(new DataStanceTimeBalanceRight(100 - avgStanceTimeLeftBalance));
    }

    // Ground Contact Time
    if (!activity.getStat(DataGroundContactTimeMax.type) && activity.hasStreamData(DataGroundContactTime.type)) {
      activity.addStat(new DataGroundContactTimeMax(this.getDataTypeMax(activity, DataGroundContactTime.type)));
    }
    if (!activity.getStat(DataGroundContactTimeMin.type) && activity.hasStreamData(DataGroundContactTime.type)) {
      activity.addStat(new DataGroundContactTimeMin(this.getDataTypeMin(activity, DataGroundContactTime.type)));
    }
    if (!activity.getStat(DataGroundContactTimeAvg.type) && activity.hasStreamData(DataGroundContactTime.type)) {
      activity.addStat(new DataGroundContactTimeAvg(this.getDataTypeAvg(activity, DataGroundContactTime.type)));
    }

    // Leg Stiffness
    if (!activity.getStat(DataLegStiffnessMax.type) && activity.hasStreamData(DataLegStiffness.type)) {
      activity.addStat(new DataLegStiffnessMax(this.getDataTypeMax(activity, DataLegStiffness.type)));
    }
    if (!activity.getStat(DataLegStiffnessMin.type) && activity.hasStreamData(DataLegStiffness.type)) {
      activity.addStat(new DataLegStiffnessMin(this.getDataTypeMin(activity, DataLegStiffness.type)));
    }
    if (!activity.getStat(DataLegStiffnessAvg.type) && activity.hasStreamData(DataLegStiffness.type)) {
      activity.addStat(new DataLegStiffnessAvg(this.getDataTypeAvg(activity, DataLegStiffness.type)));
    }

    // Vertical Oscillation
    if (!activity.getStat(DataVerticalOscillationMax.type) && activity.hasStreamData(DataVerticalOscillation.type)) {
      activity.addStat(new DataVerticalOscillationMax(this.getDataTypeMax(activity, DataVerticalOscillation.type)));
    }
    if (!activity.getStat(DataVerticalOscillationMin.type) && activity.hasStreamData(DataVerticalOscillation.type)) {
      activity.addStat(new DataVerticalOscillationMin(this.getDataTypeMin(activity, DataVerticalOscillation.type)));
    }
    if (!activity.getStat(DataVerticalOscillationAvg.type) && activity.hasStreamData(DataVerticalOscillation.type)) {
      activity.addStat(new DataVerticalOscillationAvg(this.getDataTypeAvg(activity, DataVerticalOscillation.type)));
    }

    // Vertical Ratio
    if (!activity.getStat(DataVerticalRatioMax.type) && activity.hasStreamData(DataVerticalRatio.type)) {
      activity.addStat(new DataVerticalRatioMax(this.getDataTypeMax(activity, DataVerticalRatio.type)));
    }
    if (!activity.getStat(DataVerticalRatioMin.type) && activity.hasStreamData(DataVerticalRatio.type)) {
      activity.addStat(new DataVerticalRatioMin(this.getDataTypeMin(activity, DataVerticalRatio.type)));
    }
    if (!activity.getStat(DataVerticalRatioAvg.type) && activity.hasStreamData(DataVerticalRatio.type)) {
      activity.addStat(new DataVerticalRatioAvg(this.getDataTypeAvg(activity, DataVerticalRatio.type)));
    }
  }

  private static generateMissingSpeedDerivedStatsForActivity(activity: ActivityInterface) {
    // Pace
    const speedMax = activity.getStat(DataSpeedMax.type);
    if (speedMax && !activity.getStat(DataPaceMax.type)) {
      activity.addStat(new DataPaceMax(convertSpeedToPace(<number>speedMax.getValue())));
    }
    const speedMin = activity.getStat(DataSpeedMin.type);
    if (speedMin && !activity.getStat(DataPaceMin.type)) {
      activity.addStat(new DataPaceMin(convertSpeedToPace(<number>speedMin.getValue())));
    }
    const speedAvg = activity.getStat(DataSpeedAvg.type);
    if (speedAvg && !activity.getStat(DataPaceAvg.type)) {
      activity.addStat(new DataPaceAvg(convertSpeedToPace(<number>speedAvg.getValue())));
    }
    // GAP
    const gradeAdjustedSpeedMax = activity.getStat(DataGradeAdjustedSpeedMax.type);
    if (gradeAdjustedSpeedMax && !activity.getStat(DataGradeAdjustedPaceMax.type)) {
      const targetAdjustedSpeed: number =
        (<DataGradeAdjustedSpeedMax>gradeAdjustedSpeedMax).getValue() < (<DataSpeedMax>speedMax).getValue()
          ? (<DataSpeedMax>speedMax).getValue()
          : (<DataGradeAdjustedSpeedMax>gradeAdjustedSpeedMax).getValue();

      activity.addStat(new DataGradeAdjustedPaceMax(convertSpeedToPace(targetAdjustedSpeed)));
    }
    const gradeAdjustedSpeedMin = activity.getStat(DataGradeAdjustedSpeedMin.type);
    if (gradeAdjustedSpeedMin && !activity.getStat(DataGradeAdjustedPaceMin.type)) {
      const targetAdjustedSpeed: number =
        (<DataGradeAdjustedSpeedMin>gradeAdjustedSpeedMin).getValue() < (<DataSpeedMin>speedMin).getValue()
          ? (<DataSpeedMin>speedMin).getValue()
          : (<DataGradeAdjustedSpeedMin>gradeAdjustedSpeedMin).getValue();

      activity.addStat(new DataGradeAdjustedPaceMin(convertSpeedToPace(targetAdjustedSpeed)));
    }
    const gradeAdjustedSpeedAvg = activity.getStat(DataGradeAdjustedSpeedAvg.type);
    if (gradeAdjustedSpeedAvg && !activity.getStat(DataGradeAdjustedPaceAvg.type)) {
      const targetAdjustedSpeed: number =
        (<DataGradeAdjustedSpeedAvg>gradeAdjustedSpeedAvg).getValue() < (<DataSpeedAvg>speedAvg).getValue()
          ? (<DataSpeedAvg>speedAvg).getValue()
          : (<DataGradeAdjustedSpeedAvg>gradeAdjustedSpeedAvg).getValue();

      activity.addStat(new DataGradeAdjustedPaceAvg(convertSpeedToPace(targetAdjustedSpeed)));
    }

    // Swim Pace
    if (speedMax && !activity.getStat(DataSwimPaceMax.type)) {
      activity.addStat(new DataSwimPaceMax(convertSpeedToSwimPace(<number>speedMax.getValue())));
    }
    if (speedMin && !activity.getStat(DataSwimPaceMin.type)) {
      activity.addStat(new DataSwimPaceMin(convertSpeedToSwimPace(<number>speedMin.getValue())));
    }
    if (speedAvg && !activity.getStat(DataSwimPaceAvg.type)) {
      activity.addStat(new DataSwimPaceAvg(convertSpeedToSwimPace(<number>speedAvg.getValue())));
    }
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
    if (!activity.getStat(DataVerticalSpeedAvgFeetPerSecond.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerMinute.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgMetersPerMinute(
            convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedAvg.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerMinute.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedAvg.getValue()))
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgKilometerPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(
          new DataVerticalSpeedAvgKilometerPerHour(
            convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedAvg.getValue())
          )
        );
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMilesPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
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
      (<DataCadenceAvg>activity.getStat(DataCadenceAvg.type))?.getValue()
    ) {
      const avgPace100m = 100 / (<DataSpeedAvg>activity.getStat(DataSpeedAvg.type)).getValue();
      const avgCadence = (<DataCadenceAvg>activity.getStat(DataCadenceAvg.type)).getValue();

      if (!activity.getStat(DataSWOLF25m.type)) {
        const swolf25m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgCadence, 25);
        activity.addStat(new DataSWOLF25m(swolf25m));
      }

      if (!activity.getStat(DataSWOLF50m.type)) {
        const swolf50m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgCadence, 50);
        activity.addStat(new DataSWOLF50m(swolf50m));
      }
    }

    if (!activity.getStat(DataDuration.type)) {
      activity.addStat(new DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000));
    }

    // If timer time not set, then assign elapsed time by default (e.g. GPX file dont support timer time)
    if (!activity.getStat(DataTimerTime.type)) {
      activity.addStat(new DataTimerTime(this.round(activity.getDuration().getValue(), 2)));
    }

    // If missing moving time
    // Or moving time equals duration, then try to build real moving from laps if available
    if (!activity.getStat(DataMovingTime.type)) {
      let movingTime = 0;

      // First try to compute moving time from laps
      const laps = activity.getLaps();
      if (laps && laps.length > 0) {
        activity.getLaps().forEach(lap => {
          const stat = <DataMovingTime>lap.getStat(DataMovingTime.type);
          if (stat) {
            movingTime += stat.getValue();
          }
        });
      }

      // Get timer time...
      const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type))?.getValue();

      // ... and compare with moving time and determine if moving time is like "moving time"
      const isMovingTimeAlike = movingTime > 0 && movingTime < timerTime;

      // If moving time from laps is not valid
      if (!isMovingTimeAlike && activity.hasStreamData(DataSpeed.type)) {
        // ...then re-compute moving time but using global records.
        movingTime = 0;
        const speedByDurationStream = activity.getStreamDataByDuration(DataSpeed.type, true, true);

        const speedThreshold = ActivityTypesMoving.getSpeedThreshold(activity.type);
        speedByDurationStream.forEach((speedItem: StreamDataItem, index: number) => {
          if (speedItem.value !== null && speedItem.value > speedThreshold) {
            movingTime += (speedByDurationStream[index].time - (speedByDurationStream[index - 1]?.time || 0)) / 1000;
          }
        });
      }

      // In case moving time would be invalid, set it to timer time "at max"
      if (!movingTime || movingTime > timerTime) {
        movingTime = timerTime;
      }

      activity.addStat(new DataMovingTime(movingTime));
    }

    // Add Power Work if missing when avg power and moving time are available
    if (
      !activity.getStat(DataPowerWork.type) &&
      activity.getStat(DataPowerAvg.type) &&
      activity.getStat(DataMovingTime.type)
    ) {
      const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
      const avgPower = (<DataPowerAvg>activity.getStat(DataPowerAvg.type)).getValue();
      const powerWork = Math.round((avgPower * movingTime) / 1000);

      activity.addStat(new DataPowerWork(powerWork));
    }

    // If there is no pause defined then get it from duration and moving time (if available)
    if (!activity.getStat(DataPause.type) || !(<DataPause>activity.getStat(DataPause.type)).getValue()) {
      const movingTimeStat = <DataMovingTime>activity.getStat(DataMovingTime.type);
      const pauseTime =
        movingTimeStat && movingTimeStat.getValue() ? activity.getDuration().getValue() - movingTimeStat.getValue() : 0;
      activity.addStat(new DataPause(this.round(pauseTime, 2)));
    }
  }
}
