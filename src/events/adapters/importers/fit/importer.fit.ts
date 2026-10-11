import { coalesceFitRecords } from './fit-records';
import { fileHeartRateCalibration, fileFunctionalThresholdPower, fileActiveDuration } from '../../../utilities/tss/tss-evaluation';
import { captureRecordedPowerEvidence } from '../../../utilities/tss/recorded-power-evidence';
import { resolveFitFunctionalThresholdPower } from './fit-power-calibration';
import { resolveFitHeartRateCalibration } from './fit-hr-calibration';
import { DataTrainingStressScoreMethod, TrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';
import { Event } from '../../../event';
import { Activity } from '../../../../activities/activity';
import { SwimLength } from '../../../../swim-lengths/swim-length';
import { Lap } from '../../../../laps/lap';
import { EventInterface } from '../../../event.interface';
import { CreatorInterface } from '../../../../creators/creator.interface';
import {
  ActivityTypeGroups,
  ActivityTypes,
  ActivityTypesHelper,
  ActivityTypesMoving
} from '../../../../activities/activity.types';
import {
  DiveGasMode,
  DiveGasRecord,
  DiveGasStatus,
  DiveMessageIndex,
  DiveTankSummaryRecord,
  DiveTankUpdateRecord
} from '../../../../activities/dive-source-records';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataEnergy } from '../../../../data/data.energy';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { LapInterface } from '../../../../laps/lap.interface';
import { DataDistance } from '../../../../data/data.distance';
import { getFitSportName, getFitSubSportName } from 'fit-file-parser/profile';
import { DataPause } from '../../../../data/data.pause';
import { DataIntensity } from '../../../../data/data.intensity';
import { DataInterface } from '../../../../data/data.interface';
import { DataStrokeRate } from '../../../../data/data.stroke-rate';
import { DataCadenceAvg } from '../../../../data/data.cadence-avg';
import { DataPowerAvg } from '../../../../data/data.power-avg';
import { DataSpeedAvg } from '../../../../data/data.speed-avg';
import { DataCadenceMax } from '../../../../data/data.cadence-max';
import { DataPowerMax } from '../../../../data/data.power-max';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataHeartRateAvg } from '../../../../data/data.heart-rate-avg';
import { DataHeartRateMax } from '../../../../data/data.heart-rate-max';
import { DataSpeedMax } from '../../../../data/data.speed-max';
import { LapTypes } from '../../../../laps/lap.types';
import { DataHeartRateMin } from '../../../../data/data.heart-rate-min';
import { DataPowerMin } from '../../../../data/data.power-min';
import { DataAerobicTrainingEffect } from '../../../../data/data-aerobic-training-effect';
import { FITSampleMapper } from './importer.fit.mapper';
import { convertSpeedToPace, convertSpeedToSwimPace, isNumber, isNumberOrString } from '../../../utilities/helpers';
import { EventUtilities } from '../../../utilities/event.utilities';
import { IBIStream } from '../../../../streams/ibi-stream';
import { DeviceInterface } from '../../../../activities/devices/device.interface';
import { Device } from '../../../../activities/devices/device';
import { ImporterFitAntPlusDeviceNames } from '../../../../fit/device-names/importer.fit.ant-plus.device.names';
import { DataRecoveryTime } from '../../../../data/data.recovery-time';
import { DataPeakEPOC } from '../../../../data/data.peak-epoc';
import { DataFeeling } from '../../../../data/data.feeling';
import { DataTemperatureMax } from '../../../../data/data.temperature-max';
import { DataTemperatureMin } from '../../../../data/data.temperature-min';
import { DataTemperatureAvg } from '../../../../data/data.temperature-avg';
import { DataSpeedMin } from '../../../../data/data.speed-min';
import { DataCadenceMin } from '../../../../data/data.cadence-min';
import { DataSWOLF25m } from '../../../../data/data.swolf-25m';
import { DataDescription } from '../../../../data/data.description';
import { DataVO2Max } from '../../../../data/data.vo2-max';
import { IntensityZones } from '../../../../intensity-zones/intensity-zones';
import { IntensityZonesInterface } from '../../../../intensity-zones/intensity-zones.interface';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPower } from '../../../../data/data.power';
import { DataSpeed } from '../../../../data/data.speed';
import { DataHeartRateZoneOneDuration } from '../../../../data/data.heart-rate-zone-one-duration';
import { DataHeartRateZoneTwoDuration } from '../../../../data/data.heart-rate-zone-two-duration';
import { DataHeartRateZoneThreeDuration } from '../../../../data/data.heart-rate-zone-three-duration';
import { DataHeartRateZoneFourDuration } from '../../../../data/data.heart-rate-zone-four-duration';
import { DataHeartRateZoneFiveDuration } from '../../../../data/data.heart-rate-zone-five-duration';
import { DataHeartRateZoneSixDuration } from '../../../../data/data.heart-rate-zone-six-duration';
import { DataHeartRateZoneSevenDuration } from '../../../../data/data.heart-rate-zone-seven-duration';
import { DataPowerZoneOneDuration } from '../../../../data/data.power-zone-one-duration';
import { DataPowerZoneTwoDuration } from '../../../../data/data.power-zone-two-duration';
import { DataPowerZoneThreeDuration } from '../../../../data/data.power-zone-three-duration';
import { DataPowerZoneFourDuration } from '../../../../data/data.power-zone-four-duration';
import { DataPowerZoneFiveDuration } from '../../../../data/data.power-zone-five-duration';
import { DataPowerZoneSixDuration } from '../../../../data/data.power-zone-six-duration';
import { DataPowerZoneSevenDuration } from '../../../../data/data.power-zone-seven-duration';
import { DataSpeedZoneOneDuration } from '../../../../data/data.speed-zone-one-duration';
import { DataSpeedZoneTwoDuration } from '../../../../data/data.speed-zone-two-duration';
import { DataSpeedZoneThreeDuration } from '../../../../data/data.speed-zone-three-duration';
import { DataSpeedZoneFourDuration } from '../../../../data/data.speed-zone-four-duration';
import { DataSpeedZoneFiveDuration } from '../../../../data/data.speed-zone-five-duration';
import { DataSpeedZoneSixDuration } from '../../../../data/data.speed-zone-six-duration';
import { DataSpeedZoneSevenDuration } from '../../../../data/data.speed-zone-seven-duration';
import { EmptyEventLibError } from '../../../../errors/empty-event-sports-libs.error';
import { DataStartEvent } from '../../../../data/data.start-event';
import { DataStopEvent } from '../../../../data/data.stop-event';
import { DataStopAllEvent } from '../../../../data/data.stop-all-event';
import { DataMovingTime } from '../../../../data/data.moving-time';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataTotalCycles } from '../../../../data/data-total-cycles';
import { DataPoolLength } from '../../../../data/data.pool-length';
import { DataActiveLengths } from '../../../../data/data-active-lengths';
import { DataActiveLap } from '../../../../data/data-active-lap';
import { DataSWOLF50m } from '../../../../data/data.swolf-50m';
import { FileType } from '../../file-type.enum';
import { DataPowerTorqueEffectivenessLeft } from '../../../../data/data.power-torque-effectiveness-left';
import { DataPowerTorqueEffectivenessRight } from '../../../../data/data.power-torque-effectiveness-right';
import { DataPowerPedalSmoothnessLeft } from '../../../../data/data.power-pedal-smoothness-left';
import { DataPowerPedalSmoothnessRight } from '../../../../data/data.power-pedal-smoothness-right';
import { DataFTP } from '../../../../data/data.ftp';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../../../../data/data.power-intensity-factor';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataPowerWork } from '../../../../data/data.power-work';
import { DataCyclingStandingTime } from '../../../../data/data.cycling-standing-time';
import { DataCyclingSeatedTime } from '../../../../data/data.cycling-seated-time';
import { RiderPosition } from '../../../../data/data.cycling-position';
import { DataRiderPositionChangeEvent } from '../../../../data/data.rider-position-change-event';
import { DataGroundContactTimeAvg } from '../../../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeBalanceLeft } from '../../../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../../../data/data-ground-contact-time-balance-right';
import { DataGroundContactTimePercentageAvg } from '../../../../data/data.running-dynamics';
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataMetabolicCalories } from '../../../../data/data.metabolic-calories';
import {
  DataBottomTime,
  DataDepthAvg,
  DataDiveAscentRateAvg,
  DataDiveAscentRateMax,
  DataDiveAscentTime,
  DataDiveDescentRateAvg,
  DataDiveDescentRateMax,
  DataDiveDescentTime,
  DataDiveHangTime,
  DataDiveNumber,
  DataEndingCNSLoad,
  DataEndingN2Load,
  DataOxygenToxicity,
  DataPressureSACAvg,
  DataRMVAvg,
  DataStartingCNSLoad,
  DataStartingN2Load,
  DataSurfaceInterval,
  DataVolumeSACAvg
} from '../../../../data/data.dive';
import { DataEffortPaceAvg } from '../../../../data/data.effort-pace-avg';
import { DataAvgStrokeDistance } from '../../../../data/data.avg-stroke-distance';
import { DataAvgStrokeCount } from '../../../../data/data.avg-stroke-count';

import { DataVerticalOscillationAvg } from '../../../../data/data.vertical-oscillation-avg';
import { DataVerticalRatioAvg } from '../../../../data/data.vertical-ratio-avg';
import { DataAvgStrideLength } from '../../../../data/data.avg-stride-length';
import { DataAnaerobicTrainingEffect } from '../../../../data/data-anaerobic-training-effect';
import { DataAvgRespirationRate } from '../../../../data/data.avg-respiration-rate';
import { DataMaxRespirationRate } from '../../../../data/data.max-respiration-rate';
import { DataMinRespirationRate } from '../../../../data/data.min-respiration-rate';
import { DataJumpCount } from '../../../../data/data.jump-count';
import { DataTotalGrit } from '../../../../data/data.total-grit';
import { DataTotalFlow } from '../../../../data/data.total-flow';
import { DataAvgFlow } from '../../../../data/data.avg-flow';
import { DataEstSweatLoss } from '../../../../data/data.est-sweat-loss';
import { DataPrimaryBenefit } from '../../../../data/data.primary-benefit';
import { DataSportProfileName } from '../../../../data/data.sport-profile-name';
import { DataTrainingLoadPeak } from '../../../../data/data.training-load-peak';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataEndPosition } from '../../../../data/data.end-position';
import { DataStartPosition } from '../../../../data/data.start-position';

import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { DataPowerDown } from '../../../../data/data.power-down';
import { DataPowerUp } from '../../../../data/data.power-up';
import { FIT_DISTANCE_ELEVATION_GRADE_SUMMARY_AGGREGATIONS } from '../../../../fit/fit-summary-stat.aggregations';
import { FITCreatorMapper } from '../../../../fit/fit-creator.mapper';

import { DataWeight } from '../../../../data/data.weight';
import { DataHeight } from '../../../../data/data.height';
import { DataAge } from '../../../../data/data.age';
import { DataGender } from '../../../../data/data.gender';
import { DataAvgGrit } from '../../../../data/data.avg-grit';

import { DataJumpEvent } from '../../../../data/data.jump-event';
import { DataBatteryConsumption } from '../../../../data/data.battery-consumption';
import { DataBatteryLifeEstimation } from '../../../../data/data.battery-life-estimation';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataGradeMax } from '../../../../data/data.grade-max';
import {
  DataBeginningPotentialStamina,
  DataEndingPotentialStamina,
  DataStaminaMin
} from '../../../../data/data.stamina';

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
} from '../../../../data/data.jump-stats';
import { Buffer } from 'buffer';
import {
  getStreamSelectionFromOptions,
  isStreamTypeAllowedForImport,
  pruneActivityStreamsBySelection
} from '../../../../streams/stream.selection';
import { StreamInterface } from '../../../../streams/stream.interface';
import { StatsUtilities } from '../../../../stats/stats.utilities';
import { StatsClassInterface } from '../../../../stats/stats.class.interface';
import { SampleInfo } from '../sample-info.interface';
import { recordedPoolHeartRate } from '../../../../streams/recorded-pool-heart-rate';

// Threshold to detect that session.timestamp are not trustable (when exceeding 15% of session.total_elapsed_time)
const INVALID_DATES_ELAPSED_TIME_RATIO_THRESHOLD = 1.15;
const TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS = 1;

export class EventImporterFIT {
  private static readonly INVALID_FIT_HRV_INTERVAL_MS = 65535;
  private static readonly MIN_VALID_VO2_MAX = 10;
  private static readonly MAX_VALID_VO2_MAX = 100;

  private static addSampleStreamsToActivity(
    activity: ActivityInterface,
    samples: any[],
    sampleMappings: typeof FITSampleMapper,
    samplesInfo: SampleInfo
  ): void {
    const sampleIndexes = new Array<number>(samples.length);

    for (const sampleMapping of sampleMappings) {
      let stream: StreamInterface | undefined;
      let streamData: (number | null)[] | undefined;

      for (let samplePosition = 0; samplePosition < samples.length; samplePosition++) {
        if (!(samplePosition in samples)) {
          continue;
        }
        const value = sampleMapping.getSampleValue(samples[samplePosition], samplesInfo);
        if (!isNumber(value)) {
          continue;
        }

        if (!stream) {
          stream = activity.createStream(sampleMapping.dataType);
          streamData = stream.getData();
        }
        if (!(samplePosition in sampleIndexes)) {
          const timestamp = samples[samplePosition].timestamp;
          sampleIndexes[samplePosition] = activity.getDateIndex(
            timestamp instanceof Date ? timestamp : new Date(timestamp)
          );
        }
        streamData![sampleIndexes[samplePosition]] = value;
      }

      if (stream) {
        activity.addStream(stream);
      }
    }
  }

