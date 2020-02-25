import { EventInterface } from '../event.interface';
import { ActivityInterface } from '../../activities/activity.interface';
import { Event } from '../event';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataCadence } from '../../data/data.cadence';
import { DataSpeed, DataSpeedFeetPerSecond, DataSpeedKilometersPerHour, DataSpeedMilesPerHour } from '../../data/data.speed';
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
import { DataTemperature } from '../../data/data.temperature';
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
  DataSpeedMaxMilesPerHour
} from '../../data/data.speed-max';
import {
  DataSpeedMin,
  DataSpeedMinFeetPerSecond,
  DataSpeedMinKilometersPerHour,
  DataSpeedMinMilesPerHour
} from '../../data/data.speed-min';
import {
  DataSpeedAvg,
  DataSpeedAvgFeetPerSecond,
  DataSpeedAvgKilometersPerHour,
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
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
import { DataAscent } from '../../data/data.ascent';
import { DataDescent } from '../../data/data.descent';
import { GeoLibAdapter } from '../../geodesy/adapters/geolib.adapter';
import { DataPaceMax, DataPaceMaxMinutesPerMile } from '../../data/data.pace-max';
import { DataPace, DataPaceMinutesPerMile } from '../../data/data.pace';
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
  convertSpeedToSpeedInMetersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour,
  convertSpeedToSwimPace,
  convertSwimPaceToSwimPacePer100Yard,
  isNumber,
  isNumberOrString
} from './helpers';
import { DataLongitudeDegrees } from '../../data/data.longitude-degrees';
import { StreamDataItem, StreamInterface } from '../../streams/stream.interface';
import { DataActivityTypes } from '../../data/data.activity-types';
import { DataDeviceNames } from '../../data/data.device-names';
import { DataEnergy } from '../../data/data.energy';
import { Privacy } from '../../privacy/privacy.class.interface';
import { DataStartAltitude } from '../../data/data.start-altitude';
import { DataEndAltitude } from '../../data/data.end-altitude';
import { DataSwimPaceMax, DataSwimPaceMaxMinutesPer100Yard } from '../../data/data.swim-pace-max';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from '../../data/data.swim-pace';
import { DataSwimPaceMin, DataSwimPaceMinMinutesPer100Yard } from '../../data/data.swim-pace-min';
import { DataSwimPaceAvg, DataSwimPaceAvgMinutesPer100Yard } from '../../data/data.swim-pace-avg';
import { DataFeeling } from '../../data/data.feeling';
import { DataPowerLeft } from '../../data/data.power-left';
import { DataRightBalance } from '../../data/data.right-balance';
import { DataLeftBalance } from '../../data/data.left-balance';
import { DataPowerRight } from '../../data/data.power-right';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAirPower } from '../../data/data.air-power';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerAvg } from '../../data/data.-air-power-avg';
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
import { DataSpeedZoneOneDuration } from '../../data/data.speed-zone-one-duration';
import { DataSpeedZoneTwoDuration } from '../../data/data.speed-zone-two-duration';
import { DataSpeedZoneThreeDuration } from '../../data/data.speed-zone-three-duration';
import { DataSpeedZoneFourDuration } from '../../data/data.speed-zone-four-duration';
import { DataSpeedZoneFiveDuration } from '../../data/data.speed-zone-five-duration';
import { DynamicDataLoader } from '../../data/data.store';
import { DataStartPosition } from '../../data/data.start-position';
import { DataEndPosition } from '../../data/data.end-position';
import { ActivityTypeGroups, ActivityTypesHelper } from '../../activities/activity.types';

export class EventUtilities {

  private static geoLibAdapter = new GeoLibAdapter();


  // public static async getEventAsTCXBloB(event: EventInterface): Promise<Blob> {
  //   const tcxString = await EventExporterTCX.getAsString(event);
  //   return (new Blob(
  //     [tcxString],
  //     {type: EventExporterTCX.fileType},
  //   ));
  // }

  public static getDataTypeAvg(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    const data = <number[]>activity
      .getSquashedStreamData(streamType, startDate, endDate).filter(streamData => streamData !== Infinity && streamData !== -Infinity);
    return this.getAverage(data);
  }

  public static getAverage(data: number[]): number {
    const sum = data.reduce((sumbuff: number, value: number) => {
      sumbuff += value;
      return sumbuff;
    }, 0);
    return (sum / data.length);
  }

  public static getDataTypeMax(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    return this.getDataTypeMinOrMax(activity, streamType, true, startDate, endDate);
  }

  public static getDataTypeMin(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    return this.getDataTypeMinOrMax(activity, streamType, false, startDate, endDate);
  }

  public static getDataTypeMinToMaxDifference(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    return this.getDataTypeMax(activity, streamType, startDate, endDate) - this.getDataTypeMin(activity, streamType, startDate, endDate);
  }

  public static getDataTypeFirst(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    const data = <number[]>activity
      .getSquashedStreamData(streamType, startDate, endDate);
    return data[0];
  }

  public static getDataTypeLast(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    const data = <number[]>activity
      .getSquashedStreamData(streamType, startDate, endDate);
    return data[data.length - 1];
  }

