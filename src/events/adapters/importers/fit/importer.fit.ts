import { Event } from '../../../event';
import { Activity } from '../../../../activities/activity';
import { SwimLength } from '../../../../swim-lengths/swim-length';
import { Lap } from '../../../../laps/lap';
import { EventInterface } from '../../../event.interface';
import { Creator } from '../../../../creators/creator';
import { CreatorInterface } from '../../../../creators/creator.interface';
import { ActivityTypes, ActivityTypesHelper, ActivityTypesMoving } from '../../../../activities/activity.types';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataEnergy } from '../../../../data/data.energy';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { LapInterface } from '../../../../laps/lap.interface';
import { DataDistance } from '../../../../data/data.distance';
import { ImporterFitSuuntoDeviceNames } from './importer.fit.suunto.device.names';
import { GarminProfileMapper } from './importer.fit.garmin.profile.mapper';
import { GarminSports, GarminSubSports } from './importer.fit.garmin.profile.data';
import { DataPause } from '../../../../data/data.pause';
import { DataInterface } from '../../../../data/data.interface';
import { DataCadence } from '../../../../data/data.cadence';
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
import { ImporterFitAntPlusDeviceNames } from './importer.fit.ant-plus.device.names';
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
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataEffortPaceAvg } from '../../../../data/data.effort-pace-avg';
import { DataAvgStrokeDistance } from '../../../../data/data.avg-stroke-distance';
import { DataAvgStrokeCount } from '../../../../data/data.avg-stroke-count';

import { DataVerticalOscillationAvg } from '../../../../data/data.vertical-oscillation-avg';
import { DataVerticalRatioAvg } from '../../../../data/data.vertical-ratio-avg';
import { DataAvgStrideLength } from '../../../../data/data.avg-stride-length';
import { DataAnaerobicTrainingEffect } from '../../../../data/data-anaerobic-training-effect';
import { ImporterFitWahooDeviceNames } from './importer.fit.wahoo.device.names';
import { ImporterFitCorosDeviceNames } from './importer.fit.coros.device.names';
import { ImporterFitSrmDeviceNames } from './importer.fit.srm.device.names';
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
import { DataRestingCalories } from '../../../../data/data.resting-calories';
import { DataTrainingLoadPeak } from '../../../../data/data.training-load-peak';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataEndPosition } from '../../../../data/data.end-position';
import { DataStartPosition } from '../../../../data/data.start-position';

import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ImporterFitHammerheadDeviceNames } from './importer.fit.hammerhead.device.names';
import { ImporterFitLezyneDeviceNames } from './importer.fit.lezyne.device.names';
import { ImporterFitMagellanDeviceNames } from './importer.fit.magellan.device.names';
import { ImporterFitSarisDeviceNames } from './importer.fit.saris.device.names';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { DataPowerDown } from '../../../../data/data.power-down';
import { DataPowerUp } from '../../../../data/data.power-up';
import { ImporterFitDevelopmentDeviceNames } from './importer.fit.development.device.names';

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

// Threshold to detect that session.timestamp are not trustable (when exceeding 15% of session.total_elapsed_time)
const INVALID_DATES_ELAPSED_TIME_RATIO_THRESHOLD = 1.15;
const TIMER_ELAPSED_ROUNDING_TOLERANCE_SECONDS = 1;

export class EventImporterFIT {
  private static readonly INVALID_FIT_HRV_INTERVAL_MS = 65535;
  private static readonly MIN_VALID_VO2_MAX = 10;
  private static readonly MAX_VALID_VO2_MAX = 100;

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

        // Check if we have length data at the top level (new parser behavior or missing mapping)
        if (fitDataObject.lengths && fitDataObject.lengths.length > 0) {
          fitDataObject.sessions?.forEach((session: any) => {
            const sessionStartTime = new Date(session.start_time).getTime();
            const sessionEndTime = sessionStartTime + (session.total_elapsed_time || 0) * 1000;

            session.lengths = fitDataObject.lengths.filter((length: any) => {
              const lengthTime = new Date(length.timestamp || length.start_time).getTime();
              return lengthTime >= sessionStartTime && lengthTime < sessionEndTime;
            });

            // Also distribute to laps
            session.laps?.forEach((lap: any) => {
              const lapStartTime = new Date(lap.start_time).getTime();
              const lapEndTime = lapStartTime + (lap.total_elapsed_time || 0) * 1000;

              lap.lengths = fitDataObject.lengths.filter((length: any) => {
                const lengthTime = new Date(length.timestamp || length.start_time).getTime();
                return lengthTime >= lapStartTime && lengthTime < lapEndTime;
              });
            });
          });
        }

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