  /** Import file-scoped calibration and combine complementary records before
   * sensor padding. Recorded pool HR retains explicit dropout boundaries. */
  static async getFromArrayBuffer(
    arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>,
    options: ActivityParsingOptions = ActivityParsingOptions.DEFAULT,
    name = 'New Event'
  ): Promise<EventInterface> {
    const streamSelection = getStreamSelectionFromOptions(options);

    // @ts-ignore
    const { default: FitFileParser } = await import('fit-file-parser');
    return new Promise((resolve, reject) => {
      const fitFileParser = new FitFileParser({
        force: true,
        speedUnit: 'm/s',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: false,
        mode: 'both'
      });

      fitFileParser.parse(arrayBuffer, (error: any, fitDataObject: any) => {
        if (error) {
          // For now, assume any error from parser on this file means it's broken/empty in a way we treat as EmptyEventLibError
          // to satisfy existing tests. Or ideally we wrap in a generic EventLibError.
          // But test expects EmptyEventLibError.
          reject(new EmptyEventLibError());
          return;
        }
        if (!fitDataObject) {
          reject(new EmptyEventLibError());
          return;
        }

        this.normalizeFitDataObjectForActivities(fitDataObject);

        if (!fitDataObject.sessions.length) {
          reject(new EmptyEventLibError());
          return;
        }

        this.prepareSwimLengths(fitDataObject, options);
        this.normalizeSuuntoPoolLengths(fitDataObject);

        // Check for jumps data at the top level
        if (fitDataObject.jumps && fitDataObject.jumps.length > 0) {
          fitDataObject.sessions?.forEach((session: any) => {
            const sessionStartTime = new Date(session.start_time).getTime();
            const sessionEndTime = sessionStartTime + (session.total_elapsed_time || 0) * 1000;

            session.jumps = fitDataObject.jumps.filter((jump: any) => {
              const jumpTime = new Date(jump.timestamp).getTime();
              return jumpTime >= sessionStartTime && jumpTime < sessionEndTime;
            });
          });
        }

        const allowedSampleMappings = FITSampleMapper.filter(sampleMapping =>
          isStreamTypeAllowedForImport(sampleMapping.dataType, streamSelection)
        );

        // Resolve every session's bounds before assigning records. A timestamp
        // shared by adjacent legs belongs to the starting leg; overlapping
        // interiors cannot establish an owner and must not feed both streams.
        const sourceTimings = fitDataObject.sessions.map((session: any) => ({
          timer: session.total_timer_time, elapsed: session.total_elapsed_time
        }));
        const sessionActivities: ActivityInterface[] = fitDataObject.sessions.map((session: any, index: number) =>
          this.getActivityFromSessionObject(session, fitDataObject, options, index));
        const sessionRecords = this.getSessionRecords(fitDataObject.records, sessionActivities);

        // Iterate over the sessions and create their activities
        const createActivity = (sessionObject: any, sessionIndex: number): ActivityInterface => {
          // Keep the original timing evidence before legacy date/timer normalization.
          const sourceTiming = sourceTimings[sessionIndex];
          // Get the activity from the sessionObject
          const activity = sessionActivities[sessionIndex];
          this.addDiveSummaryStats(activity, this.getReferencedDiveSummary(fitDataObject, 'session', sessionObject));
          this.addDiveSourceRecords(activity, fitDataObject);
          // Go over the laps
          sessionObject.laps.forEach((sessionLapObject: any, index: number) => {
            const lap = this.getLapFromSessionLapObject(sessionLapObject, activity, index, options);
            this.addDiveSummaryStats(lap, this.getReferencedDiveSummary(fitDataObject, 'lap', sessionLapObject));
            activity.addLap(lap);
          });

          const manufacturer =
            (fitDataObject.file_ids && fitDataObject.file_ids[0] && fitDataObject.file_ids[0].manufacturer) || '';
          const zoneIndexOffset = manufacturer === 'garmin' ? 1 : 0;

          // Go over the hr zone info
          if (sessionObject.time_in_hr_zone && sessionObject.time_in_hr_zone.length) {
            // Add the stats
            if (isNumber(sessionObject.time_in_hr_zone[0 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneOneDuration(sessionObject.time_in_hr_zone[0 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[1 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneTwoDuration(sessionObject.time_in_hr_zone[1 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[2 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneThreeDuration(sessionObject.time_in_hr_zone[2 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[3 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneFourDuration(sessionObject.time_in_hr_zone[3 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[4 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneFiveDuration(sessionObject.time_in_hr_zone[4 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[5 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneSixDuration(sessionObject.time_in_hr_zone[5 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_hr_zone[6 + zoneIndexOffset])) {
              activity.addStat(new DataHeartRateZoneSevenDuration(sessionObject.time_in_hr_zone[6 + zoneIndexOffset]));
            }

            const hrIntensityZones = this.createIntensityZonesFromFitZones(
              DataHeartRate.type,
              sessionObject.time_in_hr_zone,
              zoneIndexOffset,
              sessionObject.hr_zone_high_boundary,
              255
            );
            activity.intensityZones.push(hrIntensityZones);
          }

          // Go over the power zone info
          if (sessionObject.time_in_power_zone && sessionObject.time_in_power_zone.length) {
            if (isNumber(sessionObject.time_in_power_zone[0 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneOneDuration(sessionObject.time_in_power_zone[0 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[1 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneTwoDuration(sessionObject.time_in_power_zone[1 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[2 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneThreeDuration(sessionObject.time_in_power_zone[2 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[3 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneFourDuration(sessionObject.time_in_power_zone[3 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[4 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneFiveDuration(sessionObject.time_in_power_zone[4 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[5 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneSixDuration(sessionObject.time_in_power_zone[5 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_power_zone[6 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneSevenDuration(sessionObject.time_in_power_zone[6 + zoneIndexOffset]));
            }

            const powerIntensityZones = this.createIntensityZonesFromFitZones(
              DataPower.type,
              sessionObject.time_in_power_zone,
              zoneIndexOffset,
              sessionObject.power_zone_high_boundary,
              65535
            );
            activity.intensityZones.push(powerIntensityZones);
          }

          // Go over the speed zone info
          if (sessionObject.time_in_speed_zone && sessionObject.time_in_speed_zone.length) {
            if (isNumber(sessionObject.time_in_speed_zone[0 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneOneDuration(sessionObject.time_in_speed_zone[0 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[1 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneTwoDuration(sessionObject.time_in_speed_zone[1 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[2 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneThreeDuration(sessionObject.time_in_speed_zone[2 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[3 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneFourDuration(sessionObject.time_in_speed_zone[3 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[4 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneFiveDuration(sessionObject.time_in_speed_zone[4 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[5 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneSixDuration(sessionObject.time_in_speed_zone[5 + zoneIndexOffset]));
            }
            if (isNumber(sessionObject.time_in_speed_zone[6 + zoneIndexOffset])) {
              activity.addStat(new DataSpeedZoneSevenDuration(sessionObject.time_in_speed_zone[6 + zoneIndexOffset]));
            }

            const speedIntensityZones = new IntensityZones(DataSpeed.type);
            speedIntensityZones.zone1Duration = sessionObject.time_in_speed_zone[0 + zoneIndexOffset] || 0;
            speedIntensityZones.zone2Duration = sessionObject.time_in_speed_zone[1 + zoneIndexOffset] || 0;
            speedIntensityZones.zone3Duration = sessionObject.time_in_speed_zone[2 + zoneIndexOffset] || 0;
            speedIntensityZones.zone4Duration = sessionObject.time_in_speed_zone[3 + zoneIndexOffset] || 0;
            speedIntensityZones.zone5Duration = sessionObject.time_in_speed_zone[4 + zoneIndexOffset] || 0;
            speedIntensityZones.zone6Duration = sessionObject.time_in_speed_zone[5 + zoneIndexOffset] || 0;
            speedIntensityZones.zone7Duration = sessionObject.time_in_speed_zone[6 + zoneIndexOffset] || 0;
            activity.intensityZones.push(speedIntensityZones);
          }

          // Add the events
          fitDataObject.events
            .filter((activityEvent: FITFileActivityEvent) => {
              return activityEvent.timestamp >= activity.startDate && activityEvent.timestamp <= activity.endDate;
            })
            .forEach((activityEvent: FITFileActivityEvent) => {
              if (activityEvent.event === 'timer') {
                switch (activityEvent.event_type) {
                  case 'start':
                    activity.addEvent(new DataStartEvent(activity.getDateIndex(activityEvent.timestamp)));
                    break;
                  case 'stop':
                  case 'stop_disable':
                    activity.addEvent(new DataStopEvent(activity.getDateIndex(activityEvent.timestamp)));
                    break;
                  case 'stop_all':
                  case 'stop_disable_all':
                    activity.addEvent(new DataStopAllEvent(activity.getDateIndex(activityEvent.timestamp)));
                    break;
                  default:
                    break;
                }
              } else if (activityEvent.event === 'power_down') {
                activity.addEvent(new DataPowerDown(activity.getDateIndex(activityEvent.timestamp)));
              } else if (activityEvent.event === 'power_up') {
                activity.addEvent(new DataPowerUp(activity.getDateIndex(activityEvent.timestamp)));
              } else if (activityEvent.event === 'rider_position_change') {
                const positionChange = activityEvent.data as RiderPosition;
                if (
                  positionChange === RiderPosition.SEATED ||
                  positionChange === RiderPosition.STANDING ||
                  positionChange === RiderPosition.TRANSITION_TO_SEATED ||
                  positionChange === RiderPosition.TRANSITION_TO_STANDING
                ) {
                  activity.addEvent(
                    new DataRiderPositionChangeEvent(activity.getDateIndex(activityEvent.timestamp), positionChange)
                  );
                }
              }
            });

          this.reconcileInitialTimerState(activity, fitDataObject, sourceTiming);
          this.restoreMissingTimerDuration(activity, fitDataObject, sourceTiming, sessionActivities);

          // Add jumps
          if (fitDataObject.jumps && fitDataObject.jumps.length) {
            fitDataObject.jumps
              .filter((jump: any) => {
                const timestamp = new Date(jump.timestamp);
                // Relaxed check for jumps as they might be recorded slightly outside session stats or have timezone offsets
                const margin = 24 * 60 * 60 * 1000; // 24 hours
                return (
                  timestamp.getTime() >= activity.startDate.getTime() - margin &&
                  timestamp.getTime() <= activity.endDate.getTime() + margin
                );
              })
              .forEach((jump: any) => {
                activity.addEvent(
                  new DataJumpEvent(activity.getDateIndex(jump.timestamp), {
                    distance: jump.distance,
                    height: jump.height,
                    score: jump.score,
                    hang_time: jump.hang_time,
                    position_lat: jump.position_lat,
                    position_long: jump.position_long,
                    speed: jump.speed,
                    rotations: jump.rotations
                  })
                );
              });
          }

          // Pool files can contain both lengths and real HR records. Retain the
          // existing length-derived swim streams, but never replace recorded HR
          // with lap averages or use those averages to fill a partial HR stream.
          const isLengthsBased = this.isLengthsBased(sessionObject);
          const recordedSamples = coalesceFitRecords(sessionRecords[sessionIndex]);
          captureRecordedPowerEvidence(activity, recordedSamples);
          // Once a real HR stream exists, keep explicit zero/invalid observations
          // as coverage boundaries too. Dropping them bridges sensor dropouts.
          const hasRecordedHeartRate = (isLengthsBased || sessionObject.lengths?.length) && recordedSamples.some((record: any) =>
            Number.isFinite(record.heart_rate) && record.heart_rate > 0);
          const recordedHeartRate = hasRecordedHeartRate ? recordedSamples.filter((record: any) =>
            record.heart_rate !== undefined && record.heart_rate !== null) : [];
          const samples = isLengthsBased ? this.generateSamplesFromLengths(sessionObject, options) : recordedSamples;

          // Setup sample info which could be use when getting sample values
          const hasPowerMeter =
            samples.findIndex((sample: any) =>
              Number.isFinite(
                isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power
              )
            ) !== -1;
          const samplesInfo = { hasPowerMeter: hasPowerMeter };
          // Single-lap files previously used their records directly. Keep those
          // recorded stream types and use newly supported lengths only for missing types.
          const recordedHasPower = recordedSamples.some((sample: any) =>
            Number.isFinite(isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power));
          const preserveRecordedTypes = isLengthsBased && sessionObject.laps.filter((lap: any) => lap.lengths?.length).length === 1;
          const missingGeneratedDistance = isLengthsBased && !samples.some((sample: any) => Number.isFinite(sample.distance));
          const recordedMappings = isLengthsBased ? allowedSampleMappings.filter(mapping =>
            mapping.dataType !== DataHeartRate.type &&
            (preserveRecordedTypes || (mapping.dataType === DataDistance.type && missingGeneratedDistance)) &&
            recordedSamples.some((sample: any) => isNumber(mapping.getSampleValue(sample, { hasPowerMeter: recordedHasPower })))) : [];
          this.addSampleStreamsToActivity(activity, samples, allowedSampleMappings.filter(mapping =>
            !(recordedHeartRate.length && mapping.dataType === DataHeartRate.type) && !recordedMappings.includes(mapping)), samplesInfo);
          if (recordedMappings.length) {
            this.addSampleStreamsToActivity(activity, recordedSamples, recordedMappings, { hasPowerMeter: recordedHasPower });
          }
          if (recordedHeartRate.length) {
            this.addSampleStreamsToActivity(activity, recordedHeartRate,
              allowedSampleMappings.filter(mapping => mapping.dataType === DataHeartRate.type), samplesInfo);
            recordedPoolHeartRate.add(activity);
          }

          return activity;
        };
        const activities: ActivityInterface[] = fitDataObject.sessions.map(createActivity);

        // If there are no activities to parse ....
        if (!activities.length) {
          reject(new EmptyEventLibError());
          return;
        }
        // Get the HRV to IBI if exist
        if (fitDataObject.hrv && fitDataObject.hrv.length) {
          activities.forEach((activity: ActivityInterface) => {
            const ibiData = this.getIBIDataForActivity(fitDataObject.hrv, activities[0].startDate, activity);
            // set the IBI
            activity.addStream(new IBIStream(ibiData));
          });
        }

        // Parse the device infos
        if (fitDataObject.device_infos && fitDataObject.device_infos.length) {
          const fitDeviceInfos = fitDataObject.device_infos;
          activities.forEach(activity => {
            const { activityDeviceInfos, timedActivityDeviceInfos } = this.selectActivityDeviceInfos(
              fitDeviceInfos,
              activity.startDate,
              activity.endDate
            );

            /**
             * FIT `device_info` often repeats the same device identity every second with only timestamp changing.
             *
             * - `raw`: keep all rows for backwards compatibility.
             * - `changes`: keep first+last sample for each per-device run where all fields except timestamp match.
             */
            if (options.deviceInfoMode === 'changes') {
              activity.creator.devices = this.compactDeviceInfosByRuns(
                this.mapDeviceInfosToDevices(activityDeviceInfos)
              );
            } else {
              activity.creator.devices = this.mapDeviceInfosToDevices(fitDeviceInfos);
            }

            // Compute battery consumption & estimation
            // We focus on the device that has recorded the activity (usually index 0 or source_type 'local')
            // Group by device index to track individual devices
            const deviceGroups = new Map<number, any[]>();
            timedActivityDeviceInfos.forEach((di: any) => {
              // Default to index 0 if undefined
              const index = di.device_index !== undefined ? di.device_index : 0;
              if (!deviceGroups.has(index)) {
                deviceGroups.set(index, []);
              }
              deviceGroups.get(index)?.push(di);
            });

            // Iterate over devices to find the one with battery data drain
            // We prioritize device index 0 (main unit) but will look at others if 0 has no data
            // or if it's the only one with significant data.
            // For now, let's look for the main recording device (index 0).
            const mainDeviceInfos = deviceGroups.get(0) || deviceGroups.get(1); // Sometimes 1? usually 0.

            if (mainDeviceInfos && mainDeviceInfos.length >= 2) {
              const startInfo = mainDeviceInfos[0];
              const endInfo = mainDeviceInfos[mainDeviceInfos.length - 1];

              const getLevel = (d: any) =>
                isNumber(d.battery_level) ? d.battery_level : isNumber(d.battery_soc) ? d.battery_soc : null;

              const startLevel = getLevel(startInfo);
              const endLevel = getLevel(endInfo);

              if (startLevel !== null && endLevel !== null && startLevel > endLevel) {
                const consumption = startLevel - endLevel;
                activity.addStat(new DataBatteryConsumption(consumption));

                const duration =
                  (new Date(endInfo.timestamp).getTime() - new Date(startInfo.timestamp).getTime()) / 1000;
                if (duration > 0 && consumption > 0) {
                  const estimatedTotalLife = (duration / consumption) * 100;
                  activity.addStat(new DataBatteryLifeEstimation(Math.round(estimatedTotalLife)));
                }
              }
            }
          });
        }

        // Create an event
        // @todo check if the start and end date can derive from the file
        const event = new Event(name, activities[0].startDate, activities[activities.length - 1].endDate, FileType.FIT);
        activities.forEach(activity => event.addActivity(activity));
        // debugger;
        EventUtilities.generateStatsForAll(event);
        event.getActivities().forEach(activity => {
          pruneActivityStreamsBySelection(activity, streamSelection);
        });
        // debugger;
        resolve(event);
      });
    });
  }

  /**
   * Tell if an activity is lengths based (e.g. Pool swimming activities)
   * @param sessionObject
   * @private
   */
  private static isLengthsBased(sessionObject: any): boolean {
    return sessionObject.laps?.some((lap: any) => lap.lengths?.length) ?? false;
  }

  private static getSessionRecords(records: any[], activities: ActivityInterface[]): any[][] {
    const result: any[][] = activities.map(() => []);
    const windows = activities.map((activity, index) => ({ activity, index }));
    for (const record of records) {
      const timestamp = +record.timestamp;
      if (!Number.isFinite(timestamp)) continue;
      const candidates = windows.filter(({ activity }) =>
        timestamp >= +activity.startDate && timestamp <= +activity.endDate);
      // Retain an inclusive endpoint for a single/final leg. Only remove closing
      // candidates when another leg actually starts at this exact timestamp.
      const owners = candidates.some(({ activity }) => +activity.startDate === timestamp)
        ? candidates.filter(({ activity }) => +activity.endDate !== timestamp || +activity.startDate === timestamp)
        : candidates;
      if (owners.length === 1) result[owners[0].index].push(record);
    }
    return result;
  }

  /** Missing/zero summary timers are often placeholders. Recover active time
   * only from a complete, conflict-free timer timeline anchored at this leg's
   * start. Do not infer a missing restart or move a pause between sport legs. */
  private static restoreMissingTimerDuration(
    activity: ActivityInterface, file: any, sourceTiming: { timer: unknown; elapsed: unknown },
    activities: ActivityInterface[]
  ): void {
    if (sourceTiming.timer !== undefined && sourceTiming.timer !== null && sourceTiming.timer !== 0) return;
    const duration = (+activity.endDate - +activity.startDate) / 1000;
    if (!Number.isFinite(duration) || duration <= 0 ||
        (typeof sourceTiming.elapsed === 'number' && Number.isFinite(sourceTiming.elapsed) && sourceTiming.elapsed > 0 &&
          Math.abs(duration - sourceTiming.elapsed) > TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS)) return;
    // Global timer events cannot be assigned to one session when interiors overlap.
    if (activities.some(other => other !== activity &&
      +other.startDate < +activity.endDate && +other.endDate > +activity.startDate)) return;
    const events = (file.events as FITFileActivityEvent[]).filter(event => event.event === 'timer' &&
      +event.timestamp >= +activity.startDate && +event.timestamp < +activity.endDate)
      .slice().sort((left, right) => +left.timestamp - +right.timestamp);
    if (!events.length || +events[0].timestamp !== +activity.startDate || events.some(event =>
      !['start', 'stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(event.event_type))) return;
    if (events.some((event, index) => index > 0 && +event.timestamp === +events[index - 1].timestamp &&
      (event.event_type === 'start') !== (events[index - 1].event_type === 'start'))) return;
    // A stop shared with a preceding leg may be followed by an implicit restart.
    // Without a supplied timer summary, it cannot prove this whole leg paused.
    if (events[0].event_type !== 'start' && activities.some(other => other !== activity &&
      +other.startDate < +activity.startDate && +other.endDate <= +activity.startDate)) return;
    let running = events[0].event_type === 'start', previous = 0, active = 0;
    for (const event of events) {
      const time = (+event.timestamp - +activity.startDate) / 1000;
      if (running) active += time - previous;
      previous = time;
      running = event.event_type === 'start';
    }
    if (running) active += duration - previous;
    const timer = Math.round(active * 100) / 100;
    fileActiveDuration.set(activity, timer);
    activity.addStat(new DataTimerTime(timer));
    activity.addStat(new DataDuration(timer));
    activity.addStat(new DataPause(Math.round((duration - active) * 100) / 100));
  }

  private static getSessionTimeInZone(file: any, session: any, sessionIndex: number): any | undefined {
    const indexValue = (value: any): unknown => value !== null && typeof value === 'object' ? value.value : value;
    const sessionId = indexValue(session.message_index) ?? sessionIndex;
    if (!Number.isInteger(sessionId) || (sessionId as number) < 0) return undefined;
    const sessions: any[] = file.sessions ?? [];
    if (sessions.filter((entry, index) => (indexValue(entry.message_index) ?? index) === sessionId).length !== 1) {
      return undefined;
    }
    const matches = (file.time_in_zone ?? []).filter((row: any) =>
      (row.reference_mesg === 'session' || row.reference_mesg === 18) &&
      (indexValue(row.reference_index) === sessionId || (row.reference_index === undefined && sessions.length === 1)));
    return matches.length === 1 ? matches[0] : undefined;
  }

  /** Preserve a pause crossing a sport boundary only when explicit timer events
   * and the original session durations agree. Some exporters omit the restart at
   * a sport change, so carrying every previous stop would erase active legs. */
  private static reconcileInitialTimerState(
    activity: ActivityInterface, file: any, sourceTiming: { timer: unknown; elapsed: unknown }
  ): void {
    const { timer: recordedTimer, elapsed: recordedElapsed } = sourceTiming;
    const duration = (+activity.endDate - +activity.startDate) / 1000;
    const tolerance = TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS;
    if (typeof recordedTimer !== 'number' || !Number.isFinite(recordedTimer) || recordedTimer < 0 ||
        typeof recordedElapsed !== 'number' || !Number.isFinite(recordedElapsed) || recordedElapsed <= 0 ||
        recordedTimer > recordedElapsed + tolerance || Math.abs(duration - recordedElapsed) > tolerance ||
        !(file.sessions ?? []).some((session: any) =>
          +session.start_time < +activity.startDate && +session.timestamp <= +activity.startDate)) return;

    const timerEvents = (file.events as FITFileActivityEvent[]).filter(event => event.event === 'timer' &&
      Number.isFinite(+event.timestamp) &&
      ['start', 'stop', 'stop_all', 'stop_disable', 'stop_disable_all'].includes(event.event_type))
      .slice().sort((left, right) => +left.timestamp - +right.timestamp);
    const preceding = timerEvents.filter(event => +event.timestamp <= +activity.startDate);
    const last = preceding[preceding.length - 1];
    if (!last || last.event_type === 'start') return;
    // A simultaneous start and stop cannot establish an unambiguous inherited state.
    if (preceding.some(event => +event.timestamp === +last.timestamp && event.event_type === 'start')) return;

    const events = activity.getAllEvents();
    const isStop = (event: { getType(): string }) =>
      [DataStopEvent.type, DataStopAllEvent.type].includes(event.getType());
    const hasBoundaryStop = +last.timestamp === +activity.startDate;
    const timeline = events.filter(event =>
      [DataStartEvent.type, DataStopEvent.type, DataStopAllEvent.type].includes(event.getType()) &&
      !(hasBoundaryStop && event.timestamp === 0 && isStop(event)))
      .slice().sort((left, right) => left.timestamp - right.timestamp);
    const activeDuration = (initiallyRunning: boolean): number => {
      let running = initiallyRunning, previous = 0, active = 0;
      for (const event of timeline) {
        const time = Math.min(duration, Math.max(0, event.timestamp));
        if (running) active += time - previous;
        previous = time;
        running = event.getType() === DataStartEvent.type;
      }
      return active + (running ? duration - previous : 0);
    };
    const matchesRunning = Math.abs(activeDuration(true) - recordedTimer) <= tolerance;
    const matchesPaused = Math.abs(activeDuration(false) - recordedTimer) <= tolerance;
    if (matchesRunning === matchesPaused) return;
    if (matchesPaused && !hasBoundaryStop) {
      activity.setAllEvents([new DataStopEvent(0), ...events]);
    } else if (matchesRunning && hasBoundaryStop) {
      activity.setAllEvents(events.filter(event => !(event.timestamp === 0 && isStop(event))));
    }
  }

  private static getIBIDataForActivity(hrvRecords: any[], eventStartDate: Date, activity: ActivityInterface): number[] {
    let elapsedTime = 0;
    return hrvRecords
      .reduce((ibiArray: number[], hrvRecord: any) => ibiArray.concat(hrvRecord.time), [])
      .map((ibi: any) => ibi * 1000)
      .filter((ibi: number) => {
        elapsedTime += ibi;
        const ibiDataDate = new Date(eventStartDate.getTime() + elapsedTime);

        // FIT uses 0xFFFF as the invalid uint16 sentinel. Some parsers surface it as 65.535s.
        if (ibi === this.INVALID_FIT_HRV_INTERVAL_MS) {
          return false;
        }

        return ibiDataDate >= activity.startDate && ibiDataDate <= activity.endDate;
      });
  }

  /**
   * Generate streams samples based on lengths on an activity
   * When based on lengths, an activity do not provides sample under records object
   * @param sessionObject
   * @param options
   * @private
   */
  private static generateSamplesFromLengths(sessionObject: any, options: ActivityParsingOptions): any[] {
    if (!this.isLengthsBased(sessionObject)) {
      throw new ParsingEventLibError('Trying to get samples from activities lengths, but no lengths is available');
    }

    const samples: any[] = [];
    const laps = sessionObject.laps as any[];
    const poolLength = this.getPoolLengthMeters(sessionObject);
    const activeCounts = new Map<number, number>();
    laps.forEach((lap, index) => activeCounts.set(index + 1,
      (lap.lengths || []).filter((length: any) => this.getSwimLengthType(length.length_type) === 'active').length));
    const lengths = laps.flatMap((lap, index) => (lap.lengths || []).map((length: any) => ({ length, lap, lapIndex: index + 1 })))
      .sort((a, b) => +this.getSwimLengthStartDate(a.length)! - +this.getSwimLengthStartDate(b.length)!);
    let distance = 0;
    const completeOwnership = !(sessionObject.lengths || []).some((length: any) =>
      this.getSwimLengthType(length.length_type) === 'active' && this.getLengthLapIndex(length, laps) === null);
    // Some providers place a swim length before its lap starts, leaving a
    // positive-distance lap with only rest. Such ownership cannot establish a
    // complete counter: retain recorded distance instead, or leave it absent.
    const missingActiveLap = laps.some((lap, index) => (this.getNumericValue(lap.total_distance) ?? 0) > 0 &&
      !activeCounts.get(index + 1));
    let distanceKnown = completeOwnership && !missingActiveLap && Array.from(activeCounts.values()).some(count => count > 0);

    for (const { length, lap, lapIndex } of lengths) {
      const lengthStartDate = this.getSwimLengthStartDate(length);
      if (!lengthStartDate) {
        continue;
      }
      const lengthEndDate = this.getSwimLengthEndDate(length, lengthStartDate);
      const duration = (+lengthEndDate - +lengthStartDate) / 1000;
      if (duration <= 0 || duration > options.maxActivityDurationDays * 24 * 60 * 60) {
        continue;
      }
      const idle = this.getSwimLengthType(length.length_type) === 'idle';
      // Preserve the established lap-distance source for generated streams;
      // the pool setting can be rounded or disagree with recorded lap totals.
      const lapDistance = this.getNumericValue(lap.total_distance);
      const activeCount = activeCounts.get(lapIndex) || 0;
      const lengthMeters = idle ? 0 : lapDistance !== null && lapDistance >= 0 && activeCount > 0
        ? lapDistance / activeCount : this.getSwimLengthDistance(length, lap, lapIndex, poolLength, activeCounts);
      // Unknown distance must not become a fabricated zero or a partial total.
      distanceKnown = distanceKnown && lengthMeters !== null && lengthMeters >= 0;
      const streamLength = ActivityUtilities.getDataLength(lengthStartDate, lengthEndDate);
      for (let index = 0; index < streamLength; index++) {
        samples.push({
          timestamp: new Date(+lengthStartDate + index * 1000),
          distance: distanceKnown ? distance + lengthMeters! * index / (streamLength - 1) : undefined,
          speed: idle ? 0 : length.avg_speed ?? lap.avg_speed,
          cadence: idle ? 0 : length.avg_cadence ?? length.avg_swimming_cadence ?? lap.avg_cadence,
          heart_rate: completeOwnership ? length.avg_heart_rate || lap.avg_heart_rate : undefined
        });
      }
      if (distanceKnown) {
        distance += lengthMeters!;
      }
    }
    if (!distanceKnown) {
      samples.forEach(sample => delete sample.distance);
    }
    return samples;
  }

  private static mapDeviceInfosToDevices(deviceInfos: any[]): DeviceInterface[] {
    return deviceInfos.map((deviceInfo: any) => {
      const device = new Device(deviceInfo.device_type);
      device.index = deviceInfo.device_index;
      device.name =
        deviceInfo.product_name ||
        ImporterFitAntPlusDeviceNames[deviceInfo.ant_device_number] ||
        deviceInfo.ant_device_number;
      device.batteryStatus = deviceInfo.battery_status;
      device.batteryLevel = isNumber(deviceInfo.battery_level) ? deviceInfo.battery_level : deviceInfo.battery_soc;
      device.batteryVoltage = deviceInfo.battery_voltage;
      device.manufacturer = deviceInfo.manufacturer;
      device.serialNumber = deviceInfo.serial_number;
      device.product = deviceInfo.product;
      device.swInfo = deviceInfo.software_version;
      device.hwInfo = deviceInfo.hardware_version;
      device.antDeviceNumber = deviceInfo.ant_device_number;
      device.antTransmissionType = deviceInfo.ant_transmission_type;
      device.antNetwork = deviceInfo.ant_network;
      device.sourceType = deviceInfo.source_type;
      if (deviceInfo.ant_id) {
        device.antId = deviceInfo.ant_id;
      }
      device.cumOperatingTime = deviceInfo.cum_operating_time;
      if (deviceInfo.timestamp) {
        device.timestamp = new Date(deviceInfo.timestamp);
      }
      return device;
    });
  }

  private static selectActivityDeviceInfos(
    fitDeviceInfos: any[],
    activityStartDate: Date,
    activityEndDate: Date
  ): { activityDeviceInfos: any[]; timedActivityDeviceInfos: any[] } {
    const activityStartTime = activityStartDate.getTime() - 60000;
    const activityEndTime = activityEndDate.getTime() + 60000;
    const untimestampedCreatorDeviceInfos: any[] = [];
    const timedActivityDeviceInfos: any[] = [];

    fitDeviceInfos.forEach((deviceInfo: any) => {
      const timestamp = deviceInfo?.timestamp == null ? Number.NaN : new Date(deviceInfo.timestamp).getTime();
      if (!Number.isFinite(timestamp)) {
        if (FITCreatorMapper.isCreatorDeviceInfo(deviceInfo)) {
          untimestampedCreatorDeviceInfos.push(deviceInfo);
        }
        return;
      }

      if (timestamp >= activityStartTime && timestamp <= activityEndTime) {
        timedActivityDeviceInfos.push(deviceInfo);
      }
    });

    timedActivityDeviceInfos.sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      activityDeviceInfos: [...untimestampedCreatorDeviceInfos, ...timedActivityDeviceInfos],
      timedActivityDeviceInfos
    };
  }

  private static deviceSignatureWithoutTimestamp(device: DeviceInterface): string {
    return JSON.stringify([
      device.type,
      device.name,
      device.index,
      device.batteryStatus,
      device.batteryLevel,
      device.batteryVoltage,
      device.manufacturer,
      device.serialNumber,
      device.product,
      device.swInfo,
      device.hwInfo,
      device.antDeviceNumber,
      device.antTransmissionType,
      device.antNetwork,
      device.sourceType,
      device.antId,
      device.cumOperatingTime
    ]);
  }

  /**
   * Keep first+last of each identical run per device index (all fields except timestamp).
   * Interleaved devices do not split runs; retained rows stay in their original order.
   */
  private static compactDeviceInfosByRuns(devices: DeviceInterface[]): DeviceInterface[] {
    if (devices.length <= 1) {
      return devices;
    }

    const runs = new Map<DeviceInterface['index'], { start: number; end: number; signature: string }>();
    const retained = new Set<number>();

    devices.forEach((current, index) => {
      const currentSignature = this.deviceSignatureWithoutTimestamp(current);
      const run = runs.get(current.index);

      if (run?.signature === currentSignature) {
        run.end = index;
        return;
      }

      if (run) {
        retained.add(run.start);
        retained.add(run.end);
      }

      runs.set(current.index, { start: index, end: index, signature: currentSignature });
    });

    for (const run of runs.values()) {
      retained.add(run.start);
      retained.add(run.end);
    }

    return devices.filter((_device, index) => retained.has(index));
  }

  private static getNumericValue(value: unknown): number | null {
    if (!isNumberOrString(value)) {
      return null;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return null;
    }

    return numericValue;
  }

  private static getMessageIndexValue(value: unknown): number | null {
    if (value && typeof value === 'object' && 'value' in value) {
      const indexedValue = (value as { value?: unknown }).value;
      return typeof indexedValue === 'number' && Number.isInteger(indexedValue) ? indexedValue : null;
    }

    return null;
  }

  /**
   * Keeps FIT gas and tank messages as structured source records. They do not
   * become scalar stats and no relation between a gas and a tank is inferred.
   */
  private static addDiveSourceRecords(
    activity: ActivityInterface,
    fitDataObject: { dive_gases?: unknown; tank_summaries?: unknown; tank_updates?: unknown }
  ): void {
    if (ActivityTypesHelper.getActivityGroupForActivityType(activity.type) !== ActivityTypeGroups.DivingGroup) {
      return;
    }

    activity.setDiveSourceRecords({
      gases: this.getDiveGasRecords(fitDataObject?.dive_gases),
      tankSummaries: this.getDiveTankSummariesForActivity(fitDataObject?.tank_summaries, activity),
      tankUpdates: this.getDiveTankUpdatesForActivity(fitDataObject?.tank_updates, activity)
    });
  }

  private static getDiveGasRecords(records: unknown): DiveGasRecord[] {
    if (!Array.isArray(records)) {
      return [];
    }

    return records
      .filter((record: unknown): record is Record<string, unknown> => !!record && typeof record === 'object')
      .map(record => {
        const mappedRecord: DiveGasRecord = {};
        const messageIndex = this.getDiveMessageIndex(record.message_index);
        const heliumContent = this.getNumericValue(record.helium_content);
        const oxygenContent = this.getNumericValue(record.oxygen_content);
        const status = this.getDiveGasStatus(record.status);
        const mode = this.getDiveGasMode(record.mode);

        if (messageIndex) {
          mappedRecord.messageIndex = messageIndex;
        }
        if (heliumContent !== null) {
          mappedRecord.heliumContent = heliumContent;
        }
        if (oxygenContent !== null) {
          mappedRecord.oxygenContent = oxygenContent;
        }
        if (status !== null) {
          mappedRecord.status = status;
        }
        if (mode !== null) {
          mappedRecord.mode = mode;
        }

        return mappedRecord;
      });
  }

  private static getDiveTankSummariesForActivity(
    records: unknown,
    activity: ActivityInterface
  ): DiveTankSummaryRecord[] {
    if (!Array.isArray(records)) {
      return [];
    }

    return records
      .filter((record: unknown): record is Record<string, unknown> => this.isDiveRecordWithinActivity(record, activity))
      .map(record => {
        const mappedRecord: DiveTankSummaryRecord = {
          timestamp: this.getDateFromValue(record.timestamp)!
        };
        const sensor = this.getNumericValue(record.sensor);
        const startPressure = this.getNumericValue(record.start_pressure);
        const endPressure = this.getNumericValue(record.end_pressure);
        const volumeUsed = this.getNumericValue(record.volume_used);

        if (sensor !== null) {
          mappedRecord.sensor = sensor;
        }
        if (startPressure !== null) {
          mappedRecord.startPressure = startPressure;
        }
        if (endPressure !== null) {
          mappedRecord.endPressure = endPressure;
        }
        if (volumeUsed !== null) {
          mappedRecord.volumeUsed = volumeUsed;
        }

        return mappedRecord;
      });
  }

  private static getDiveTankUpdatesForActivity(records: unknown, activity: ActivityInterface): DiveTankUpdateRecord[] {
    if (!Array.isArray(records)) {
      return [];
    }

    return records
      .filter((record: unknown): record is Record<string, unknown> => this.isDiveRecordWithinActivity(record, activity))
      .map(record => {
        const mappedRecord: DiveTankUpdateRecord = {
          timestamp: this.getDateFromValue(record.timestamp)!
        };
        const sensor = this.getNumericValue(record.sensor);
        const pressure = this.getNumericValue(record.pressure);

        if (sensor !== null) {
          mappedRecord.sensor = sensor;
        }
        if (pressure !== null) {
          mappedRecord.pressure = pressure;
        }

        return mappedRecord;
      });
  }

  private static isDiveRecordWithinActivity(
    record: unknown,
    activity: ActivityInterface
  ): record is Record<string, unknown> {
    if (!record || typeof record !== 'object') {
      return false;
    }

    const timestamp = this.getDateFromValue((record as { timestamp?: unknown }).timestamp);
    return (
      !!timestamp &&
      timestamp.getTime() >= activity.startDate.getTime() &&
      timestamp.getTime() <= activity.endDate.getTime()
    );
  }

  private static getDiveMessageIndex(value: unknown): DiveMessageIndex | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const sourceValue = value as { value?: unknown; reserved?: unknown; selected?: unknown };
    const messageIndex = this.getNumericValue(sourceValue.value);
    if (messageIndex === null || !Number.isInteger(messageIndex)) {
      return null;
    }

    const mappedIndex: DiveMessageIndex = { value: messageIndex };
    if (typeof sourceValue.reserved === 'boolean') {
      mappedIndex.reserved = sourceValue.reserved;
    }
    if (typeof sourceValue.selected === 'boolean') {
      mappedIndex.selected = sourceValue.selected;
    }

    return mappedIndex;
  }

  private static getDiveGasStatus(value: unknown): DiveGasStatus | null {
    if (value === 'disabled' || value === 'enabled' || value === 'backup_only') {
      return value;
    }

    const numericValue = this.getNumericValue(value);
    return numericValue !== null && Number.isInteger(numericValue) ? numericValue : null;
  }

  private static getDiveGasMode(value: unknown): DiveGasMode | null {
    if (value === 'open_circuit' || value === 'closed_circuit_diluent') {
      return value;
    }

    const numericValue = this.getNumericValue(value);
    return numericValue !== null && Number.isInteger(numericValue) ? numericValue : null;
  }

  private static getReferencedDiveSummary(
    fitDataObject: any,
    referenceMessage: 'session' | 'lap',
    targetMessage: any
  ): any | null {
    const summaries = fitDataObject?.messages?.dive_summary;
    if (!Array.isArray(summaries)) {
      return null;
    }

    const targetIndex = this.getMessageIndexValue(targetMessage?.message_index);
    if (targetIndex === null) {
      return null;
    }

    return (
      summaries.find((summary: any) => {
        const summaryIndex = this.getMessageIndexValue(summary?.reference_index);
        return summary?.reference_mesg === referenceMessage && summaryIndex === targetIndex;
      }) ?? null
    );
  }

  private static addDiveSummaryStats(target: StatsClassInterface, summary: any | null): void {
    if (!summary) {
      return;
    }

    const mappings: Array<{
      field: string;
      create: (value: number) => DataInterface<unknown>;
    }> = [
      { field: 'avg_depth', create: value => new DataDepthAvg(value) },
      { field: 'max_depth', create: value => new DataDepthMax(value) },
      { field: 'surface_interval', create: value => new DataSurfaceInterval(value) },
      { field: 'bottom_time', create: value => new DataBottomTime(value) },
      { field: 'dive_number', create: value => new DataDiveNumber(value) },
      { field: 'descent_time', create: value => new DataDiveDescentTime(value) },
      { field: 'ascent_time', create: value => new DataDiveAscentTime(value) },
      { field: 'avg_ascent_rate', create: value => new DataDiveAscentRateAvg(value) },
      { field: 'avg_descent_rate', create: value => new DataDiveDescentRateAvg(value) },
      { field: 'max_ascent_rate', create: value => new DataDiveAscentRateMax(value) },
      { field: 'max_descent_rate', create: value => new DataDiveDescentRateMax(value) },
      { field: 'hang_time', create: value => new DataDiveHangTime(value) },
      { field: 'start_cns', create: value => new DataStartingCNSLoad(value) },
      { field: 'end_cns', create: value => new DataEndingCNSLoad(value) },
      { field: 'start_n2', create: value => new DataStartingN2Load(value) },
      { field: 'end_n2', create: value => new DataEndingN2Load(value) },
      { field: 'o2_toxicity', create: value => new DataOxygenToxicity(value) },
      { field: 'avg_pressure_sac', create: value => new DataPressureSACAvg(value) },
      { field: 'avg_volume_sac', create: value => new DataVolumeSACAvg(value) },
      { field: 'avg_rmv', create: value => new DataRMVAvg(value) }
    ];

    mappings.forEach(mapping => {
      const sourceValue = summary[mapping.field];
      if (!Number.isFinite(sourceValue)) {
        return;
      }
      target.addStat(mapping.create(sourceValue));
    });
  }

  private static getDateFromValue(value: unknown): Date | null {
    if (this.isValidDate(value)) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const dateValue = new Date(value);
      if (this.isValidDate(dateValue)) {
        return dateValue;
      }
    }

    return null;
  }

  private static getSessionlessLapStartDate(lapObject: any): Date | null {
    const startTime = this.getDateFromValue(lapObject?.start_time);
    if (startTime) {
      return startTime;
    }

    const timestamp = this.getDateFromValue(lapObject?.timestamp);
    if (timestamp && isNumber(lapObject?.total_elapsed_time) && lapObject.total_elapsed_time > 0) {
      return new Date(timestamp.getTime() - lapObject.total_elapsed_time * 1000);
    }

    return timestamp;
  }

  private static getSessionlessLapEndDate(lapObject: any, lapStartDate: Date | null): Date | null {
    const timestamp = this.getDateFromValue(lapObject?.timestamp);
    if (timestamp) {
      return timestamp;
    }

    if (lapStartDate && isNumber(lapObject?.total_elapsed_time) && lapObject.total_elapsed_time > 0) {
      return new Date(lapStartDate.getTime() + lapObject.total_elapsed_time * 1000);
    }

    return null;
  }

  private static buildSessionFromTopLevelMessages(fitDataObject: any): any | null {
    const laps = Array.isArray(fitDataObject?.laps)
      ? fitDataObject.laps.filter((lap: any) => lap && typeof lap === 'object')
      : [];
    const records = Array.isArray(fitDataObject?.records)
      ? fitDataObject.records.filter((record: any) => this.getDateFromValue(record?.timestamp))
      : [];
    const events = Array.isArray(fitDataObject?.events)
      ? fitDataObject.events.filter((event: any) => this.getDateFromValue(event?.timestamp))
      : [];

    if (!laps.length && !records.length && !events.length) {
      return null;
    }

    const boundaryDates: Date[] = [];

    laps.forEach((lapObject: any) => {
      const lapStartDate = this.getSessionlessLapStartDate(lapObject);
      const lapEndDate = this.getSessionlessLapEndDate(lapObject, lapStartDate);

      if (lapStartDate) {
        boundaryDates.push(lapStartDate);
      }
      if (lapEndDate) {
        boundaryDates.push(lapEndDate);
      }
    });

    records.forEach((record: any) => {
      const recordTimestamp = this.getDateFromValue(record?.timestamp);
      if (recordTimestamp) {
        boundaryDates.push(recordTimestamp);
      }
    });

    events.forEach((event: any) => {
      const eventTimestamp = this.getDateFromValue(event?.timestamp);
      if (eventTimestamp) {
        boundaryDates.push(eventTimestamp);
      }
    });

    if (!boundaryDates.length) {
      return null;
    }

    boundaryDates.sort((a, b) => a.getTime() - b.getTime());

    const startDate = boundaryDates[0];
    let endDate = boundaryDates[boundaryDates.length - 1];

    const lapElapsedTime = laps.reduce((total: number, lapObject: any) => {
      const lapElapsed = this.getNumericValue(lapObject?.total_elapsed_time);
      return lapElapsed && lapElapsed > 0 ? total + lapElapsed : total;
    }, 0);

    const elapsedTimeFromDates = (endDate.getTime() - startDate.getTime()) / 1000;
    const totalElapsedTime = elapsedTimeFromDates > 0 ? elapsedTimeFromDates : lapElapsedTime;
    // Elapsed time is not a supplied timer summary. Keep it absent when lap
    // coverage is incomplete so explicit timer events can recover active time.
    const orderedLaps = laps.slice().sort((left: any, right: any) =>
      +(this.getSessionlessLapStartDate(left) ?? 0) - +(this.getSessionlessLapStartDate(right) ?? 0));
    let previousEnd = +startDate;
    const completeLapTimers = orderedLaps.length > 0 && orderedLaps.every((lap: any) => {
      const lapStart = this.getSessionlessLapStartDate(lap);
      const lapEnd = this.getSessionlessLapEndDate(lap, lapStart);
      const timer = this.getNumericValue(lap.total_timer_time);
      const valid = lapStart && lapEnd && +lapEnd > +lapStart &&
        Math.abs(+lapStart - previousEnd) <= TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS * 1000 &&
        timer !== null && timer >= 0 && timer <= (+lapEnd - +lapStart) / 1000 + TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS;
      if (lapEnd) previousEnd = +lapEnd;
      return !!valid;
    }) && Math.abs(previousEnd - +endDate) <= TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS * 1000;
    const totalTimerTime = completeLapTimers
      ? orderedLaps.reduce((total: number, lap: any) => total + this.getNumericValue(lap.total_timer_time)!, 0) : null;

    if (endDate.getTime() <= startDate.getTime() && totalElapsedTime > 0) {
      endDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
    }

    if (endDate.getTime() <= startDate.getTime()) {
      return null;
    }

    const firstLapWithSport = laps.find((lapObject: any) => {
      return lapObject?.sport !== undefined || lapObject?.sub_sport !== undefined;
    });
    const lapSummary = StatsUtilities.aggregateNumericRecords(laps, FIT_DISTANCE_ELEVATION_GRADE_SUMMARY_AGGREGATIONS);

    const sessionObject: any = {
      laps,
      start_time: startDate,
      timestamp: endDate,
      ...lapSummary
    };

    if (totalElapsedTime > 0) {
      sessionObject.total_elapsed_time = totalElapsedTime;
    }
    if (totalTimerTime !== null) {
      sessionObject.total_timer_time = totalTimerTime;
    }
    if (firstLapWithSport?.sport !== undefined) {
      sessionObject.sport = firstLapWithSport.sport;
    }
    if (firstLapWithSport?.sub_sport !== undefined) {
      sessionObject.sub_sport = firstLapWithSport.sub_sport;
    }

    const totalDistance = this.getFinalRecordDistance(records);
    if (sessionObject.total_distance === undefined && totalDistance !== null) {
      sessionObject.total_distance = totalDistance;
    }

    return sessionObject;
  }

  private static getFinalRecordDistance(records: any[]): number | null {
    for (let index = records.length - 1; index >= 0; index--) {
      const distance = this.getNumericValue(records[index]?.distance);
      if (distance !== null) {
        return distance;
      }
    }

    return null;
  }

  private static normalizeFitDataObjectForActivities(fitDataObject: any): void {
    fitDataObject.records = Array.isArray(fitDataObject.records) ? fitDataObject.records : [];
    fitDataObject.events = Array.isArray(fitDataObject.events) ? fitDataObject.events : [];
    fitDataObject.laps = Array.isArray(fitDataObject.laps) ? fitDataObject.laps : [];

    const sessions = Array.isArray(fitDataObject.sessions)
      ? fitDataObject.sessions.filter((session: any) => session && typeof session === 'object')
      : [];

    if (sessions.length) {
      fitDataObject.sessions = sessions.map((session: any) => ({
        ...session,
        laps: Array.isArray(session?.laps) ? session.laps : []
      }));
      this.assignReferencedSessionLaps(fitDataObject);
      return;
    }

    const synthesizedSession = this.buildSessionFromTopLevelMessages(fitDataObject);
    fitDataObject.sessions = synthesizedSession ? [synthesizedSession] : [];
  }

  /** The parser's cascade assumes chronological session summaries. Explicit
   * first_lap_index/num_laps relationships remain authoritative when summaries
   * appear in a different order; neither array positions nor another leg's
   * cascaded laps may replace missing or conflicting references. */
  private static assignReferencedSessionLaps(file: any): void {
    const laps: any[] = file.laps;
    if (!laps.length) return;
    const indexOf = (lap: any): number | null => this.getMessageIndexValue(lap.message_index);
    const sessions: any[] = file.sessions;
    // A sole session needs no cross-session reassignment. Several exporters omit
    // lap IDs, use one-based IDs with zero-based hints, or emit closing markers;
    // none of those incomplete relationships should erase an existing lap list.
    if (sessions.length === 1) return;
    const allIndexed = laps.every(lap => indexOf(lap) !== null);
    const summariesReordered = sessions.some((session, index) => index > 0 &&
      +session.start_time < +sessions[index - 1].start_time);
    if (!allIndexed && !summariesReordered) return;
    const timeOwned = (session: any): any[] => laps.filter(lap => {
      const start = this.getLapWindow(lap).startDate;
      if (!start) return false;
      const owners = sessions.filter(other => this.isDateInLapWindow(start, other));
      return owners.length === 1 && owners[0] === session;
    });
    const referenced = sessions.map(session => {
      const first = this.getNumericValue(session.first_lap_index);
      const count = this.getNumericValue(session.num_laps);
      if (first === null || count === null || !allIndexed) return null;
      if (!Number.isInteger(first) || first < 0 || !Number.isInteger(count) || count < 0 || count > laps.length) return [];
      const matches = laps.filter(lap => {
        const index = indexOf(lap)!;
        return index >= first && index < first + count;
      });
      const window = this.getLapWindow(session);
      if (matches.length !== count || matches.some(lap => {
        const index = indexOf(lap);
        const lapWindow = this.getLapWindow(lap);
        return (index !== null && (index < first || index >= first + count ||
          laps.filter(other => indexOf(other) === index).length !== 1)) ||
          !window.startDate || !window.endDate || !lapWindow.startDate || !lapWindow.endDate ||
          +lapWindow.startDate >= +window.endDate || +lapWindow.endDate <= +window.startDate;
      })) return [];
      return session.laps.length === matches.length && session.laps.every((lap: any) => matches.includes(lap))
        ? session.laps : matches.sort((left, right) => +this.getLapWindow(left).startDate! - +this.getLapWindow(right).startDate!);
    });
    sessions.forEach((session, index) => {
      const owned = referenced[index];
      session.laps = (owned ?? timeOwned(session)).filter((lap: any) => !referenced.some((other, otherIndex) =>
        otherIndex !== index && other?.includes(lap)));
    });
  }

  private static isValidDate(value: unknown): value is Date {
    return value instanceof Date && Number.isFinite(value.getTime());
  }

  private static getValidLapTimestamp(
    sessionLapObject: any,
    startDate: Date | null,
    lastRecordTimestamp: Date | null
  ): Date | null {
    const timestamp = sessionLapObject?.timestamp;
    if (!this.isValidDate(timestamp)) {
      return null;
    }

    if (startDate && timestamp.getTime() < startDate.getTime()) {
      return null;
    }

    if (
      startDate &&
      isNumber(sessionLapObject?.total_elapsed_time) &&
      sessionLapObject.total_elapsed_time > 0 &&
      timestamp.getTime() <= startDate.getTime()
    ) {
      return null;
    }

    if (lastRecordTimestamp && timestamp.getTime() < lastRecordTimestamp.getTime()) {
      return null;
    }

    return timestamp;
  }

  private static normalizeElapsedTimeForResolvedDates(
    object: any,
    startDate: Date | null,
    endDate: Date | null,
    options: ActivityParsingOptions
  ): any {
    if (!startDate || !endDate || endDate <= startDate) {
      return object;
    }

    const maxActivityDurationSeconds = options.maxActivityDurationDays * 24 * 60 * 60;
    const resolvedElapsedTime = (endDate.getTime() - startDate.getTime()) / 1000;

    if (
      !isNumber(object?.total_elapsed_time) ||
      object.total_elapsed_time <= maxActivityDurationSeconds ||
      resolvedElapsedTime > maxActivityDurationSeconds
    ) {
      return object;
    }

    return {
      ...object,
      start_time: startDate,
      timestamp: endDate,
      total_elapsed_time: resolvedElapsedTime,
      ...(isNumber(object.total_timer_time) && object.total_timer_time > resolvedElapsedTime
        ? { total_timer_time: resolvedElapsedTime }
        : {})
    };
  }

  private static resolveInvalidLapDates(
    sessionLapObject: any,
    activity: ActivityInterface,
    startDate: Date | null,
    endDate: Date | null,
    firstRecordTimestamp: Date | null,
    lastRecordTimestamp: Date | null
  ): { startDate: Date; endDate: Date } {
    const rawStartDate = this.getDateFromValue(sessionLapObject?.start_time);
    const rawEndDate = this.getDateFromValue(sessionLapObject?.timestamp);
    const totalElapsedTime =
      this.getNumericValue(sessionLapObject?.total_elapsed_time) ??
      this.getNumericValue(sessionLapObject?.total_timer_time);

    if (rawStartDate && rawEndDate && rawEndDate <= rawStartDate) {
      const recoveredStartDate =
        firstRecordTimestamp ||
        (activity.startDate < rawEndDate ? activity.startDate : null) ||
        (totalElapsedTime && totalElapsedTime > 0 ? new Date(rawEndDate.getTime() - totalElapsedTime * 1000) : null);

      if (recoveredStartDate && recoveredStartDate < rawEndDate) {
        return {
          startDate: recoveredStartDate,
          endDate: rawEndDate
        };
      }
    }

    if (startDate && totalElapsedTime && totalElapsedTime > 0) {
      const recoveredEndDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
      if (recoveredEndDate > startDate) {
        return {
          startDate,
          endDate: recoveredEndDate
        };
      }
    }

    if (endDate && totalElapsedTime && totalElapsedTime > 0) {
      const recoveredStartDate = new Date(endDate.getTime() - totalElapsedTime * 1000);
      if (recoveredStartDate < endDate) {
        return {
          startDate: recoveredStartDate,
          endDate
        };
      }
    }

    const fallbackStartDate =
      firstRecordTimestamp ||
      (activity.startDate && (!endDate || activity.startDate < endDate) ? activity.startDate : null) ||
      startDate ||
      rawStartDate;
    const fallbackEndDate =
      lastRecordTimestamp ||
      (rawEndDate && fallbackStartDate && rawEndDate > fallbackStartDate ? rawEndDate : null) ||
      (activity.endDate && fallbackStartDate && activity.endDate > fallbackStartDate ? activity.endDate : null) ||
      endDate ||
      rawEndDate;

    if (fallbackStartDate && fallbackEndDate && fallbackEndDate > fallbackStartDate) {
      return {
        startDate: fallbackStartDate,
        endDate: fallbackEndDate
      };
    }

    return {
      startDate: activity.startDate,
      endDate: activity.endDate > activity.startDate ? activity.endDate : new Date(activity.startDate.getTime() + 1000)
    };
  }

  private static getLapFromSessionLapObject(
    sessionLapObject: any,
    activity: ActivityInterface,
    lapIndex: number,
    options: ActivityParsingOptions
  ): LapInterface {
    this.swapTimesIfRequired(sessionLapObject);

    const firstRecordTimestamp = sessionLapObject?.records?.[0]?.timestamp || null;
    const lastRecordTimestamp =
      sessionLapObject?.records?.length > 0
        ? sessionLapObject.records[sessionLapObject.records.length - 1]?.timestamp
        : null;

    const startDate =
      sessionLapObject?.start_time ||
      firstRecordTimestamp ||
      (sessionLapObject?.total_elapsed_time &&
        new Date(sessionLapObject.timestamp.getTime() - sessionLapObject.total_elapsed_time * 1000)) ||
      null;

    const validTimestamp = this.getValidLapTimestamp(sessionLapObject, startDate, lastRecordTimestamp);

    const endDate =
      validTimestamp ||
      lastRecordTimestamp ||
      (sessionLapObject.start_time &&
        sessionLapObject.total_elapsed_time &&
        new Date(sessionLapObject.start_time.getTime() + sessionLapObject.total_elapsed_time * 1000)) ||
      null;

    const resolvedDates =
      !startDate || !endDate || endDate <= startDate
        ? this.resolveInvalidLapDates(
            sessionLapObject,
            activity,
            startDate,
            endDate,
            firstRecordTimestamp,
            lastRecordTimestamp
          )
        : { startDate, endDate };

    const lap = new Lap(
      resolvedDates.startDate,
      resolvedDates.endDate, // Some dont have a timestamp
      lapIndex + 1,
      LapTypes[<keyof typeof LapTypes>sessionLapObject.lap_trigger] || LapTypes.unknown
    );
    // Set the calories
    if (sessionLapObject.total_calories) {
      lap.addStat(new DataEnergy(sessionLapObject.total_calories));
    }
    // Add stats to the lap
    const normalizedSessionLapObject = this.normalizeElapsedTimeForResolvedDates(
      sessionLapObject,
      resolvedDates.startDate,
      resolvedDates.endDate,
      options
    );
    this.getStatsFromObject(normalizedSessionLapObject, activity, true).forEach(stat => lap.addStat(stat));
    return lap;
  }

  private static getActivityFromSessionObject(
    sessionObject: any,
    fitDataObject: any,
    options: ActivityParsingOptions,
    sessionIndex: number
  ): ActivityInterface {
    /**
     * Provides start/end date based on records available in given session object first, then in parent fit object
     */
    const getStartEndDatesFromRecords = (sessionObject: any, fitDataObject: any): [Date | null, Date | null] => {
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      // Try to get from session first
      if (
        sessionObject?.laps?.length > 0 && // Current session has laps
        sessionObject.laps[0].records?.length > 0 && // Current session has records in first lap
        sessionObject.laps[sessionObject.laps.length - 1].records?.length > 0 // Current session has records in last lap
      ) {
        const firstLapRecords = sessionObject.laps[0].records;
        const firstRecordTimeStamp = firstLapRecords[0]?.timestamp as Date;
        if (firstRecordTimeStamp) {
          startDate = firstRecordTimeStamp;
        }

        const lastLapRecords = sessionObject.laps[sessionObject.laps.length - 1].records;
        const lastRecordTimeStamp = lastLapRecords[lastLapRecords.length - 1]?.timestamp as Date;
        if (lastRecordTimeStamp) {
          endDate = lastRecordTimeStamp;
        }
      }

      // Then from parent fit object first
      if ((!startDate || !endDate) && fitDataObject.records?.length) {
        startDate = fitDataObject.records[0]?.timestamp || null;
        endDate = fitDataObject.records[fitDataObject.records.length - 1]?.timestamp || null;
      }

      return [startDate, endDate];
    };

    // For some unknown reasons... the fit provided total_timer_time & total_elapsed_time could be inverted..
    // Just invert fields if that's the case
    this.swapTimesIfRequired(sessionObject);

    // Start finding out total elapsed time from fit dedicated fields
    const totalElapsedTime = sessionObject.total_elapsed_time || sessionObject.total_timer_time || 0;
    const [recordStartDate, recordEndDate] = getStartEndDatesFromRecords(sessionObject, fitDataObject);

    // Pick start/end date values
    let startDate = sessionObject.start_time || recordStartDate || null;
    let endDate =
      sessionObject.timestamp ||
      (startDate && totalElapsedTime && new Date(startDate.getTime() + totalElapsedTime * 1000)) ||
      recordEndDate ||
      null;

    // Some fit files have wrong dates for session.timestamp && session.start_time and those miss an elapsed time
    // Get dates from records in that case
    if (
      !totalElapsedTime // Elapsed time missing
    ) {
      if (recordStartDate) {
        startDate = recordStartDate;
      }

      if (recordEndDate) {
        endDate = recordEndDate;
      }
    }

    // Now verify the start/end date compliance,
    // If for some reason this happens, get from records too
    if (startDate && endDate && endDate <= startDate) {
      if (recordStartDate) {
        startDate = recordStartDate;
      }

      if (recordEndDate) {
        endDate = recordEndDate;
      }
    }

    if (startDate && endDate && endDate <= startDate && totalElapsedTime > 0) {
      endDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
    }

    const elapsedTimeFromDates = (+endDate - +startDate) / 1000; // Get elapsed calculated from dates
    const maxActivityDurationMs = options.maxActivityDurationDays * 24 * 60 * 60 * 1000;
    const recordDurationMs = recordStartDate && recordEndDate ? +recordEndDate - +recordStartDate : 0;
    const hasReliableRecordDates = recordDurationMs > 0 && recordDurationMs <= maxActivityDurationMs;
    const totalElapsedTimeExceedsRecordDuration =
      totalElapsedTime > 0 &&
      recordDurationMs > 0 &&
      totalElapsedTime / (recordDurationMs / 1000) > INVALID_DATES_ELAPSED_TIME_RATIO_THRESHOLD;

    // Test case where sometime elapsed time (calculated from dates) can be very high comparing to computed totalElapsedTime
    // If elapsed time (calculated from dates) is detected as "strange" then use elapsed time from fit fields instead
    // @see test case implying 'fixtures/rides/fit/5319808632.fit' fit file
    if (totalElapsedTime && elapsedTimeFromDates / totalElapsedTime > INVALID_DATES_ELAPSED_TIME_RATIO_THRESHOLD) {
      if (totalElapsedTime) {
        endDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
      }
    }

    // Re-test potential updated activity duration against max accepted duration
    if (+endDate - +startDate > maxActivityDurationMs) {
      if (
        recordStartDate &&
        recordEndDate &&
        hasReliableRecordDates &&
        (!totalElapsedTime || totalElapsedTimeExceedsRecordDuration)
      ) {
        startDate = recordStartDate;
        endDate = recordEndDate;
      } else {
        endDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
      }
    }

    if (!startDate || !endDate) {
      throw new ParsingEventLibError('Cannot parse start and end dates');
    } else {
      // Create an activity
      const activity = new Activity(
        startDate,
        endDate,
        this.getActivityTypeFromSessionObject(sessionObject),
        this.getCreatorFromFitDataObject(fitDataObject),
        options
      );
      fileHeartRateCalibration.set(activity, resolveFitHeartRateCalibration(fitDataObject, sessionObject, sessionIndex, activity.type));
      const fileFtp = resolveFitFunctionalThresholdPower(fitDataObject, sessionObject, sessionIndex);
      if (fileFtp !== null) fileFunctionalThresholdPower.set(activity, fileFtp);
      const normalizedSessionObject = this.normalizeElapsedTimeForResolvedDates(
        {
          ...sessionObject,
          threshold_power: fileFtp ?? sessionObject?.threshold_power
        },
        startDate,
        endDate,
        options
      );
      // Set the activity stats
      this.getStatsFromObject(normalizedSessionObject, activity, false).forEach(stat => activity.addStat(stat));

      // Check for User Profile
      if (fitDataObject.user_profile) {
        const userProfile = fitDataObject.user_profile;
        if (isNumberOrString(userProfile.weight)) {
          activity.addStat(new DataWeight(userProfile.weight));
        }
        if (isNumberOrString(userProfile.height)) {
          activity.addStat(new DataHeight(userProfile.height));
        }
        if (isNumberOrString(userProfile.age)) {
          activity.addStat(new DataAge(userProfile.age));
        }
        const gender = this.getStringValue(userProfile.gender);
        if (gender !== null) {
          activity.addStat(new DataGender(gender));
        }
      }

      // Check for Activity Metrics (VO2Max etc)
      if (fitDataObject.activity_metrics && fitDataObject.activity_metrics.length > 0) {
        // Try to find matching sport or use the first one if only one session
        const activityMetric =
          fitDataObject.activity_metrics.find(
            (am: any) => am.sport === sessionObject.sport || am.sport === activity.type
          ) || fitDataObject.activity_metrics[0];

        if (activityMetric) {
          const metricVO2Max = this.getFirstValidVO2MaxValue(activityMetric.vo2_max, activityMetric.first_vo2_max);
          const metricRecoveryTime = this.getPositiveNumericValue(activityMetric.recovery_time);

          if (metricVO2Max !== null && !activity.getStat(DataVO2Max.type)) {
            activity.addStat(new DataVO2Max(metricVO2Max));
          }

          if (metricRecoveryTime !== null && !activity.getStat(DataRecoveryTime.type)) {
            // FIT activity_metrics.recovery_time is in minutes. DataRecoveryTime is stored in seconds.
            activity.addStat(new DataRecoveryTime(metricRecoveryTime * 60));
          }

          if (
            isNumberOrString(activityMetric.anaerobic_training_effect) &&
            !activity.getStat(DataAnaerobicTrainingEffect.type)
          ) {
            activity.addStat(new DataAnaerobicTrainingEffect(activityMetric.anaerobic_training_effect));
          }

          if (
            isNumberOrString(activityMetric.aerobic_training_effect) &&
            !activity.getStat(DataAerobicTrainingEffect.type)
          ) {
            activity.addStat(new DataAerobicTrainingEffect(activityMetric.aerobic_training_effect));
          }
        }
      }

      const userMetric = this.getUserMetricForSession(fitDataObject.user_metrics, sessionObject);
      const userMetricVO2Max = this.getFirstValidVO2MaxValue(userMetric?.vo2_max, userMetric?.first_vo2_max);
      if (userMetricVO2Max !== null && !activity.getStat(DataVO2Max.type)) {
        activity.addStat(new DataVO2Max(userMetricVO2Max));
      }

      // Check for HR zone durations from time_in_zone messages
      // This is an alternative source when sessionObject.time_in_hr_zone is not available
      if (fitDataObject.time_in_zone && fitDataObject.time_in_zone.length) {
        // Session references use FIT message_index, not the array position.
        // An omitted reference is only unambiguous in a single-session file.
        const manufacturer =
          (fitDataObject.file_ids && fitDataObject.file_ids[0] && fitDataObject.file_ids[0].manufacturer) || '';
        const zoneIndexOffset = manufacturer === 'garmin' ? 1 : 0;
        const sessionTimeInZone = this.getSessionTimeInZone(fitDataObject, sessionObject, sessionIndex);
        if (
          sessionTimeInZone &&
          sessionTimeInZone.time_in_hr_zone &&
          Array.isArray(sessionTimeInZone.time_in_hr_zone)
        ) {
          const hrZones = sessionTimeInZone.time_in_hr_zone;
          const hrZoneBoundaries = sessionTimeInZone.hr_zone_high_boundary;

          // Only add zone duration stats if not already set from sessionObject.time_in_hr_zone
          if (!activity.getStat(DataHeartRateZoneOneDuration.type)) {
            if (hrZones[0 + zoneIndexOffset] !== undefined && hrZones[0 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneOneDuration(hrZones[0 + zoneIndexOffset]));
            }
            if (hrZones[1 + zoneIndexOffset] !== undefined && hrZones[1 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneTwoDuration(hrZones[1 + zoneIndexOffset]));
            }
            if (hrZones[2 + zoneIndexOffset] !== undefined && hrZones[2 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneThreeDuration(hrZones[2 + zoneIndexOffset]));
            }
            if (hrZones[3 + zoneIndexOffset] !== undefined && hrZones[3 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneFourDuration(hrZones[3 + zoneIndexOffset]));
            }
            if (hrZones[4 + zoneIndexOffset] !== undefined && hrZones[4 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneFiveDuration(hrZones[4 + zoneIndexOffset]));
            }
            if (hrZones[5 + zoneIndexOffset] !== undefined && hrZones[5 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneSixDuration(hrZones[5 + zoneIndexOffset]));
            }
            if (hrZones[6 + zoneIndexOffset] !== undefined && hrZones[6 + zoneIndexOffset] !== null) {
              activity.addStat(new DataHeartRateZoneSevenDuration(hrZones[6 + zoneIndexOffset]));
            }
          }

          // Check if IntensityZones for HR is already set, if not create one with boundaries
          const existingHrZones = activity.intensityZones.find(iz => iz.type === DataHeartRate.type);
          if (!existingHrZones && Array.isArray(hrZoneBoundaries) && hrZoneBoundaries.length > 0) {
            const hrIntensityZones = this.createIntensityZonesFromFitZones(
              DataHeartRate.type,
              hrZones,
              zoneIndexOffset,
              hrZoneBoundaries,
              255
            );
            activity.intensityZones.push(hrIntensityZones);
          } else if (existingHrZones && Array.isArray(hrZoneBoundaries) && hrZoneBoundaries.length > 0) {
            this.applyFitZoneHighBoundaries(existingHrZones, hrZoneBoundaries, zoneIndexOffset, 255);
          }
        }

        if (
          sessionTimeInZone &&
          sessionTimeInZone.time_in_power_zone &&
          Array.isArray(sessionTimeInZone.time_in_power_zone)
        ) {
          const powerZones = sessionTimeInZone.time_in_power_zone;
          const powerZoneBoundaries = sessionTimeInZone.power_zone_high_boundary;

          // Only add zone duration stats if not already set
          if (!activity.getStat(DataPowerZoneOneDuration.type)) {
            if (isNumber(powerZones[0 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneOneDuration(powerZones[0 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[1 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneTwoDuration(powerZones[1 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[2 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneThreeDuration(powerZones[2 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[3 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneFourDuration(powerZones[3 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[4 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneFiveDuration(powerZones[4 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[5 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneSixDuration(powerZones[5 + zoneIndexOffset]));
            }
            if (isNumber(powerZones[6 + zoneIndexOffset])) {
              activity.addStat(new DataPowerZoneSevenDuration(powerZones[6 + zoneIndexOffset]));
            }
          }

          // Check if IntensityZones for Power is already set, if not create one with boundaries
          const existingPowerZones = activity.intensityZones.find(iz => iz.type === DataPower.type);
          if (!existingPowerZones && Array.isArray(powerZones) && powerZones.length > 0) {
            const powerIntensityZones = this.createIntensityZonesFromFitZones(
              DataPower.type,
              powerZones,
              zoneIndexOffset,
              powerZoneBoundaries,
              65535
            );
            activity.intensityZones.push(powerIntensityZones);
          } else if (existingPowerZones && Array.isArray(powerZoneBoundaries) && powerZoneBoundaries.length > 0) {
            this.applyFitZoneHighBoundaries(existingPowerZones, powerZoneBoundaries, zoneIndexOffset, 65535);
          }
        }
      }
      this.addSwimLengthsFromSessionObject(activity, sessionObject, fitDataObject);
      return activity;
    }
  }

  private static createIntensityZonesFromFitZones(
    type: string,
    durations: any[],
    zoneIndexOffset: number,
    highBoundaries?: any[],
    invalidHighBoundaryValue?: number
  ): IntensityZones {
    const intensityZones = new IntensityZones(type);
    for (let zoneNumber = 1; zoneNumber <= 7; zoneNumber++) {
      const duration = durations[zoneNumber - 1 + zoneIndexOffset];
      this.setIntensityZoneDuration(intensityZones, zoneNumber, isNumber(duration) ? duration : 0);
    }
    this.applyFitZoneHighBoundaries(intensityZones, highBoundaries, zoneIndexOffset, invalidHighBoundaryValue, true);
    return intensityZones;
  }

  private static applyFitZoneHighBoundaries(
    intensityZones: IntensityZonesInterface,
    highBoundaries: any[] | undefined,
    zoneIndexOffset: number,
    invalidHighBoundaryValue?: number,
    overwrite = false
  ): void {
    if (!Array.isArray(highBoundaries) || highBoundaries.length === 0) {
      return;
    }

    for (let zoneNumber = 1; zoneNumber <= 7; zoneNumber++) {
      const sourceBoundaryIndex = zoneNumber + zoneIndexOffset - 2;
      if (sourceBoundaryIndex < 0) {
        continue;
      }

      const lowerLimit = highBoundaries[sourceBoundaryIndex];
      if (!isNumber(lowerLimit) || lowerLimit === invalidHighBoundaryValue) {
        continue;
      }

      if (!overwrite && this.hasIntensityZoneLowerLimit(intensityZones, zoneNumber)) {
        continue;
      }

      this.setIntensityZoneLowerLimit(intensityZones, zoneNumber, lowerLimit);
    }
  }

  private static setIntensityZoneDuration(
    intensityZones: IntensityZonesInterface,
    zoneNumber: number,
    duration: number
  ): void {
    switch (zoneNumber) {
      case 1:
        intensityZones.zone1Duration = duration;
        break;
      case 2:
        intensityZones.zone2Duration = duration;
        break;
      case 3:
        intensityZones.zone3Duration = duration;
        break;
      case 4:
        intensityZones.zone4Duration = duration;
        break;
      case 5:
        intensityZones.zone5Duration = duration;
        break;
      case 6:
        intensityZones.zone6Duration = duration;
        break;
      case 7:
        intensityZones.zone7Duration = duration;
        break;
      default:
        break;
    }
  }

  private static setIntensityZoneLowerLimit(
    intensityZones: IntensityZonesInterface,
    zoneNumber: number,
    lowerLimit: number
  ): void {
    switch (zoneNumber) {
      case 1:
        intensityZones.zone1LowerLimit = lowerLimit;
        break;
      case 2:
        intensityZones.zone2LowerLimit = lowerLimit;
        break;
      case 3:
        intensityZones.zone3LowerLimit = lowerLimit;
        break;
      case 4:
        intensityZones.zone4LowerLimit = lowerLimit;
        break;
      case 5:
        intensityZones.zone5LowerLimit = lowerLimit;
        break;
      case 6:
        intensityZones.zone6LowerLimit = lowerLimit;
        break;
      case 7:
        intensityZones.zone7LowerLimit = lowerLimit;
        break;
      default:
        break;
    }
  }

  private static hasIntensityZoneLowerLimit(intensityZones: IntensityZonesInterface, zoneNumber: number): boolean {
    switch (zoneNumber) {
      case 1:
        return isNumber(intensityZones.zone1LowerLimit);
      case 2:
        return isNumber(intensityZones.zone2LowerLimit);
      case 3:
        return isNumber(intensityZones.zone3LowerLimit);
      case 4:
        return isNumber(intensityZones.zone4LowerLimit);
      case 5:
        return isNumber(intensityZones.zone5LowerLimit);
      case 6:
        return isNumber(intensityZones.zone6LowerLimit);
      case 7:
        return isNumber(intensityZones.zone7LowerLimit);
      default:
        return false;
    }
  }

  /**
   * For some unknown reasons... the fit provided total_timer_time & total_elapsed_time could be inverted..
   * Just swap them if that's the case
   */
  private static swapTimesIfRequired(object: any): void {
    if (
      isNumber(object.total_timer_time) &&
      isNumber(object.total_elapsed_time) &&
      object.total_elapsed_time < object.total_timer_time
    ) {
      const timeDelta = object.total_timer_time - object.total_elapsed_time;

      // Small inversions are usually a rounding artifact from vendor exporters.
      // Keep semantics consistent (timer <= elapsed) by clamping without swapping.
      if (timeDelta <= TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS) {
        object.total_timer_time = object.total_elapsed_time;
        return;
      }

      const realTimerTime = object.total_elapsed_time;
      const realElapsedTime = object.total_timer_time;
      object.total_timer_time = realTimerTime;
      object.total_elapsed_time = realElapsedTime;
    }
  }

  private static getActivityTypeByKey(value: unknown): ActivityTypes | null {
    return ActivityTypesHelper.resolveActivityType(value);
  }

  private static resolveFitProfileName(
    value: unknown,
    resolver: (profileId: number | string) => string | null
  ): string | null {
    if (!isNumberOrString(value)) {
      return null;
    }

    if (typeof value === 'number') {
      return resolver(value);
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d+$/.test(trimmed)) {
      return resolver(trimmed);
    }

    return trimmed;
  }

  private static getPositiveNumericValue(value: unknown): number | null {
    if (!isNumberOrString(value)) {
      return null;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return null;
    }

    return numericValue;
  }

  private static getFirstNumericValue(...values: unknown[]): number | null {
    for (const value of values) {
      const numericValue = this.getNumericValue(value);
      if (numericValue !== null) {
        return numericValue;
      }
    }

    return null;
  }

  private static getFitEnumValue(value: unknown): string | null {
    return this.getStringValue(value)?.toLowerCase() || null;
  }

  private static getPoolLengthUnit(value: unknown): 'metric' | 'statute' | null {
    switch (this.getFitEnumValue(value)) {
      case '0':
      case 'metric':
      case 'meter':
      case 'meters':
      case 'm':
        return 'metric';
      case '1':
      case 'statute':
      case 'yard':
      case 'yards':
      case 'yd':
        return 'statute';
      default:
        return null;
    }
  }

  private static getSwimLengthType(value: unknown): string | null {
    switch (this.getFitEnumValue(value)) {
      case '0':
      case 'idle':
        return 'idle';
      case '1':
      case 'active':
        return 'active';
      default:
        return this.getStringValue(value);
    }
  }

  private static getSwimStroke(value: unknown): string | null {
    switch (this.getFitEnumValue(value)) {
      case '0':
      case 'freestyle':
        return 'freestyle';
      case '1':
      case 'backstroke':
        return 'backstroke';
      case '2':
      case 'breaststroke':
        return 'breaststroke';
      case '3':
      case 'butterfly':
        return 'butterfly';
      case '4':
      case 'drill':
        return 'drill';
      case '5':
      case 'mixed':
        return 'mixed';
      case '6':
      case 'im':
        return 'im';
      default:
        return this.getStringValue(value);
    }
  }

  private static getPoolLengthMeters(object: any): number | null {
    const poolLength = this.getNumericValue(object?.pool_length);
    if (poolLength === null) {
      return null;
    }

    // FIT stores pool_length in meters; pool_length_unit controls display only.
    return poolLength;
  }

  /** Some Suunto exports encode the pool setting in yards despite FIT's meter
   * contract. Preserve that convention only when separate source distance or
   * speed evidence corroborates conversion, and none corroborates native meters. */
  private static normalizeSuuntoPoolLengths(file: any): void {
    const manufacturers = (file.file_ids ?? []).map((id: any) => this.getFitEnumValue(id.manufacturer));
    if (!manufacturers.length || !manufacturers.every((manufacturer: string | null) =>
      manufacturer === 'suunto' || manufacturer === '23')) return;
    for (const session of file.sessions) {
      const pool = this.getPositiveNumericValue(session.pool_length);
      if (pool === null || this.getPoolLengthUnit(session.pool_length_unit) !== 'statute') continue;
      const speedEvidence: number[] = [];
      for (const length of session.lengths ?? []) {
        if (this.getSwimLengthType(length.length_type) !== 'active') continue;
        const speed = this.getPositiveNumericValue(length.avg_speed);
        const timer = this.getPositiveNumericValue(length.total_timer_time);
        if (speed !== null && timer !== null) speedEvidence.push(speed * timer);
      }
      const lapEvidence: number[] = [];
      for (const lap of session.laps) {
        const active = (lap.lengths ?? []).filter((length: any) => this.getSwimLengthType(length.length_type) === 'active').length;
        const distance = this.getPositiveNumericValue(lap.total_distance);
        if (active > 0 && distance !== null) lapEvidence.push(distance / active);
      }
      const supports = (distance: number, candidate: number): boolean =>
        Number.isFinite(distance) && Math.abs(distance - candidate) <= Math.max(0.1, candidate * 0.005);
      const converted = pool * 0.9144;
      const evidence = [...speedEvidence, ...lapEvidence];
      const consistentSpeed = speedEvidence.length > 0 && speedEvidence.every(distance => supports(distance, converted));
      const consistentLaps = lapEvidence.filter(distance => supports(distance, converted)).length >=
        (session.laps.length === 1 ? 1 : 2);
      if (!evidence.some(distance => supports(distance, pool)) &&
          (speedEvidence.length > 0 ? consistentSpeed : consistentLaps)) session.pool_length = converted;
    }
  }

  private static getSwimLengthEndDate(length: any, startDate: Date): Date {
    const timerTime = this.getNumericValue(length?.total_timer_time);
    const elapsedTime = this.getNumericValue(length?.total_elapsed_time);
    const duration = timerTime ?? elapsedTime;
    if (duration !== null) {
      return new Date(startDate.getTime() + duration * 1000);
    }

    return this.getDateFromValue(length?.timestamp) || startDate;
  }

  /** Repair broken pool summary ends before either ownership or activity/lap construction. */
  private static prepareSwimLengths(fitDataObject: any, options: ActivityParsingOptions): void {
    if (!Array.isArray(fitDataObject.lengths) || !fitDataObject.lengths.length) {
      return;
    }
    const sessions = fitDataObject.sessions as any[];
    const maxDuration = options.maxActivityDurationDays * 24 * 60 * 60;
    const repairEnd = (summary: any, recordEnd?: Date): void => {
      const start = this.getDateFromValue(summary.start_time);
      const end = this.getDateFromValue(summary.timestamp);
      const elapsed = this.getNumericValue(summary.total_elapsed_time);
      const duration = elapsed !== null && elapsed > 0 ? elapsed : this.getNumericValue(summary.total_timer_time);
      if (start && (!end || +end <= +start) && duration !== null && duration > 0 && duration <= maxDuration) {
        summary.timestamp = new Date(Math.max(+start + duration * 1000, recordEnd ? +recordEnd : 0));
      }
    };
    sessions.forEach(session => {
      const isPoolSession = this.getFitEnumValue(session.sport) === 'swimming' ||
        this.getFitEnumValue(session.sport) === '5' || this.getFitEnumValue(session.sub_sport) === 'lap_swimming' ||
        (this.getPoolLengthMeters(session) ?? 0) > 0;
      if (isPoolSession) {
        const start = this.getDateFromValue(session.start_time);
        const nextStarts = sessions.filter(other => other !== session).map(other => this.getDateFromValue(other.start_time))
          .filter((date): date is Date => !!date && !!start && +date > +start);
        const limit = start ? Math.min(+start + maxDuration * 1000, ...nextStarts.map(date => +date)) : 0;
        const recordEnd = start ? fitDataObject.records.reduce((last: Date | undefined, record: any) => {
          const date = this.getDateFromValue(record.timestamp);
          return date && +date >= +start && +date < limit && (!last || +date > +last) &&
            !sessions.some(other => other !== session && this.isDateInLapWindow(date, other)) ? date : last;
        }, undefined) : undefined;
        repairEnd(session, recordEnd);
      }
      session.lengths = [];
      session.laps.forEach((lap: any) => {
        if (isPoolSession) {
          repairEnd(lap);
        }
        lap.lengths = [];
      });
    });
    for (const length of fitDataObject.lengths) {
      const start = this.getSwimLengthStartDate(length);
      if (!start) {
        continue;
      }
      // A length belongs to the interval in which it starts. FIT timestamp is an
      // ending timestamp, so using it drops boundary lengths and moves them to later laps.
      const owners = sessions.filter(session => this.isDateInLapWindow(start, session));
      if (owners.length !== 1) {
        continue;
      }
      const session = owners[0];
      session.lengths.push(length);
      const lapIndex = this.getLengthLapIndex(length, session.laps);
      if (lapIndex !== null) {
        session.laps[lapIndex - 1].lengths.push(length);
      }
    }
  }

  private static getSwimLengthStartDate(length: any): Date | null {
    const start = this.getDateFromValue(length?.start_time);
    if (start) {
      return start;
    }
    const end = this.getDateFromValue(length?.timestamp);
    const duration = this.getNumericValue(length?.total_elapsed_time) ?? this.getNumericValue(length?.total_timer_time);
    return end && duration !== null && duration > 0 ? new Date(+end - duration * 1000) : null;
  }

  private static getLapWindow(lap: any): { startDate: Date | null; endDate: Date | null } {
    const startDate = this.getDateFromValue(lap?.start_time);
    const elapsedTime = this.getNumericValue(lap?.total_elapsed_time) ?? this.getNumericValue(lap?.total_timer_time);
    const timestamp = this.getDateFromValue(lap?.timestamp);
    const endDate = startDate && timestamp && +timestamp > +startDate ? timestamp :
      (startDate && elapsedTime !== null && elapsedTime > 0 ? new Date(+startDate + elapsedTime * 1000) : null);
    return { startDate, endDate };
  }

  private static isDateInLapWindow(date: Date, lap: any): boolean {
    const { startDate, endDate } = this.getLapWindow(lap);
    return !!startDate && !!endDate && +date >= +startDate && +date < +endDate;
  }

  private static getLengthLapIndex(length: any, laps: any[]): number | null {
    const start = this.getSwimLengthStartDate(length);
    if (!start) {
      return null;
    }
    let timeOwners = laps.map((lap, index) => ({ lap, index }))
      .filter(({ lap }) => this.isDateInLapWindow(start, lap));
    // Whole-second FIT starts can overlap a previous fractional-duration end.
    // Only resolve this bounded rounding overlap at the next lap's exact start.
    if (timeOwners.length > 1) {
      const startsHere = timeOwners.filter(({ lap }) => +this.getLapWindow(lap).startDate! === +start);
      if (startsHere.length === 1 && timeOwners.every(({ lap, index }) => index === startsHere[0].index ||
        +this.getLapWindow(lap).endDate! - +start <= 1000)) {
        timeOwners = startsHere;
      }
    }
    const messageIndex = this.getMessageIndexValue(length?.message_index);
    if (messageIndex !== null) {
      const indexOwners = laps.map((lap, index) => ({ lap, index })).filter(({ lap }) => {
        const first = this.getNumericValue(lap.first_length_index);
        const count = this.getNumericValue(lap.num_lengths);
        return first !== null && Number.isInteger(first) && first >= 0 && count !== null && Number.isInteger(count) &&
          count > 0 && messageIndex >= first && messageIndex < first + count;
      });
      if (indexOwners.length === 1) {
        const window = this.getLapWindow(indexOwners[0].lap);
        const end = this.getSwimLengthEndDate(length, start);
        // An explicit index can own a length crossing a lap boundary (for
        // example, a pause within that length), but still needs temporal overlap.
        if (window.startDate && window.endDate && +start < +window.endDate && +end > +window.startDate) {
          return indexOwners[0].index + 1;
        }
        return null;
      }
      if (indexOwners.length > 1 || timeOwners.length !== 1) {
        return null;
      }
      const ownLap = timeOwners[0].lap;
      const ownFirst = this.getNumericValue(ownLap.first_length_index);
      const ownCount = this.getNumericValue(ownLap.num_lengths);
      const contradictsOwnRange = ownFirst !== null && Number.isInteger(ownFirst) && ownFirst >= 0 &&
        ownCount !== null && Number.isInteger(ownCount) && ownCount > 0 &&
        (messageIndex < ownFirst || messageIndex >= ownFirst + ownCount);
      if (contradictsOwnRange) {
        return null;
      }
    }
    return timeOwners.length === 1 ? timeOwners[0].index + 1 : null;
  }

  private static getSwimLengthDistance(
    length: any,
    lap: any | undefined,
    lapIndex: number | null,
    poolLength: number | null,
    activeLengthCountByLapIndex: Map<number, number>
  ): number | null {
    const type = this.getSwimLengthType(length?.length_type);
    if (type !== 'active') {
      return null;
    }

    const explicitDistance = this.getNumericValue(length?.total_distance);
    if (explicitDistance !== null) {
      return explicitDistance;
    }

    if (poolLength !== null) {
      return poolLength;
    }

    if (!lap || lapIndex === null) {
      return null;
    }

    const activeLengthCount = activeLengthCountByLapIndex.get(lapIndex);
    const lapDistance = this.getNumericValue(lap?.total_distance);
    if (!activeLengthCount || lapDistance === null) {
      return null;
    }

    return lapDistance / activeLengthCount;
  }

  private static addSwimLengthsFromSessionObject(
    activity: ActivityInterface,
    sessionObject: any,
    fitDataObject: any
  ): void {
    const sessionStartDate = this.getDateFromValue(sessionObject?.start_time);
    const sessionElapsedTime =
      this.getNumericValue(sessionObject?.total_elapsed_time) ?? this.getNumericValue(sessionObject?.total_timer_time);
    const sessionEndDate =
      this.getDateFromValue(sessionObject?.timestamp) ||
      (sessionStartDate && sessionElapsedTime !== null
        ? new Date(sessionStartDate.getTime() + sessionElapsedTime * 1000)
        : null);

    const rawLengths = Array.isArray(sessionObject?.lengths)
      ? sessionObject.lengths
      : Array.isArray(fitDataObject?.lengths)
        ? fitDataObject.lengths
        : [];

    if (!rawLengths.length || !sessionStartDate || !sessionEndDate) {
      return;
    }

    const lengths = rawLengths
      .filter((length: any) => {
        const lengthDate = this.getSwimLengthStartDate(length);
        return (
          !!lengthDate &&
          lengthDate.getTime() >= sessionStartDate.getTime() &&
          lengthDate.getTime() < sessionEndDate.getTime()
        );
      })
      .sort((a: any, b: any) => {
        const aDate = this.getSwimLengthStartDate(a);
        const bDate = this.getSwimLengthStartDate(b);
        return (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
      });

    if (!lengths.length) {
      return;
    }

    const laps = Array.isArray(sessionObject?.laps) ? sessionObject.laps : [];
    const poolLength = this.getPoolLengthMeters(sessionObject);
    const activeLengthCountByLapIndex = new Map<number, number>();
    const lapByIndex = new Map<number, any>();

    laps.forEach((lap: any, index: number) => {
      const lapIndex = index + 1;
      lapByIndex.set(lapIndex, lap);
      const activeLengthCount = lengths.filter((length: any) => {
        return (
          this.getLengthLapIndex(length, laps) === lapIndex && this.getSwimLengthType(length?.length_type) === 'active'
        );
      }).length;
      activeLengthCountByLapIndex.set(lapIndex, activeLengthCount);
    });

    lengths.forEach((length: any, lengthIndex: number) => {
      const startDate = this.getSwimLengthStartDate(length);
      if (!startDate) {
        return;
      }

      const lapIndex = this.getLengthLapIndex(length, laps);
      const lap = lapIndex === null ? undefined : lapByIndex.get(lapIndex);
      const timerTime = this.getNumericValue(length?.total_timer_time);
      const elapsedTime = this.getNumericValue(length?.total_elapsed_time);

      activity.addSwimLength(
        new SwimLength({
          index: lengthIndex + 1,
          lapIndex,
          startDate,
          endDate: this.getSwimLengthEndDate(length, startDate),
          type: this.getSwimLengthType(length?.length_type) || 'unknown',
          stroke: this.getSwimStroke(length?.swim_stroke),
          strokes: this.getNumericValue(length?.total_strokes),
          elapsedTime: elapsedTime === null ? null : new DataDuration(elapsedTime),
          timerTime: timerTime === null ? null : new DataDuration(timerTime),
          distance: (() => {
            const distance = this.getSwimLengthDistance(length, lap, lapIndex, poolLength, activeLengthCountByLapIndex);
            return distance === null ? null : new DataDistance(distance);
          })(),
          poolLength: poolLength === null ? null : new DataDistance(poolLength),
          avgSpeed: (() => {
            const avgSpeed = this.getNumericValue(length?.avg_speed);
            return avgSpeed === null ? null : new DataSpeed(avgSpeed);
          })(),
          avgCadence: (() => {
            const avgCadence = this.getFirstNumericValue(length?.avg_cadence, length?.avg_swimming_cadence);
            return avgCadence === null ? null : new DataStrokeRate(avgCadence);
          })(),
          avgHeartRate: (() => {
            const avgHeartRate = this.getNumericValue(length?.avg_heart_rate);
            return avgHeartRate === null ? null : new DataHeartRate(avgHeartRate);
          })(),
          maxHeartRate: (() => {
            const maxHeartRate = this.getNumericValue(length?.max_heart_rate);
            return maxHeartRate === null ? null : new DataHeartRate(maxHeartRate);
          })(),
          swolf: this.getNumericValue(length?.avg_swolf),
          calories: (() => {
            const calories = this.getNumericValue(length?.total_calories);
            return calories === null ? null : new DataEnergy(calories);
          })()
        })
      );
    });
  }

  private static getValidVO2MaxValue(value: unknown): number | null {
    const numericValue = this.getPositiveNumericValue(value);
    if (numericValue === null || numericValue <= this.MIN_VALID_VO2_MAX || numericValue > this.MAX_VALID_VO2_MAX) {
      return null;
    }

    return numericValue;
  }

  private static getFirstValidVO2MaxValue(...values: unknown[]): number | null {
    for (const value of values) {
      const numericValue = this.getValidVO2MaxValue(value);
      if (numericValue !== null) {
        return numericValue;
      }
    }

    return null;
  }

  private static getUserMetricForSession(userMetrics: unknown, sessionObject: any): any | null {
    if (!Array.isArray(userMetrics) || !userMetrics.length) {
      return null;
    }

    const sessionStart = this.getDateFromValue(sessionObject?.start_time);
    if (!sessionStart) {
      return userMetrics[0];
    }

    return (
      userMetrics.find((metric: any) => {
        const metricStart =
          this.getDateFromValue(metric?.start_of_activity) || this.getDateFromValue(metric?.timestamp);
        return metricStart ? Math.abs(metricStart.getTime() - sessionStart.getTime()) <= 1000 : false;
      }) || userMetrics[0]
    );
  }

  private static getStringValue(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      return trimmedValue ? trimmedValue : null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (value && typeof value === 'object') {
      const enumValueCandidate =
        (value as { mappedValue?: unknown }).mappedValue ??
        (value as { value?: unknown }).value ??
        (value as { rawValue?: unknown }).rawValue ??
        (value as { name?: unknown }).name;

      if (enumValueCandidate !== undefined && enumValueCandidate !== value) {
        return this.getStringValue(enumValueCandidate);
      }
    }

    return null;
  }

  private static getActivityTypeFromSessionObject(session: any): ActivityTypes {
    // FIT sport fields can be either profile IDs (number / numeric string) or already-resolved names.
    // Example for the reported file: sport="rock_climbing", sub_sport=68 ("indoor_climbing").
    const resolvedSport = this.resolveFitProfileName(session.sport, getFitSportName);

    const resolvedSubSportName = this.resolveFitProfileName(session.sub_sport, getFitSubSportName);
    const resolvedSubSport: string | null =
      resolvedSubSportName && resolvedSubSportName !== 'generic' ? resolvedSubSportName : null;

    // FIT diving sub-sports are explicit protocol classifications. Map
    // them before generic activity alias resolution so they retain the
    // canonical scuba/free-diving distinction already modeled by Sports Lib.
    if (resolvedSport === 'diving') {
      switch (resolvedSubSport) {
        case 'single_gas_diving':
        case 'multi_gas_diving':
        case 'gauge_diving':
          return ActivityTypes.ScubaDiving;
        case 'apnea_diving':
        case 'apnea_hunting':
          return ActivityTypes.FreeDiving;
      }
    }

    // 1. Try composite key: sport_subSport (e.g. "rock_climbing_indoor_climbing")
    let activityType: ActivityTypes | null = null;
    if (resolvedSport && resolvedSubSport) {
      activityType = this.getActivityTypeByKey(`${resolvedSport}_${resolvedSubSport}`);
    }

    // 2. Try sub_sport name alone (e.g. "indoor_climbing" or "indoorClimbing")
    if (!activityType || activityType === ActivityTypes.unknown) {
      if (resolvedSubSport) {
        activityType = this.getActivityTypeByKey(resolvedSubSport);
      }
    }

    // 3. sport_profile_name (user-defined profile, most specific after composite key)
    //    e.g. "ENDURO MTB" overrides generic "cycling" sport type.
    if ((!activityType || activityType === ActivityTypes.unknown) && isNumberOrString(session.sport_profile_name)) {
      activityType =
        this.getActivityTypeByKey(session.sport_profile_name) ||
        this.getActivityTypeByKey(`${resolvedSport ?? session.sport}_${session.sport_profile_name}`);
    }

    // 4. Try sport name alone as last resort (e.g. "rock_climbing" or "rockClimbing")
    if (!activityType || activityType === ActivityTypes.unknown) {
      if (resolvedSport) {
        activityType = this.getActivityTypeByKey(resolvedSport);
      }
    }

    if (activityType && activityType !== ActivityTypes.unknown) {
      return activityType;
    }

    const fallbackType =
      this.getActivityTypeByKey(session.sport_profile_name) ||
      this.getActivityTypeByKey(resolvedSubSportName) ||
      this.getActivityTypeByKey(resolvedSport) ||
      this.getActivityTypeByKey(session.sport);

    return fallbackType || ActivityTypes.unknown;
  }

  // @todo move this to a mapper
  public static getStatsFromObject(object: any, activity: ActivityInterface, isLap: boolean): DataInterface[] {
    const stats: DataInterface[] = [];
    const shouldExcludeTerrainSummaryMetrics = ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activity.type);

    // For some unknown reasons... the fit provided total_timer_time & total_elapsed_time could be inverted..
    // Just invert fields if that's the case
    this.swapTimesIfRequired(object);

    // TOTAL ELAPSED TIME on Object (activity, lap...)
    let elapsedTime = 0;
    if (isNumber(object.total_elapsed_time)) {
      elapsedTime = object.total_elapsed_time;
    } else if ((object.timestamp - object.start_time) / 1000) {
      elapsedTime = (object.timestamp - object.start_time) / 1000;
    }

    // 0 should be not included aha it's not legit to have a 0 for total timer time
    // And that typically is a device error we should look at the samples
    // Since start and end date are inclusive for sample size eg at time [0] there can be a value
    if (!elapsedTime) {
      elapsedTime = ActivityUtilities.getDataLength(activity.startDate, activity.endDate) - 1;
    }

    const roundedElapsedTime = Math.round(elapsedTime * 100) / 100;
    stats.push(new DataElapsedTime(roundedElapsedTime));

    // TOTAL TIMER TIME on Object (activity, lap...)
    let timerTime = 0;
    if (isNumber(object.total_timer_time)) {
      timerTime = object.total_timer_time;
    }

    // If timer time is unknown then assign elapsedTime value
    if (!timerTime) {
      timerTime = elapsedTime;
    }

    const roundedTimerTime = Math.round(timerTime * 100) / 100;
    stats.push(new DataDuration(roundedTimerTime));
    stats.push(new DataTimerTime(roundedTimerTime));

    // Moving TIME on Object (activity, lap...)
    let movingTime = isNumber(object.total_moving_time) ? object.total_moving_time : 0;
    if (!movingTime) {
      if (object.lengths && object.lengths.length > 0) {
        object.lengths.forEach((lengthVal: any) => {
          if (lengthVal.length_type === 'active') {
            movingTime += lengthVal.total_timer_time;
          }
        });
      } else if (object.records && object.records.length > 0) {
        const speedThreshold = ActivityTypesMoving.getSpeedThreshold(activity.type);
        object.records.forEach((record: any, index: number) => {
          if ((record.speed || record.enhanced_speed) > speedThreshold) {
            const previousRecordTime =
              object.records[index - 1]?.timestamp || object.start_time || object.records[0].timestamp;
            movingTime += (record.timestamp.getTime() - previousRecordTime.getTime()) / 1000;
          }
        });
      }
    }

    if (isLap) {
      // In case we moved (distance > 0) & moving time is invalid, then set it to timer time value
      if (object.total_distance > 0 && (!movingTime || movingTime > timerTime)) {
        movingTime = timerTime;
      }
    }

    // Append moving stat only if moving time has been detected
    // We need that to compute total global moving time later
    if (movingTime > 0) {
      stats.push(new DataMovingTime(Math.round(movingTime * 100) / 100));
    }

    // Pause TIME on Object (activity, lap...)
    const pause = elapsedTime > timerTime ? Math.round((elapsedTime - timerTime) * 100) / 100 : 0;
    stats.push(new DataPause(pause));

    const getStatValue = (obj: any, keys: string[]): any => {
      for (const key of keys) {
        if (isNumberOrString(obj[key])) {
          return obj[key];
        }
      }
      return null;
    };

    const avgSpeed = getStatValue(object, ['enhanced_avg_speed', 'EnhancedAvgSpeed', 'avg_speed', 'AvgSpeed']);
    const totalDistance = getStatValue(object, ['total_distance', 'TotalDistance']);

    // Assign is active lap status
    stats.push(new DataActiveLap(!!(totalDistance || avgSpeed)));

    if (totalDistance !== null) {
      stats.push(new DataDistance(totalDistance));
    } else {
      stats.push(new DataDistance(0));
    }
    // Heart Rate
    if (isNumberOrString(object.avg_heart_rate)) {
      stats.push(new DataHeartRateAvg(object.avg_heart_rate));
    }
    if (isNumberOrString(object.min_heart_rate)) {
      stats.push(new DataHeartRateMin(object.min_heart_rate));
    }
    if (isNumberOrString(object.max_heart_rate)) {
      stats.push(new DataHeartRateMax(object.max_heart_rate));
    }
    // Cadence
    const cyclingVO2Max = this.getValidVO2MaxValue(object.vo2_max_cycling);
    if (cyclingVO2Max !== null) {
      stats.push(new DataVO2Max(cyclingVO2Max));
    }
    if (isNumberOrString(object.avg_cadence)) {
      stats.push(new DataCadenceAvg(object.avg_cadence));
    }
    if (isNumberOrString(object.min_cadence)) {
      stats.push(new DataCadenceMin(object.min_cadence));
    }
    if (isNumberOrString(object.max_cadence)) {
      stats.push(new DataCadenceMax(object.max_cadence));
    }
    // Power
    if (isNumberOrString(object.avg_power)) {
      stats.push(new DataPowerAvg(object.avg_power));
    }
    // Grit & Flow

    if (isNumberOrString(object.total_flow)) {
      stats.push(new DataTotalFlow(object.total_flow));
    }
    if (isNumberOrString(object.avg_grit)) {
      stats.push(new DataAvgGrit(object.avg_grit));
    }
    if (isNumberOrString(object.avg_flow)) {
      stats.push(new DataAvgFlow(object.avg_flow));
    }
    if (isNumberOrString(object.min_power)) {
      stats.push(new DataPowerMin(object.min_power));
    }
    if (isNumberOrString(object.max_power)) {
      stats.push(new DataPowerMax(object.max_power));
    }

    if (Number.isFinite(object.normalized_power)) {
      stats.push(new DataPowerNormalized(object.normalized_power));
    }

    if (Number.isFinite(object.intensity_factor)) {
      stats.push(new DataPowerIntensityFactor(object.intensity_factor));
    }

    if (isNumberOrString(object.intensity)) {
      stats.push(new DataIntensity(object.intensity));
    }

    if (Number.isFinite(object.training_stress_score) && object.training_stress_score >= 0) {
      stats.push(new DataTrainingStressScore(object.training_stress_score));
      stats.push(new DataTrainingStressScoreMethod(TrainingStressScoreMethod.IMPORTED));
    }

    if (Number.isFinite(object.total_work)) {
      stats.push(new DataPowerWork(Math.round(object.total_work / 1000)));
    }

    if (!isLap && isNumberOrString(object.threshold_power)) {
      const importedFTP = Number(object.threshold_power);
      if (Number.isFinite(importedFTP) && importedFTP > 0) {
        stats.push(new DataFTP(importedFTP));
      }
    }

    if (Number.isFinite(object.avg_left_torque_effectiveness)) {
      stats.push(new DataPowerTorqueEffectivenessLeft(object.avg_left_torque_effectiveness));
    }

    if (Number.isFinite(object.avg_right_torque_effectiveness)) {
      stats.push(new DataPowerTorqueEffectivenessRight(object.avg_right_torque_effectiveness));
    }

    if (Number.isFinite(object.avg_left_pedal_smoothness)) {
      stats.push(new DataPowerPedalSmoothnessLeft(object.avg_left_pedal_smoothness));
    }

    if (Number.isFinite(object.avg_right_pedal_smoothness)) {
      stats.push(new DataPowerPedalSmoothnessRight(object.avg_right_pedal_smoothness));
    }

    // Speed
    if (avgSpeed !== null) {
      stats.push(new DataSpeedAvg(avgSpeed));
    }
    const minSpeed = getStatValue(object, ['enhanced_min_speed', 'EnhancedMinSpeed', 'min_speed', 'MinSpeed']);
    if (minSpeed !== null) {
      stats.push(new DataSpeedMin(minSpeed));
    }
    const maxSpeed = getStatValue(object, ['enhanced_max_speed', 'EnhancedMaxSpeed', 'max_speed', 'MaxSpeed']);
    if (maxSpeed !== null) {
      stats.push(new DataSpeedMax(maxSpeed));
    }

    const avgEffortSpeed = getStatValue(object, ['Effort Pace', 'effort_pace']);
    if (avgEffortSpeed !== null && avgEffortSpeed > 0) {
      const avgEffortPace = convertSpeedToPace(avgEffortSpeed);
      if (Number.isFinite(avgEffortPace)) {
        stats.push(new DataEffortPaceAvg(avgEffortPace));
      }
    }

    // Temperature
    if (isNumberOrString(object.avg_temperature)) {
      stats.push(new DataTemperatureAvg(object.avg_temperature));
    }
    if (isNumberOrString(object.min_temperature)) {
      stats.push(new DataTemperatureMin(object.min_temperature));
    }
    if (isNumberOrString(object.max_temperature)) {
      stats.push(new DataTemperatureMax(object.max_temperature));
    }
    // Ascent
    const ascent = getStatValue(object, ['total_ascent', 'TotalAscent']);
    if (ascent !== null && !shouldExcludeTerrainSummaryMetrics) {
      stats.push(new DataAscent(ascent));
    }
    // Descent
    const descent = getStatValue(object, ['total_descent', 'TotalDescent']);
    if (descent !== null && !shouldExcludeTerrainSummaryMetrics) {
      stats.push(new DataDescent(descent));
    }

    if (isNumberOrString(object.max_depth)) {
      stats.push(new DataDepthMax(object.max_depth));
    }
    if (isNumberOrString(object.avg_depth)) {
      stats.push(new DataDepthAvg(object.avg_depth));
    }

    // Calories
    if (isNumberOrString(object.total_calories)) {
      stats.push(new DataEnergy(object.total_calories));
    }
    if (isNumberOrString(object.metabolic_calories)) {
      stats.push(new DataMetabolicCalories(object.metabolic_calories));
    }

    // Total training effect = Aerobic training effect
    if (isNumberOrString(object.total_training_effect)) {
      stats.push(new DataAerobicTrainingEffect(object.total_training_effect));
    }

    // Total training anaerobic effect
    if (isNumberOrString(object.total_anaerobic_training_effect)) {
      stats.push(new DataAnaerobicTrainingEffect(object.total_anaerobic_training_effect));
    } else if (isNumberOrString(object.total_anaerobic_effect)) {
      stats.push(new DataAnaerobicTrainingEffect(object.total_anaerobic_effect));
    }

    // Vo2Max
    const estimatedVO2Max = this.getValidVO2MaxValue(object.estimated_vo2_max);
    if (estimatedVO2Max !== null) {
      stats.push(new DataVO2Max(estimatedVO2Max));
    }
    // Peak Epoc
    if (isNumberOrString(object.peak_epoc)) {
      stats.push(new DataPeakEPOC(object.peak_epoc));
    }
    // Recovery time
    const recoveryTime = this.getPositiveNumericValue(object.recovery_time);
    if (recoveryTime !== null) {
      stats.push(new DataRecoveryTime(recoveryTime));
    }
    // Feeling
    if (isNumberOrString(object.feeling)) {
      stats.push(new DataFeeling(object.feeling));
    }

    // Pool length
    const poolLength = this.getPoolLengthMeters(object);
    if (poolLength !== null) {
      stats.push(new DataPoolLength(poolLength));
    }

    // Average SWOLF in 25m and 50m pool
    if (
      (activity.type === ActivityTypes.Swimming || activity.type === ActivityTypes.OpenWaterSwimming) &&
      (isNumberOrString(object.avg_speed) || isNumberOrString(object.enhanced_avg_speed)) &&
      isNumberOrString(object.avg_cadence)
    ) {
      const avgPace100m = convertSpeedToSwimPace(object.avg_speed || object.enhanced_avg_speed);

      if (Number.isFinite(avgPace100m) && Number.isFinite(object.avg_cadence)) {
        const avgCadence = object.avg_cadence;

        const swolf25m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgCadence, 25);
        stats.push(new DataSWOLF25m(swolf25m));

        const swolf50m = ActivityUtilities.computeSwimSwolf(avgPace100m, avgCadence, 50);
        stats.push(new DataSWOLF50m(swolf50m));
      }
    }

    if (isNumberOrString(object.avg_stroke_distance)) {
      stats.push(new DataAvgStrokeDistance(object.avg_stroke_distance));
    }

    if (isNumberOrString(object.avg_stroke_count)) {
      stats.push(new DataAvgStrokeCount(object.avg_stroke_count));
    }

    // Active lengths
    if (isNumberOrString(object.num_active_lengths)) {
      stats.push(new DataActiveLengths(object.num_active_lengths));
    }

    // Total cycle
    if (isNumberOrString(object.total_cycles)) {
      stats.push(new DataTotalCycles(object.total_cycles));
    }

    // Description
    if (isNumberOrString(object.description)) {
      stats.push(new DataDescription(object.description));
    }

    // Cycling dynamics
    if (Number.isFinite(object.time_standing)) {
      const standingTime = Math.round(object.time_standing);
      stats.push(new DataCyclingStandingTime(standingTime));

      const seatedTime = Math.round(timerTime - standingTime);
      stats.push(new DataCyclingSeatedTime(seatedTime));
    }

    // Running dynamics
    if (isNumberOrString(object.avg_stance_time)) {
      stats.push(new DataGroundContactTimeAvg(object.avg_stance_time));
    }

    const averageGroundContactTimePercentage = this.getPositiveNumericValue(object.avg_stance_time_percent);
    if (averageGroundContactTimePercentage !== null && averageGroundContactTimePercentage <= 100) {
      stats.push(new DataGroundContactTimePercentageAvg(averageGroundContactTimePercentage));
    }

    const averageGroundContactTimeBalanceLeft = this.getPositiveNumericValue(object.avg_stance_time_balance);
    if (averageGroundContactTimeBalanceLeft !== null && averageGroundContactTimeBalanceLeft <= 100) {
      stats.push(new DataGroundContactTimeBalanceLeft(averageGroundContactTimeBalanceLeft));
      stats.push(
        new DataGroundContactTimeBalanceRight(Math.round((100 - averageGroundContactTimeBalanceLeft) * 100) / 100)
      );
    }

    if (isNumberOrString(object.avg_vertical_oscillation)) {
      stats.push(new DataVerticalOscillationAvg(object.avg_vertical_oscillation));
    }

    if (isNumberOrString(object.avg_vertical_ratio)) {
      stats.push(new DataVerticalRatioAvg(object.avg_vertical_ratio));
    }

    // Grade summary from session stats (if available)
    if (!shouldExcludeTerrainSummaryMetrics && isNumberOrString(object.avg_grade)) {
      stats.push(new DataGradeAvg(object.avg_grade));
    }
    if (!shouldExcludeTerrainSummaryMetrics && isNumberOrString(object.max_pos_grade)) {
      stats.push(new DataGradeMax(object.max_pos_grade));
    }
    if (!shouldExcludeTerrainSummaryMetrics && isNumberOrString(object.max_neg_grade)) {
      stats.push(new DataGradeMin(object.max_neg_grade));
    }

    if (isNumberOrString(object.beginning_potential_stamina)) {
      stats.push(new DataBeginningPotentialStamina(object.beginning_potential_stamina));
    }
    if (isNumberOrString(object.ending_potential_stamina)) {
      stats.push(new DataEndingPotentialStamina(object.ending_potential_stamina));
    }
    if (isNumberOrString(object.min_stamina)) {
      stats.push(new DataStaminaMin(object.min_stamina));
    }

    if (Number.isFinite(object.avg_step_length)) {
      const avgStrideLengthMeters = object.avg_step_length / 1000;
      stats.push(new DataAvgStrideLength(Math.round(avgStrideLengthMeters * 100) / 100));
    }

    // Respiration Rate
    if (isNumberOrString(object.avg_respiration_rate) || isNumberOrString(object.enhanced_avg_respiration_rate)) {
      stats.push(new DataAvgRespirationRate(object.enhanced_avg_respiration_rate ?? object.avg_respiration_rate));
    }
    if (isNumberOrString(object.max_respiration_rate) || isNumberOrString(object.enhanced_max_respiration_rate)) {
      stats.push(new DataMaxRespirationRate(object.enhanced_max_respiration_rate ?? object.max_respiration_rate));
    }
    if (isNumberOrString(object.min_respiration_rate) || isNumberOrString(object.enhanced_min_respiration_rate)) {
      stats.push(new DataMinRespirationRate(object.enhanced_min_respiration_rate ?? object.min_respiration_rate));
    }

    // Total Grit
    if (isNumberOrString(object.total_grit)) {
      stats.push(new DataTotalGrit(object.total_grit));
    }
    // Avg Flow
    if (isNumberOrString(object.avg_flow)) {
      stats.push(new DataAvgFlow(object.avg_flow));
    }
    // Est Sweat Loss
    if (isNumberOrString(object.est_sweat_loss)) {
      stats.push(new DataEstSweatLoss(object.est_sweat_loss));
    }
    // Primary Benefit
    if (isNumberOrString(object.primary_benefit)) {
      stats.push(new DataPrimaryBenefit(object.primary_benefit));
    }
    // Sport Profile Name
    if (object.sport_profile_name) {
      stats.push(new DataSportProfileName(object.sport_profile_name));
    }

    // Jump Count
    if (isNumberOrString(object.jump_count)) {
      stats.push(new DataJumpCount(object.jump_count));
    }

    // Training Load Peak
    if (isNumberOrString(object.training_load_peak)) {
      stats.push(new DataTrainingLoadPeak(object.training_load_peak));
    }

    // Positions
    if (isNumber(object.start_position_lat) && isNumber(object.start_position_long)) {
      stats.push(
        new DataStartPosition({
          latitudeDegrees: object.start_position_lat,
          longitudeDegrees: object.start_position_long
        })
      );
    }
    if (isNumber(object.end_position_lat) && isNumber(object.end_position_long)) {
      stats.push(
        new DataEndPosition({
          latitudeDegrees: object.end_position_lat,
          longitudeDegrees: object.end_position_long
        })
      );
    }

    // Avg VAM
    if (isNumberOrString(object.avg_vam)) {
      // The FIT profile defines avg_vam in m/s. Sports Lib exposes Average VAM in
      // m/h, so convert the parsed source unit to the public metric unit.
      stats.push(new DataAvgVAM(Number(object.avg_vam) * 60 * 60));
    }

    // Jump Statistics
    if (object.jumps && object.jumps.length > 0) {
      const jumps = object.jumps;
      const createJumpAggregate = () => ({
        sum: 0,
        min: Number.MAX_VALUE,
        max: -Number.MAX_VALUE,
        count: 0
      });
      const accumulateJumpValue = (
        aggregate: { sum: number; min: number; max: number; count: number },
        value: unknown
      ) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
          aggregate.sum += value;
          aggregate.min = Math.min(aggregate.min, value);
          aggregate.max = Math.max(aggregate.max, value);
          aggregate.count += 1;
        }
      };

      const hangTimeAggregate = createJumpAggregate();
      const distanceAggregate = createJumpAggregate();
      const speedAggregate = createJumpAggregate();
      const rotationsAggregate = createJumpAggregate();
      const scoreAggregate = createJumpAggregate();
      const heightAggregate = createJumpAggregate();

      jumps.forEach((j: any) => {
        accumulateJumpValue(hangTimeAggregate, j.hang_time);
        accumulateJumpValue(distanceAggregate, j.distance);
        accumulateJumpValue(speedAggregate, j.speed);
        accumulateJumpValue(rotationsAggregate, j.rotations);
        accumulateJumpValue(scoreAggregate, j.score);
        accumulateJumpValue(heightAggregate, j.height);
      });

      if (hangTimeAggregate.count > 0) {
        stats.push(new DataJumpHangTimeMin(hangTimeAggregate.min));
        stats.push(new DataJumpHangTimeMax(hangTimeAggregate.max));
        stats.push(new DataJumpHangTimeAvg(hangTimeAggregate.sum / hangTimeAggregate.count));
      }

      if (distanceAggregate.count > 0) {
        stats.push(new DataJumpDistanceMin(distanceAggregate.min));
        stats.push(new DataJumpDistanceMax(distanceAggregate.max));
        stats.push(new DataJumpDistanceAvg(distanceAggregate.sum / distanceAggregate.count));
      }

      if (speedAggregate.count > 0) {
        stats.push(new DataJumpSpeedMin(speedAggregate.min));
        stats.push(new DataJumpSpeedMax(speedAggregate.max));
        stats.push(new DataJumpSpeedAvg(speedAggregate.sum / speedAggregate.count));
      }

      if (rotationsAggregate.count > 0) {
        stats.push(new DataJumpRotationsMin(rotationsAggregate.min));
        stats.push(new DataJumpRotationsMax(rotationsAggregate.max));
        stats.push(new DataJumpRotationsAvg(rotationsAggregate.sum / rotationsAggregate.count));
      }

      if (scoreAggregate.count > 0) {
        stats.push(new DataJumpScoreMin(scoreAggregate.min));
        stats.push(new DataJumpScoreMax(scoreAggregate.max));
        stats.push(new DataJumpScoreAvg(scoreAggregate.sum / scoreAggregate.count));
      }

      if (heightAggregate.count > 0) {
        stats.push(new DataJumpHeightMin(heightAggregate.min));
        stats.push(new DataJumpHeightMax(heightAggregate.max));
        stats.push(new DataJumpHeightAvg(heightAggregate.sum / heightAggregate.count));
      }
    }

    return stats;
  }

  public static getCreatorFromFitDataObject(fitDataObject: any): CreatorInterface {
    return FITCreatorMapper.getCreatorFromFitDataObject(fitDataObject);
  }
}

export interface FITFileActivityEvent {
  event: string;
  timestamp: Date;
  event_type: 'start' | 'stop' | 'stop_all' | 'stop_disable' | 'stop_disable_all';
  data: number;
}