  public static mergeEvents(events: EventInterface[]): EventInterface {
    events.sort((eventA: EventInterface, eventB: EventInterface) => {
      return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
    });
    const activities = events.reduce((activitiesArray: ActivityInterface[], event) => {
      activitiesArray.push(...event.getActivities());
      return activitiesArray;
    }, []).map((activity) => {
      return activity.setID(null);
    });
    const event = new Event(`Merged at ${(new Date()).toISOString()}`, activities[0].startDate, activities[activities.length - 1].endDate, Privacy.Private, `A merge of 2 or more activities `, true);
    event.addActivities(activities);
    this.generateStatsForAll(event);
    return event;
  }

  public static cropDistance(startDistance: number, endDistance: number, activity: ActivityInterface): ActivityInterface {
    // Short to do the search just in case
    let startDistanceDate: Date | undefined; // Does not sound right
    let endDistanceDate: Date | undefined;

    // debugger;
    activity.getStreamData(DataDistance.type).forEach((distanceFromData, index) => {
      // Find the index with greater dinstnce and convert it to time
      if (startDistance && !startDistanceDate && distanceFromData && distanceFromData >= startDistance) {
        startDistanceDate = new Date(activity.startDate.getTime() + (index * 1000));
        return
      }
      // Same for end
      if (endDistance && !endDistanceDate && distanceFromData && distanceFromData >= endDistance) {
        endDistanceDate = new Date(activity.startDate.getTime() + (index * 1000));
        return
      }
    });

    if (!startDistanceDate && !endDistanceDate) {
      return activity;
    }

    activity = this.cropTime(activity, startDistanceDate, endDistanceDate);

    // Remove because it is invalid, you cannot just offset the distance as a stream I think
    const distanceStream = activity.getAllStreams().find((s => DataDistance.type === s.type));
    if (distanceStream) {
      activity.removeStream(distanceStream);
    }
    const gnssDistanceStream = activity.getAllStreams().find((s => DataGNSSDistance.type === s.type));
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
    activity.getAllStreams().forEach((stream) => {
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


  public static getStreamDataTypesBasedOnDataType(streamToBaseOn: StreamInterface, streams: StreamInterface[]): { [type: string]: { [type: string]: number | null } } {
    return streamToBaseOn.getData().reduce((accu: { [type: string]: { [type: string]: number | null } }, streamDataItem, index) => {
      if (!isNumberOrString(streamDataItem)) {
        return accu
      }
      streams.forEach((stream) => {
        if (isNumberOrString(stream.getData()[index])) {
          accu[<number>streamDataItem] = accu[<number>streamDataItem] || {};
          accu[<number>streamDataItem][stream.type] = stream.getData()[index];
        }
      });
      return accu
    }, {})
  }

  public static getStreamDataTypesBasedOnTime(startDate: Date, endDate: Date, streams: StreamInterface[]): { [type: number]: { [type: string]: number | null } } {
    const streamDataBasedOnTime: { [type: number]: { [type: string]: number | null } } = {};
    for (let i = 0; i < this.getDataLength(startDate, endDate); i++) { // Perhaps this can be optimized with a search function
      streams.forEach((stream: StreamInterface) => {
        if (isNumber(stream.getData()[i])) {
          streamDataBasedOnTime[startDate.getTime() + (i * 1000)] = streamDataBasedOnTime[startDate.getTime() + (i * 1000)] || {};
          streamDataBasedOnTime[startDate.getTime() + (i * 1000)][stream.type] = stream.getData()[i];
        }
      })
    }
    return streamDataBasedOnTime;
  }


  public static getDataLength(startDate: Date, endDate: Date): number {
    return Math.ceil((+endDate - +startDate) / 1000);
  }

  public static generateStatsForAll(event: EventInterface) {
    // First generate that stats on the activity it self
    event.getActivities().forEach((activity: ActivityInterface) => {
      this.generateMissingStreamsAndStatsForActivity(activity)
    });
    this.reGenerateStatsForEvent(event);
  }

  public static generateMissingStreamsAndStatsForActivity(activity: ActivityInterface) {
    this.generateMissingStreamsForActivity(activity);
    activity.addStreams(this.getUnitStreamsFromStreams(activity.getAllStreams()));
    this.generateMissingStatsForActivity(activity);
    this.generateMissingUnitStatsForActivity(activity); // Perhaps this needs to happen on user level so needs to go out of here
  }

  public static reGenerateStatsForEvent(event: EventInterface) {
    event.clearStats();
    event.startDate = event.getFirstActivity().startDate;
    event.endDate = event.getLastActivity().endDate;

    event.addStat(new DataActivityTypes(event.getActivities().map(activity => activity.type)));
    event.addStat(new DataDeviceNames(event.getActivities().map(activity => activity.creator.name)));

    // If only one
    if (event.getActivities().length === 1) {
      event.getFirstActivity().getStats().forEach(stat => {
        event.addStat(stat);
      });
      return;
    }
    event.startDate = event.getFirstActivity().startDate;
    event.endDate = event.getLastActivity().endDate;
    this.getSummaryStatsForActivities(event.getActivities()).forEach(stat => event.addStat(stat));
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
    let averagePace = 0;
    let averageSwimPace = 0;
    let averageTemperature = 0;
    let averageFeeling = 0;
    let averageRPE = 0;

    // Sum Duration
    activities.forEach((activity) => {
      duration += activity.getDuration().getValue();
    });
    stats.push(new DataDuration(duration));

    // Sum pause time
    activities.forEach((activity) => {
      pauseTime += activity.getPause().getValue();
    });
    stats.push(new DataPause(pauseTime));

    // Sum Distance
    activities.forEach((activity) => {
      distance += activity.getDistance().getValue();
    });
    stats.push(new DataDistance(distance));

    // Sum ascent
    activities.forEach((activity) => {
      const activityAscent = activity.getStat(DataAscent.type);
      if (activityAscent) {
        ascent += <number>activityAscent.getValue();
      }
    });
    stats.push(new DataAscent(ascent));

    // Sum descent
    activities.forEach((activity) => {
      const activityDescent = activity.getStat(DataDescent.type);
      if (activityDescent) {
        descent += <number>activityDescent.getValue();
      }
    });
    stats.push(new DataDescent(descent));

    // Sum energy
    activities.forEach((activity) => {
      const activityEnergy = activity.getStat(DataEnergy.type);
      if (activityEnergy) {
        energy += <number>activityEnergy.getValue();
      }
    });
    stats.push(new DataEnergy(energy));

    // Avg Avg HR
    activities.forEach((activity) => {
      const activityAvgHeartRate = activity.getStat(DataHeartRateAvg.type);
      if (activityAvgHeartRate) {
        // The below will fallback for 0
        averageHeartRate = averageHeartRate ? (averageHeartRate + <number>activityAvgHeartRate.getValue()) / 2 : <number>activityAvgHeartRate.getValue();
      }
    });
    if (averageHeartRate) {
      stats.push(new DataHeartRateAvg(averageHeartRate));
    }


    // Avg Avg HR
    activities.forEach((activity) => {
      const activityAvgHeartRate = activity.getStat(DataHeartRateAvg.type);
      if (activityAvgHeartRate) {
        // The below will fallback for 0
        averageHeartRate = averageHeartRate ? (averageHeartRate + <number>activityAvgHeartRate.getValue()) / 2 : <number>activityAvgHeartRate.getValue();
      }
    });
    if (averageHeartRate) {
      stats.push(new DataHeartRateAvg(averageHeartRate));
    }

    // Avg Avg Power
    activities.forEach((activity) => {
      const activityAvgPower = activity.getStat(DataPowerAvg.type);
      if (activityAvgPower) {
        // The below will fallback for 0
        averagePower = averagePower ? (averagePower + <number>activityAvgPower.getValue()) / 2 : <number>activityAvgPower.getValue();
      }
    });
    if (averagePower) {
      stats.push(new DataPowerAvg(averagePower));
    }

    // Avg Avg Cadence
    activities.forEach((activity) => {
      const activityAvgCadence = activity.getStat(DataCadenceAvg.type);
      if (activityAvgCadence) {
        // The below will fallback for 0
        averageCadence = averageCadence ? (averageCadence + <number>activityAvgCadence.getValue()) / 2 : <number>activityAvgCadence.getValue();
      }
    });
    if (averageCadence) {
      stats.push(new DataCadenceAvg(averageCadence));
    }

    // Avg Avg Speed
    activities.forEach((activity) => {
      const activityAvgSpeed = activity.getStat(DataSpeedAvg.type);
      if (activityAvgSpeed) {
        // The below will fallback for 0
        averageSpeed = averageSpeed ? (averageSpeed + <number>activityAvgSpeed.getValue()) / 2 : <number>activityAvgSpeed.getValue();
      }
    });
    if (averageSpeed) {
      stats.push(new DataSpeedAvg(averageSpeed));
    }

    // Avg Avg Pace
    activities.forEach((activity) => {
      const activityAvgPace = activity.getStat(DataPaceAvg.type);
      if (activityAvgPace) {
        // The below will fallback for 0
        averagePace = averagePace ? (averagePace + <number>activityAvgPace.getValue()) / 2 : <number>activityAvgPace.getValue();
      }
    });
    if (averagePace) {
      stats.push(new DataPaceAvg(averagePace));
    }

    // Avg Avg SwimPace
    activities.forEach((activity) => {
      const activityAvgSwimPace = activity.getStat(DataSwimPaceAvg.type);
      if (activityAvgSwimPace) {
        // The below will fallback for 0
        averageSwimPace = averageSwimPace ? (averageSwimPace + <number>activityAvgSwimPace.getValue()) / 2 : <number>activityAvgSwimPace.getValue();
      }
    });
    if (averageSwimPace) {
      stats.push(new DataSwimPaceAvg(averageSwimPace));
    }

    // Avg Avg Temperature
    activities.forEach((activity) => {
      const activityAvgTemperature = activity.getStat(DataTemperatureAvg.type);
      if (activityAvgTemperature) {
        // The below will fallback for 0
        averageTemperature = averageTemperature ? (averageTemperature + <number>activityAvgTemperature.getValue()) / 2 : <number>activityAvgTemperature.getValue();
      }
    });
    if (averageTemperature) {
      stats.push(new DataTemperatureAvg(averageTemperature));
    }

    // Avg Feeling
    activities.forEach((activity) => {
      const activityAvgFeeling = activity.getStat(DataFeeling.type);
      if (activityAvgFeeling) {
        // The below will fallback for 0
        averageFeeling = averageFeeling ? Math.ceil((averageFeeling + <number>activityAvgFeeling.getValue()) / 2) : <number>activityAvgFeeling.getValue();
      }
    });
    if (averageFeeling) {
      stats.push(new DataFeeling(averageFeeling));
    }

    // Avg RPE
    activities.forEach((activity) => {
      const activityAvgRPE = activity.getStat(DataFeeling.type);
      if (activityAvgRPE) {
        // The below will fallback for 0
        averageRPE = averageRPE ? Math.ceil((averageRPE + <number>activityAvgRPE.getValue()) / 2) : <number>activityAvgRPE.getValue();
      }
    });
    if (averageRPE) {
      stats.push(new DataRPE(averageRPE));
    }

    // Zones
    [
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
      DataSpeedZoneOneDuration.type,
      DataSpeedZoneTwoDuration.type,
      DataSpeedZoneThreeDuration.type,
      DataSpeedZoneFourDuration.type,
      DataSpeedZoneFiveDuration.type,
    ].forEach(zone => {
      const zoneDuration = activities.reduce((duration: number | null, activity) => {
        const durationStat = <DataDuration>activity.getStat(zone);
        if (durationStat) {
          duration = duration || 0;
          duration += durationStat.getValue()
        }
        return duration;
      }, null);

      if (isNumber(zoneDuration)) {
        stats.push(DynamicDataLoader.getDataInstanceFromDataType(zone, <number>zoneDuration));
      }
    });

    // Add start and end position
    // This expects the to be sorted
    const activitiesWithStartPosition = activities.filter(activity => activity.getStat(DataStartPosition.type));
    const activitiesWithEndPosition = activities.filter(activity => activity.getStat(DataEndPosition.type));
    if (activitiesWithStartPosition && activitiesWithStartPosition.length) {
      const startPositionStat = <DataStartPosition>activitiesWithStartPosition[0].getStat(DataStartPosition.type);
      stats.push(new DataStartPosition(startPositionStat.getValue()));
    }
    if (activitiesWithEndPosition && activitiesWithEndPosition.length) {
      const endPositionStat = <DataEndPosition>activitiesWithEndPosition[activitiesWithEndPosition.length - 1].getStat(DataEndPosition.type);
      stats.push(new DataEndPosition(endPositionStat.getValue()));
    }
    // debugger;
    return stats;
  }

  public static getEventDataTypeGain(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff?: number): number {
    return this.getEventDataTypeGainOrLoss(activity, streamType, true, starDate, endDate, minDiff);
  }


  public static getEventDataTypeLoss(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff?: number): number {
    return this.getEventDataTypeGainOrLoss(activity, streamType, false, starDate, endDate, minDiff);
  }

  public static getGainOrLoss(data: number[], gain: boolean, minDiff: number = 4) {
    let gainOrLoss = 0;
    data.reduce((previousValue: number, nextValue: number) => {
      // For gain
      if (gain) {
        // Increase the gain if eligible first check to be greater plus diff  [200, 300, 400, 100, 101, 102]
        if ((previousValue + minDiff) <= nextValue) {
          gainOrLoss += nextValue - previousValue;
          return nextValue;
        }
        // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
        if (previousValue < nextValue) {
          return previousValue;
        }
        return nextValue
      }

      // For Loss
      if ((previousValue - minDiff) >= nextValue) {
        gainOrLoss += previousValue - nextValue;
        return nextValue;
      }
      // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
      if (previousValue > nextValue) {
        return previousValue;
      }
      return nextValue;
    });
    return gainOrLoss;
  }

  public static getMax(data: number[]): number {
    return data.reduce(function (previousValue, currentValue) {
      return Math.max(previousValue, currentValue);
    }, -Infinity);
  }

  public static getMin(data: number[]): number {
    return data.reduce(function (previousValue, currentValue) {
      return Math.min(previousValue, currentValue);
    }, Infinity);
  }

  /**
   * Generates missing streams for an activity such as distance etc if they are missing
   * This will always create a steam even if the distance is 0
   * @param activity
   */
  public static generateMissingStreamsForActivity(activity: ActivityInterface): ActivityInterface {
    if (activity.hasStreamData(DataLatitudeDegrees.type) && activity.hasStreamData(DataLatitudeDegrees.type)
      && (!activity.hasStreamData(DataDistance.type) || !activity.hasStreamData(DataGNSSDistance.type))) {
      const streamData = activity.createStream(DataDistance.type).getData(); // Creating does not add it to activity just presets the resolution to 1s
      let distance = 0;
      streamData[0] = distance; // Force first distance sample to be equal to 0 instead of null
      activity.getPositionData().reduce((prevPosition: DataPositionInterface | null, position: DataPositionInterface | null, index: number, array) => {
        if (!position) {
          return prevPosition;
        }
        if (prevPosition && position) {
          distance += this.geoLibAdapter.getDistance([prevPosition, position]);
        }
        streamData[index] = distance;
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
        activity.getStreamDataByDuration(DataDistance.type).forEach((distanceData: StreamDataItem, index: number) => {

          if (distanceData.value === 0) {
            speedStreamData[index] = 0;
            return;
          }

          if (distanceData.value !== null && isFinite(distanceData.time) && distanceData.time > 0) {
            speedStreamData[index] = distanceData.value / (distanceData.time / 1000);
            return;
          }

          speedStreamData[index] = null;

        });
        activity.addStream(new Stream(DataSpeed.type, speedStreamData));
      }
    }

    if (activity.hasStreamData(DataPower.type) && activity.hasStreamData(DataRightBalance.type) && !activity.hasStreamData(DataPowerRight.type)) {
      const rightPowerStream = activity.createStream(DataPowerRight.type);
      const powerStreamData = activity.getStreamData(DataPower.type);
      const rightBalanceStreamData = activity.getStreamData(DataRightBalance.type);
      rightPowerStream.setData(rightBalanceStreamData.reduce((accu: (number | null)[], streamData, index) => {
        const powerStreamDataItem = powerStreamData[index];
        if (streamData === null || !powerStreamData || powerStreamDataItem === null) {
          return accu
        }
        accu[index] = (streamData / 100) * powerStreamDataItem;
        return accu
      }, []));
      activity.addStream(rightPowerStream);
    }

    if (activity.hasStreamData(DataPower.type) && activity.hasStreamData(DataLeftBalance.type) && !activity.hasStreamData(DataPowerLeft.type)) {
      const leftPowerStream = activity.createStream(DataPowerLeft.type);
      const powerStreamData = activity.getStreamData(DataPower.type);
      const leftBalanceStreamData = activity.getStreamData(DataLeftBalance.type);
      leftPowerStream.setData(leftBalanceStreamData.reduce((accu: (number | null)[], streamData, index) => {
        const powerStreamDataItem = powerStreamData[index];
        if (streamData === null || !powerStreamData || powerStreamDataItem === null) {
          return accu
        }
        accu[index] = (streamData / 100) * powerStreamDataItem;
        return accu
      }, []));
      activity.addStream(leftPowerStream);
    }
    return activity;
  }

  public static calculateTotalDistanceForActivity(
    activity: ActivityInterface,
    startDate?: Date,
    endDate?: Date): number {
    return this.geoLibAdapter.getDistance(<DataPositionInterface[]>activity.getPositionData(startDate, endDate).filter((position) => position !== null));
  }

  /**
   * @todo optimize with whitelist
   * @param streams
   */
  public static getUnitStreamsFromStreams(streams: StreamInterface[]): StreamInterface[] {
    const unitStreams: StreamInterface[] = [];

    // Check if they contain the needed info
    const speedStream = streams.find(stream => stream.type === DataSpeed.type);
    const verticalSpeedStream = streams.find(stream => stream.type === DataVerticalSpeed.type);
    let paceStream = streams.find(stream => stream.type === DataPace.type);
    let swimPaceStream = streams.find(stream => stream.type === DataSwimPace.type);

    if (!speedStream) {
      return unitStreams;
    }

    // Pace
    if (!paceStream) {
      paceStream = new Stream(DataPace.type, speedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToPace(<number>dataValue);
      }));
      unitStreams.push(paceStream);
    }

    // Swim Pace
    if (!swimPaceStream) {
      swimPaceStream = new Stream(DataSwimPace.type, speedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSwimPace(<number>dataValue);
      }));
      unitStreams.push(swimPaceStream);
    }

    // Generate speed in Kilometers per hour
    unitStreams.push(new Stream(DataSpeedKilometersPerHour.type, speedStream.getData().map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInKilometersPerHour(<number>dataValue);
    })));

    // Generate speed in Miles per hour
    unitStreams.push(new Stream(DataSpeedMilesPerHour.type, speedStream.getData().map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInMilesPerHour(<number>dataValue);
    })));

    // Generate speed in feet per second
    unitStreams.push(new Stream(DataSpeedFeetPerSecond.type, speedStream.getData().map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInFeetPerSecond(<number>dataValue);
    })));

    // Generate pace in minutes per mile
    unitStreams.push(new Stream(DataPaceMinutesPerMile.type, paceStream.getData().map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertPaceToPaceInMinutesPerMile(<number>dataValue);
    })));

    // Generate swim pace in minutes per 100 yard
    unitStreams.push(new Stream(DataSwimPaceMinutesPer100Yard.type, swimPaceStream.getData().map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSwimPaceToSwimPacePer100Yard(<number>dataValue);
    })));

    // If we have more vertical speed data
    if (verticalSpeedStream) {
      // Generate vertical speed in feet per second
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerSecond.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerSecond(<number>dataValue);
      })));

      // Generate vertical speed in meters per minute
      unitStreams.push(new Stream(DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerMinute(<number>dataValue);
      })));

      unitStreams.push(new Stream(DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerMinute(<number>dataValue);
      })));

      // Generate vertical speed in feet per mintute
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerMinute.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerMinute(<number>dataValue);
      })));

      // Generate vertical speed in meters per hour
      unitStreams.push(new Stream(DataVerticalSpeedMetersPerHour.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerHour(<number>dataValue);
      })));

      // Generate vertical speed in feet per hour
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerHour.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerHour(<number>dataValue);
      })));

      // Generate vertical speed in in kilometers per hour
      unitStreams.push(new Stream(DataVerticalSpeedKilometerPerHour.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInKilometersPerHour(<number>dataValue);
      })));

      // Generate vertical speed in miles per hour
      unitStreams.push(new Stream(DataVerticalSpeedMilesPerHour.type, verticalSpeedStream.getData().map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMilesPerHour(<number>dataValue);
      })));
    }

    return unitStreams;
  }

  private static getEventDataTypeGainOrLoss(
    activity: ActivityInterface,
    streamType: string,
    gain: boolean,
    startDate?: Date,
    endDate?: Date,
    minDiff?: number): number {
    return this.getGainOrLoss(activity.getSquashedStreamData(streamType, startDate, endDate), gain, minDiff);
  }

  private static getDataTypeMinOrMax(
    activity: ActivityInterface,
    streamType: string,
    max: boolean,
    startDate?: Date,
    endDate?: Date): number {
    const data = activity
      .getSquashedStreamData(streamType, startDate, endDate).filter(streamData => streamData !== Infinity && streamData !== -Infinity);
    if (max) {
      return this.getMax(data);
    }
    return this.getMin(data);
  }

  /**
   * Generates the stats for an activity
   * @param activity
   */
  private static generateMissingStatsForActivity(activity: ActivityInterface) {
    // Add the number of points this activity has
    // @todo this wont work since the stats are after the generated streams // Could be wrong and I could still vise versa
    // activity.addStat(new DataNumberOfSamples(activity.getAllStreams().reduce((sum, stream) => sum + stream.getNumericData().length, 0)));

    // If there is no distance
    if (!activity.getStat(DataDistance.type)) {
      let distance = 0;
      if (activity.hasStreamData(DataDistance.type)) {
        distance = activity.getSquashedStreamData(DataDistance.type)[activity.getSquashedStreamData(DataDistance.type).length - 1] || 0;
      } else if (activity.hasStreamData(DataLongitudeDegrees.type) && activity.hasStreamData(DataLatitudeDegrees.type)) {
        distance = this.calculateTotalDistanceForActivity(activity, activity.startDate, activity.endDate);
      }
      activity.addStat(new DataDistance(distance));
    }

    if (!activity.getStat(DataGNSSDistance.type) && activity.hasStreamData(DataGNSSDistance.type)) {
      activity.addStat(new DataGNSSDistance(activity.getSquashedStreamData(DataGNSSDistance.type)[activity.getSquashedStreamData(DataGNSSDistance.type).length - 1]));
    }

    // @todo remove the start date and end date parameters
    // Ascent (altitude gain)
    if (!activity.getStat(DataAscent.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAscent(this.getEventDataTypeGain(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Descent (altitude loss)
    if (!activity.getStat(DataDescent.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataDescent(this.getEventDataTypeLoss(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Max
    if (!activity.getStat(DataAltitudeMax.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeMax(this.getDataTypeMax(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Min
    if (!activity.getStat(DataAltitudeMin.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeMin(this.getDataTypeMin(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Avg
    if (!activity.getStat(DataAltitudeAvg.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeAvg(this.getDataTypeAvg(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }

    // Altitude start
    if (!activity.getStat(DataStartAltitude.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataStartAltitude(this.getDataTypeFirst(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }

    // Altitude end
    if (!activity.getStat(DataEndAltitude.type)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataEndAltitude(this.getDataTypeLast(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }

    // Heart Rate  Max
    if (!activity.getStat(DataHeartRateMax.type)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateMax(this.getDataTypeMax(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Heart Rate Min
    if (!activity.getStat(DataHeartRateMin.type)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateMin(this.getDataTypeMin(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Heart Rate Avg
    if (!activity.getStat(DataHeartRateAvg.type)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateAvg(this.getDataTypeAvg(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Cadence Max
    if (!activity.getStat(DataCadenceMax.type)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceMax(this.getDataTypeMax(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Cadence Min
    if (!activity.getStat(DataCadenceMin.type)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceMin(this.getDataTypeMin(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Cadence Avg
    if (!activity.getStat(DataCadenceAvg.type)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceAvg(this.getDataTypeAvg(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Speed Max
    if (!activity.getStat(DataSpeedMax.type)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedMax(this.getDataTypeMax(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Speed Min
    if (!activity.getStat(DataSpeedMin.type)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedMin(this.getDataTypeMin(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Speed Avg
    if (!activity.getStat(DataSpeedAvg.type)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedAvg(this.getDataTypeAvg(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Pace Max
    if (!activity.getStat(DataPaceMax.type)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceMax(this.getDataTypeMin(activity, DataPace.type, activity.startDate, activity.endDate))); // Intentionally min
    }
    // Pace Min
    if (!activity.getStat(DataPaceMin.type)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceMin(this.getDataTypeMax(activity, DataPace.type, activity.startDate, activity.endDate))); // Intentionally max
    }
    // Pace Avg
    if (!activity.getStat(DataPaceAvg.type)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceAvg(this.getDataTypeAvg(activity, DataPace.type, activity.startDate, activity.endDate)));
    }

    // Swim Pace Max
    if (!activity.getStat(DataSwimPaceMax.type)
      && activity.hasStreamData(DataSwimPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSwimPaceMax(this.getDataTypeMin(activity, DataSwimPace.type, activity.startDate, activity.endDate))); // Intentionally min
    }
    // Swim Pace Min
    if (!activity.getStat(DataSwimPaceMin.type)
      && activity.hasStreamData(DataSwimPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSwimPaceMin(this.getDataTypeMax(activity, DataSwimPace.type, activity.startDate, activity.endDate))); // Intentionally max
    }
    // Swim Pace Avg
    if (!activity.getStat(DataSwimPaceAvg.type)
      && activity.hasStreamData(DataSwimPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSwimPaceAvg(this.getDataTypeAvg(activity, DataSwimPace.type, activity.startDate, activity.endDate)));
    }

    // Vertical Speed Max
    if (!activity.getStat(DataVerticalSpeedMax.type)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedMax(this.getDataTypeMax(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Vertical Speed Min
    if (!activity.getStat(DataVerticalSpeedMin.type)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedMin(this.getDataTypeMin(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Vertical Speed Avg
    if (!activity.getStat(DataVerticalSpeedAvg.type)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedAvg(this.getDataTypeAvg(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Power Max
    if (!activity.getStat(DataPowerMax.type)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerMax(this.getDataTypeMax(activity, DataPower.type, activity.startDate, activity.endDate)));
    }
    // Power Min
    if (!activity.getStat(DataPowerMin.type)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerMin(this.getDataTypeMin(activity, DataPower.type, activity.startDate, activity.endDate)));
    }
    // Power AVG
    if (!activity.getStat(DataPowerAvg.type)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerAvg(this.getDataTypeAvg(activity, DataPower.type, activity.startDate, activity.endDate)));
    }

    // Air AirPower Max
    if (!activity.getStat(DataAirPowerMax.type)
      && activity.hasStreamData(DataAirPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAirPowerMax(this.getDataTypeMax(activity, DataAirPower.type, activity.startDate, activity.endDate)));
    }
    // Air AirPower Min
    if (!activity.getStat(DataAirPowerMin.type)
      && activity.hasStreamData(DataAirPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAirPowerMin(this.getDataTypeMin(activity, DataAirPower.type, activity.startDate, activity.endDate)));
    }
    // Air AirPower AVG
    if (!activity.getStat(DataAirPowerAvg.type)
      && activity.hasStreamData(DataAirPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAirPowerAvg(this.getDataTypeAvg(activity, DataAirPower.type, activity.startDate, activity.endDate)));
    }

    // Temperature Max
    if (!activity.getStat(DataTemperatureMax.type)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureMax(this.getDataTypeMax(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }
    // Temperature Min
    if (!activity.getStat(DataTemperatureMin.type)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureMin(this.getDataTypeMin(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }
    // Temperature Avg
    if (!activity.getStat(DataTemperatureAvg.type)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureAvg(this.getDataTypeAvg(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }

    // Battery Consumption Avg
    if (!activity.getStat(DataBatteryConsumption.type)
      && activity.hasStreamData(DataBatteryCharge.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataBatteryConsumption(this.getDataTypeMinToMaxDifference(activity, DataBatteryCharge.type, activity.startDate, activity.endDate)));
    }

    // Battery Life Estimation based on Consumption
    if (!activity.getStat(DataBatteryLifeEstimation.type)) {
      const consumption = activity.getStat(DataBatteryConsumption.type);
      if (consumption && consumption.getValue()) {
        activity.addStat(new DataBatteryLifeEstimation(Number((+activity.endDate - +activity.startDate) / 1000 * 100) / Number(consumption.getValue())));
      }
    }

    // Start and end position
    if ((!activity.getStat(DataStartPosition.type) || !activity.getStat(DataEndPosition.type))
      && activity.hasStreamData(DataLatitudeDegrees.type, activity.startDate, activity.endDate) && activity.hasStreamData(DataLongitudeDegrees.type, activity.startDate, activity.endDate)) {
      const activityPositionData = activity
        .getPositionData(activity.startDate, activity.endDate, activity.getStream(DataLatitudeDegrees.type), activity.getStream(DataLongitudeDegrees.type))
        .filter(data => data !== null);
      const startPosition = activityPositionData[0];
      const endPosition = activityPositionData[activityPositionData.length - 1];
      if (startPosition && !activity.getStat(DataStartPosition.type)) {
        activity.addStat(new DataStartPosition(startPosition));
      }
      if (endPosition && !activity.getStat(DataEndPosition.type)) {
        activity.addStat(new DataEndPosition(endPosition));
      }
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
    // Swim Pace
    if (!activity.getStat(DataSwimPaceMaxMinutesPer100Yard.type)) {
      const swimPaceMax = activity.getStat(DataSwimPaceMax.type);
      if (swimPaceMax) {
        activity.addStat(new DataSwimPaceMaxMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceMax.getValue())));
      }
    }
    if (!activity.getStat(DataSwimPaceMinMinutesPer100Yard.type)) {
      const swimPaceMin = activity.getStat(DataSwimPaceMin.type);
      if (swimPaceMin) {
        activity.addStat(new DataSwimPaceMinMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceMin.getValue())));
      }
    }
    if (!activity.getStat(DataSwimPaceAvgMinutesPer100Yard.type)) {
      const swimPaceAvg = activity.getStat(DataPaceAvg.type);
      if (swimPaceAvg) {
        activity.addStat(new DataSwimPaceAvgMinutesPer100Yard(convertSwimPaceToSwimPacePer100Yard(<number>swimPaceAvg.getValue())));
      }
    }

    // Speed
    if (!activity.getStat(DataSpeedMaxKilometersPerHour.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(new DataSpeedMaxKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedMax.getValue())));
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
        activity.addStat(new DataSpeedMaxFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMax.getValue())));
      }
    }

    if (!activity.getStat(DataSpeedMaxFeetPerMinute.type)) {
      const speedMax = activity.getStat(DataSpeedMax.type);
      if (speedMax) {
        activity.addStat(new DataSpeedMaxFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>speedMax.getValue())));
      }
    }

    if (!activity.getStat(DataSpeedMinKilometersPerHour.type)) {
      const speedMin = activity.getStat(DataSpeedMin.type);
      if (speedMin) {
        activity.addStat(new DataSpeedMinKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedMin.getValue())));
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
        activity.addStat(new DataSpeedMinFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedMin.getValue())));
      }
    }

    if (!activity.getStat(DataSpeedAvgKilometersPerHour.type)) {
      const speedAvg = activity.getStat(DataSpeedAvg.type);
      if (speedAvg) {
        activity.addStat(new DataSpeedAvgKilometersPerHour(convertSpeedToSpeedInKilometersPerHour(<number>speedAvg.getValue())));
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
        activity.addStat(new DataSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>speedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerSecond.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerMinute.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerMinute.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMetersPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgFeetPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgKilometerPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgKilometerPerHour(convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedAvgMilesPerHour.type)) {
      const verticalSpeedAvg = activity.getStat(DataVerticalSpeedAvg.type);
      if (verticalSpeedAvg) {
        activity.addStat(new DataVerticalSpeedAvgMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedAvg.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerSecond.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMetersPerMinute.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerMinute.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMetersPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxFeetPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxKilometerPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxKilometerPerHour(convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMaxMilesPerHour.type)) {
      const verticalSpeedMax = activity.getStat(DataVerticalSpeedMax.type);
      if (verticalSpeedMax) {
        activity.addStat(new DataVerticalSpeedMaxMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedMax.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerSecond.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinFeetPerSecond(convertSpeedToSpeedInFeetPerSecond(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMetersPerMinute.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinMetersPerMinute(convertSpeedToSpeedInMetersPerMinute(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerMinute.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinFeetPerMinute(convertSpeedToSpeedInFeetPerMinute(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMetersPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinMetersPerHour(convertSpeedToSpeedInMetersPerHour(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinFeetPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinFeetPerHour(convertSpeedToSpeedInFeetPerHour(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinKilometerPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinKilometerPerHour(convertSpeedToSpeedInKilometersPerHour(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataVerticalSpeedMinMilesPerHour.type)) {
      const verticalSpeedMin = activity.getStat(DataVerticalSpeedMin.type);
      if (verticalSpeedMin) {
        activity.addStat(new DataVerticalSpeedMinMilesPerHour(convertSpeedToSpeedInMilesPerHour(<number>verticalSpeedMin.getValue())));
      }
    }

    if (!activity.getStat(DataDuration.type)) {
      activity.addStat(new DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000))
    }

    if (activity.hasStreamData(DataSpeed.type)) {

      const speedStream = activity.getStreamDataByDuration(DataSpeed.type, true, true);

      let speedThreshold: number;

      if (ActivityTypesHelper.getActivityGroupForActivityType(activity.type) === ActivityTypeGroups.Cycling) {
        speedThreshold = 1.9;
      } else if ((ActivityTypesHelper.getActivityGroupForActivityType(activity.type) === ActivityTypeGroups.Running)) {
        speedThreshold = 1.2;
      } else {
        speedThreshold = 0;
      }

      let movingTime = 0;
      speedStream.forEach((speedEntry, index) => {

        if (index === 0) {
          return;
        }

        const deltaTime = speedStream[index].time - speedStream[index - 1].time;

        if (<number>speedEntry.value >= speedThreshold) {
          movingTime += deltaTime;
        }

      });

      movingTime = movingTime / 1000;

      const duration = <number>(<DataInterface>activity.getStat(DataDuration.type)).getValue();
      activity.setPause(new DataPause(duration - movingTime));
    }

    // If there is no pause define that from the start date and end date and duration
    if (!activity.getStat(DataPause.type)) {
      activity.addStat(new DataPause(((activity.endDate.getTime() - activity.startDate.getTime()) / 1000) - activity.getDuration().getValue()))
    }

  }
}