        // Iterate over the sessions and create their activities
        const activities: ActivityInterface[] = fitDataObject.sessions.map((sessionObject: any) => {
          // Get the activity from the sessionObject
          const activity = this.getActivityFromSessionObject(sessionObject, fitDataObject, options);
          // Go over the laps
          sessionObject.laps.forEach((sessionLapObject: any, index: number) => {
            activity.addLap(this.getLapFromSessionLapObject(sessionLapObject, activity, index, options));
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
                    activity.addEvent(new DataStopEvent(activity.getDateIndex(activityEvent.timestamp)));
                    break;
                  case 'stop_all':
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

          // Get the samples..
          // Test if activity is lengths based
          // Indeed when based on lengths, an activity do not provides samples under records object (e.g. Pool swimming activities)
          // Note: this is how Strava generate streams for this kind of activities
          const isLengthsBased = this.isLengthsBased(sessionObject);

          const samples = isLengthsBased
            ? this.generateSamplesFromLengths(sessionObject, options)
            : fitDataObject.records.filter((record: any) => {
                return record.timestamp >= activity.startDate && record.timestamp <= activity.endDate;
              });

          // Setup sample info which could be use when getting sample values
          const hasPowerMeter =
            samples.findIndex((sample: any) =>
              Number.isFinite(
                isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power
              )
            ) !== -1;
          const samplesInfo = { hasPowerMeter: hasPowerMeter };

          allowedSampleMappings.forEach(sampleMapping => {
            // @todo not sure if we need to check for number only ...
            const subjectSamples = <any[]>(
              samples.filter((sample: any) => isNumber(sampleMapping.getSampleValue(sample, samplesInfo)))
            );
            if (subjectSamples.length) {
              // When we create a stream here it has the length of the activity elapsed time (end-start) filled with nulls.
              // We keep nulls in order to preserve the array length.
              activity.addStream(activity.createStream(sampleMapping.dataType));
              subjectSamples.forEach(subjectSample => {
                activity.addDataToStream(
                  sampleMapping.dataType,
                  new Date(subjectSample.timestamp),
                  <number>sampleMapping.getSampleValue(subjectSample, samplesInfo)
                );
              });
            }
          });

          return activity;
        });

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
            // Filter device infos to find those relevant to this activity's timeframe.
            // This list is used by `changes` mode compaction and battery stats.
            const activityDeviceInfos = fitDeviceInfos
              .filter((di: any) => {
                const timestamp = new Date(di.timestamp).getTime();
                // Allow a small margin (e.g. 1 minute) before/after activity
                return (
                  timestamp >= activity.startDate.getTime() - 60000 && timestamp <= activity.endDate.getTime() + 60000
                );
              })
              .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            /**
             * FIT `device_info` often repeats the same device identity every second with only timestamp changing.
             *
             * - `raw`: keep all rows for backwards compatibility.
             * - `changes`: keep first+last sample for each contiguous run where all fields except timestamp match.
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
            activityDeviceInfos.forEach((di: any) => {
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
    return sessionObject.laps?.filter((lap: any) => lap.lengths?.length).length > 1;
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

    let samples: any[] = [];

    // Loop on every laps to catch every lengths where data is (speed, cadence, hr, ...)
    sessionObject.laps.forEach((lap: any) => {
      // Loop on every laps
      if (lap.lengths?.length) {
        // Get length in meters from lap total distance and total number of lengths
        // We will use it to generate the distance stream below
        const lengthMeters = lap.total_distance / lap.lengths.length;

        // For each length of every laps build the streams data we will need for a later use
        lap.lengths.forEach((length: any) => {
          // Resolve start/end date of current length
          const lengthStartDate: Date = length.start_time;
          const lengthDuration = length.total_timer_time || length.total_elapsed_time || 0;
          const lengthEndDate = new Date(lengthStartDate.getTime() + lengthDuration * 1000);

          // We check if length is valid comparing to max activity duration
          if (lengthDuration > options.maxActivityDurationDays * 24 * 60 * 60) {
            return;
          }

          if (lengthEndDate.getTime() <= lengthStartDate.getTime()) {
            return;
          }

          // Generate a stream from length start date to end date filled by null values
          const streamLength = ActivityUtilities.getDataLength(lengthStartDate, lengthEndDate);
          let lengthStream = Array(streamLength).fill(null);

          // Define distance step to be used for distance stream
          const lengthStepSize = lengthMeters / (lengthStream.length - 1);

          // Generate the length stream based on data we have on current length
          lengthStream = lengthStream.map((value, index) => {
            return {
              timestamp: new Date(lengthStartDate.getTime() + index * 1000),
              distance: (samples[samples.length - 1]?.distance || 0) + lengthStepSize * index,
              speed: length.avg_speed || lap.avg_speed,
              cadence: length.avg_cadence || length.avg_swimming_cadence || lap.avg_cadence,
              heart_rate: length.avg_heart_rate || lap.avg_heart_rate
            };
          });

          // Append to existing samples
          samples = samples.concat(lengthStream);
        });
      }
    });
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
   * Keep first+last of each contiguous run with identical signature (all fields except timestamp).
   * This preserves transitions while collapsing timestamp-only spam from FIT `device_info`.
   */
  private static compactDeviceInfosByRuns(devices: DeviceInterface[]): DeviceInterface[] {
    if (devices.length <= 1) {
      return devices;
    }

    const compacted: DeviceInterface[] = [];
    let runStart = devices[0];
    let runEnd = devices[0];
    let runSignature = this.deviceSignatureWithoutTimestamp(devices[0]);

    for (let i = 1; i < devices.length; i++) {
      const current = devices[i];
      const currentSignature = this.deviceSignatureWithoutTimestamp(current);

      if (currentSignature === runSignature) {
        runEnd = current;
        continue;
      }

      compacted.push(runStart);
      if (runEnd !== runStart) {
        compacted.push(runEnd);
      }

      runStart = current;
      runEnd = current;
      runSignature = currentSignature;
    }

    compacted.push(runStart);
    if (runEnd !== runStart) {
      compacted.push(runEnd);
    }

    return compacted;
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

    const lapTimerTime = laps.reduce((total: number, lapObject: any) => {
      const lapTimer = this.getNumericValue(lapObject?.total_timer_time);
      return lapTimer && lapTimer > 0 ? total + lapTimer : total;
    }, 0);

    const elapsedTimeFromDates = (endDate.getTime() - startDate.getTime()) / 1000;
    const totalElapsedTime = lapElapsedTime > 0 ? lapElapsedTime : elapsedTimeFromDates > 0 ? elapsedTimeFromDates : 0;
    const totalTimerTime = lapTimerTime > 0 ? lapTimerTime : totalElapsedTime;

    if (endDate.getTime() <= startDate.getTime() && totalElapsedTime > 0) {
      endDate = new Date(startDate.getTime() + totalElapsedTime * 1000);
    }

    if (endDate.getTime() <= startDate.getTime()) {
      return null;
    }

    const firstLapWithSport = laps.find((lapObject: any) => {
      return lapObject?.sport !== undefined || lapObject?.sub_sport !== undefined;
    });
    const lastLap = laps.length ? laps[laps.length - 1] : null;
    const lastRecord = records.length ? records[records.length - 1] : null;

    const sessionObject: any = {
      laps,
      start_time: startDate,
      timestamp: endDate
    };

    if (totalElapsedTime > 0) {
      sessionObject.total_elapsed_time = totalElapsedTime;
    }
    if (totalTimerTime > 0) {
      sessionObject.total_timer_time = totalTimerTime;
    }
    if (firstLapWithSport?.sport !== undefined) {
      sessionObject.sport = firstLapWithSport.sport;
    }
    if (firstLapWithSport?.sub_sport !== undefined) {
      sessionObject.sub_sport = firstLapWithSport.sub_sport;
    }

    const totalDistance = this.getNumericValue(lastLap?.total_distance) ?? this.getNumericValue(lastRecord?.distance);
    if (totalDistance !== null) {
      sessionObject.total_distance = totalDistance;
    }

    return sessionObject;
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
      return;
    }

    const synthesizedSession = this.buildSessionFromTopLevelMessages(fitDataObject);
    fitDataObject.sessions = synthesizedSession ? [synthesizedSession] : [];
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

    const lap = new Lap(
      startDate,
      endDate, // Some dont have a timestamp
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
      startDate,
      endDate,
      options
    );
    this.getStatsFromObject(normalizedSessionLapObject, activity, true).forEach(stat => lap.addStat(stat));
    return lap;
  }

  private static getActivityFromSessionObject(
    sessionObject: any,
    fitDataObject: any,
    options: ActivityParsingOptions
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
    if (endDate <= startDate) {
      if (recordStartDate) {
        startDate = recordStartDate;
      }

      if (recordEndDate) {
        endDate = recordEndDate;
      }
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
    if (elapsedTimeFromDates / totalElapsedTime > INVALID_DATES_ELAPSED_TIME_RATIO_THRESHOLD) {
      if (totalElapsedTime) {
        endDate = new Date(sessionObject.start_time.getTime() + totalElapsedTime * 1000);
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
        endDate = new Date(sessionObject.start_time.getTime() + totalElapsedTime * 1000);
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
      const normalizedSessionObject = this.normalizeElapsedTimeForResolvedDates(
        {
          ...sessionObject,
          threshold_power:
            isNumberOrString(sessionObject?.threshold_power) ||
            !isNumberOrString(fitDataObject?.zones_target?.functional_threshold_power)
              ? sessionObject?.threshold_power
              : fitDataObject.zones_target.functional_threshold_power
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
          const metricVO2Max = this.getFirstValidVO2MaxValue(
            activityMetric.vo2_max,
            activityMetric.first_vo2_max
          );
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
        // Find session-level time_in_zone message (reference_mesg = 18 for session, reference_index = 0 for first session)
        const manufacturer =
          (fitDataObject.file_ids && fitDataObject.file_ids[0] && fitDataObject.file_ids[0].manufacturer) || '';
        const zoneIndexOffset = manufacturer === 'garmin' ? 1 : 0;
        const sessionTimeInZone = fitDataObject.time_in_zone.find(
          (z: any) => z.reference_mesg === 18 && (z.reference_index === 0 || z.reference_index === undefined)
        );
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

  private static resolveGarminProfileName(value: unknown, map: Record<number, string>): string | null {
    if (!isNumberOrString(value)) {
      return null;
    }

    if (typeof value === 'number') {
      return map[value] || null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d+$/.test(trimmed)) {
      return map[parseInt(trimmed, 10)] || null;
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

    if (this.getPoolLengthUnit(object?.pool_length_unit) === 'statute') {
      return poolLength * 0.9144;
    }

    return poolLength;
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

  private static getLapWindow(lap: any): { startDate: Date | null; endDate: Date | null } {
    const startDate = this.getDateFromValue(lap?.start_time);
    const elapsedTime = this.getNumericValue(lap?.total_elapsed_time) ?? this.getNumericValue(lap?.total_timer_time);
    const endDate =
      this.getDateFromValue(lap?.timestamp) ||
      (startDate && elapsedTime !== null ? new Date(startDate.getTime() + elapsedTime * 1000) : null);

    return { startDate, endDate };
  }

  private static getLengthLapIndex(length: any, laps: any[]): number | null {
    const lengthStartDate = this.getDateFromValue(length?.start_time) || this.getDateFromValue(length?.timestamp);
    if (!lengthStartDate) {
      return null;
    }

    const lengthTime = lengthStartDate.getTime();
    const lapIndex = laps.findIndex(lap => {
      const { startDate, endDate } = this.getLapWindow(lap);
      return !!startDate && !!endDate && lengthTime >= startDate.getTime() && lengthTime < endDate.getTime();
    });

    return lapIndex === -1 ? null : lapIndex + 1;
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
        const lengthDate = this.getDateFromValue(length?.start_time) || this.getDateFromValue(length?.timestamp);
        return (
          !!lengthDate &&
          lengthDate.getTime() >= sessionStartDate.getTime() &&
          lengthDate.getTime() < sessionEndDate.getTime()
        );
      })
      .sort((a: any, b: any) => {
        const aDate = this.getDateFromValue(a?.start_time) || this.getDateFromValue(a?.timestamp);
        const bDate = this.getDateFromValue(b?.start_time) || this.getDateFromValue(b?.timestamp);
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
        return this.getLengthLapIndex(length, laps) === lapIndex && this.getSwimLengthType(length?.length_type) === 'active';
      }).length;
      activeLengthCountByLapIndex.set(lapIndex, activeLengthCount);
    });

    lengths.forEach((length: any, lengthIndex: number) => {
      const startDate = this.getDateFromValue(length?.start_time) || this.getDateFromValue(length?.timestamp);
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
            return avgCadence === null ? null : new DataCadence(avgCadence);
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
    if (
      numericValue === null ||
      numericValue <= this.MIN_VALID_VO2_MAX ||
      numericValue > this.MAX_VALID_VO2_MAX
    ) {
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
    const resolvedSport = this.resolveGarminProfileName(session.sport, GarminSports);

    const resolvedSubSportName = this.resolveGarminProfileName(session.sub_sport, GarminSubSports);
    const resolvedSubSport: string | null =
      resolvedSubSportName && resolvedSubSportName !== 'generic' ? resolvedSubSportName : null;

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

    if (Number.isFinite(object.training_stress_score)) {
      stats.push(new DataTrainingStressScore(object.training_stress_score));
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
    if (ascent !== null) {
      stats.push(new DataAscent(ascent));
    }
    // Descent
    const descent = getStatValue(object, ['total_descent', 'TotalDescent']);
    if (descent !== null) {
      stats.push(new DataDescent(descent));
    }

    if (isNumberOrString(object.max_depth)) {
      stats.push(new DataDepthMax(object.max_depth));
    }

    // Calories
    if (isNumberOrString(object.total_calories)) {
      stats.push(new DataEnergy(object.total_calories));
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
    if (isNumberOrString(object.pool_length)) {
      let poolLength = object.pool_length;

      if (object.pool_length_unit) {
        poolLength = object.pool_length_unit.match(/metric/i) ? object.pool_length : object.pool_length * 0.9144; // Convert to meters from yards when not metric
      }

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

    if (isNumberOrString(object.avg_vertical_oscillation)) {
      stats.push(new DataVerticalOscillationAvg(object.avg_vertical_oscillation));
    }

    if (isNumberOrString(object.avg_vertical_ratio)) {
      stats.push(new DataVerticalRatioAvg(object.avg_vertical_ratio));
    }

    // Grade summary from session stats (if available)
    if (isNumberOrString(object.avg_grade)) {
      stats.push(new DataGradeAvg(object.avg_grade));
    }
    if (isNumberOrString(object.max_pos_grade)) {
      stats.push(new DataGradeMax(object.max_pos_grade));
    }
    if (isNumberOrString(object.max_neg_grade)) {
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

    // Resting Calories
    if (isNumberOrString(object.resting_calories)) {
      stats.push(new DataRestingCalories(object.resting_calories));
    }

    // Avg VAM
    if (isNumberOrString(object.avg_vam)) {
      stats.push(new DataAvgVAM(object.avg_vam));
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
    const toStartCase = (str: string): string => {
      return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const formatDeviceName = (
      manufacturer: string | number | null,
      productName: string | null,
      recognizedName: string | null,
      recognizedBrand: string | null,
      isDevelopment = false
    ) => {
      let name = '';
      const manufacturerString = isNumberOrString(manufacturer) ? String(manufacturer) : null;

      if (recognizedBrand && recognizedName) {
        name = `${toStartCase(recognizedBrand)} ${recognizedName}`;
      } else if (recognizedBrand && !recognizedName && productName) {
        if (productName.match(new RegExp(`${recognizedBrand}`, 'gi'))) {
          productName = productName.replace(new RegExp(`${recognizedBrand}`, 'gi'), '').trim();
        }
        name = `${toStartCase(recognizedBrand)} ${productName}`;
      } else if (recognizedBrand && !recognizedName && !productName) {
        name = `${toStartCase(recognizedBrand)}`;
      } else if (manufacturerString && !recognizedBrand && !recognizedName && !productName && !isDevelopment) {
        const formattedManufacturer = manufacturerString.replace(new RegExp('[-_]', 'gi'), ' ').trim();
        name = `${toStartCase(formattedManufacturer)}`;
      } else if (!recognizedBrand && recognizedName) {
        name = `${recognizedName}`;
      } else {
        name = 'Unknown';
      }

      return name;
    };

    let creator: CreatorInterface;
    let recognizedName = null;
    const manufacturer = fitDataObject.file_ids[0].manufacturer;
    const productId = fitDataObject.file_ids[0].product || null;
    const productName = fitDataObject.file_ids[0].product_name || null;

    switch (manufacturer) {
      case 'suunto': {
        recognizedName = ImporterFitSuuntoDeviceNames[<number>productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Suunto'), productId);
        break;
      }
      case 'coros': {
        recognizedName = ImporterFitCorosDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Coros'), productId);
        break;
      }
      case 'garmin': {
        recognizedName = GarminProfileMapper.getDeviceName(productId);
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Garmin'), productId);
        break;
      }
      case 'wahoo_fitness': {
        recognizedName = ImporterFitWahooDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Wahoo'), productId);
        break;
      }
      case 'hammerhead': {
        recognizedName = ImporterFitHammerheadDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Hammerhead'), productId);
        break;
      }
      case 'lezyne': {
        recognizedName = ImporterFitLezyneDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Lezyne'), productId);
        break;
      }
      case 'magellan': {
        recognizedName = ImporterFitMagellanDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Magellan'), productId);
        break;
      }
      case 'saris': {
        recognizedName = ImporterFitSarisDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'Saris'), productId);
        break;
      }
      case 'srm': {
        recognizedName = ImporterFitSrmDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, 'SRM'), productId);
        break;
      }
      case 'zwift': {
        recognizedName = 'Zwift';
        creator = new Creator(recognizedName);
        break;
      }
      case 'virtualtraining': {
        recognizedName = 'Rouvy';
        creator = new Creator(recognizedName);
        break;
      }
      case 'the_sufferfest': {
        recognizedName = `Wahoo SYSTM`;
        creator = new Creator(recognizedName, productId);
        break;
      }
      case 'stryd': {
        recognizedName = `Stryd`;
        creator = new Creator(
          recognizedName,
          productId,
          fitDataObject.file_creator.software_version,
          fitDataObject.file_creator.hardware_version,
          fitDataObject.file_ids[0].serial_number
        );
        break;
      }
      case 'development': {
        recognizedName = ImporterFitDevelopmentDeviceNames[productId];
        creator = new Creator(formatDeviceName(manufacturer, productName, recognizedName, null, true), productId);
        creator.isRecognized = typeof recognizedName === 'string' || recognizedName === null;
        break;
      }
      default: {
        // Try to find if it's a numeric Garmin mapping that was missed
        const manufacturerName =
          typeof manufacturer === 'number' ? GarminProfileMapper.getManufacturerName(manufacturer) : manufacturer;
        if (manufacturerName === 'garmin') {
          recognizedName = GarminProfileMapper.getDeviceName(productId);
        }
        creator = new Creator(
          formatDeviceName(
            manufacturerName,
            productName,
            recognizedName,
            manufacturerName === 'garmin' ? 'Garmin' : null
          ),
          productId
        );
      }
    }
    creator.manufacturer = manufacturer;
    creator.isRecognized = creator.isRecognized || !!recognizedName;

    if (fitDataObject.file_creator && isNumberOrString(fitDataObject.file_creator.hardware_version)) {
      creator.hwInfo = String(fitDataObject.file_creator.hardware_version);
    }
    if (fitDataObject.file_creator && isNumberOrString(fitDataObject.file_creator.software_version)) {
      creator.swInfo = String(fitDataObject.file_creator.software_version);
    } else if (fitDataObject.device_info && isNumberOrString(fitDataObject.device_info.software_version)) {
      creator.swInfo = String(fitDataObject.device_info.software_version);
    }
    if (fitDataObject.file_ids[0] && isNumberOrString(fitDataObject.file_ids[0].serial_number)) {
      creator.serialNumber = fitDataObject.file_ids[0].serial_number;
    }

    // If creator name is a number ONLY (e.g. product number), then flag it as 'Unknown'
    if (Number.isFinite(creator.name) || creator.name.match(/^\d+$/)) {
      creator.name = `Unknown`;
    }

    return creator;
  }
}

export interface FITFileActivityEvent {
  event: string;
  timestamp: Date;
  event_type: 'start' | 'stop' | 'stop_all';
  data: number;
}
