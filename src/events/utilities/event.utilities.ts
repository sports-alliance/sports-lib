import {EventInterface} from '../event.interface';
import {ActivityInterface} from '../../activities/activity.interface';
import {Event} from '../event';
import {DataHeartRate} from '../../data/data.heart-rate';
import {DataCadence} from '../../data/data.cadence';
import {
  DataSpeed, DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedMilesPerHour
} from '../../data/data.speed';
import {
  DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour
} from '../../data/data.vertical-speed';
import {DataTemperature} from '../../data/data.temperature';
import {DataAltitude} from '../../data/data.altitude';
import {DataPower} from '../../data/data.power';
import {DataAltitudeMax} from '../../data/data.altitude-max';
import {DataAltitudeMin} from '../../data/data.altitude-min';
import {DataAltitudeAvg} from '../../data/data.altitude-avg';
import {DataHeartRateMax} from '../../data/data.heart-rate-max';
import {DataHeartRateMin} from '../../data/data.heart-rate-min';
import {DataHeartRateAvg} from '../../data/data.heart-rate-avg';
import {DataCadenceMax} from '../../data/data.cadence-max';
import {DataCadenceMin} from '../../data/data.cadence-min';
import {DataCadenceAvg} from '../../data/data.cadence-avg';
import {
  DataSpeedMax,
  DataSpeedMaxFeetPerMinute, DataSpeedMaxFeetPerSecond,
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
  DataVerticalSpeedMax, DataVerticalSpeedMaxFeetPerHour, DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxFeetPerSecond, DataVerticalSpeedMaxKilometerPerHour, DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxMetersPerMinute, DataVerticalSpeedMaxMilesPerHour
} from '../../data/data.vertical-speed-max';
import {
  DataVerticalSpeedMin, DataVerticalSpeedMinFeetPerHour, DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinFeetPerSecond, DataVerticalSpeedMinKilometerPerHour, DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinMetersPerMinute, DataVerticalSpeedMinMilesPerHour
} from '../../data/data.vertical-speed-min';
import {
  DataVerticalSpeedAvg, DataVerticalSpeedAvgFeetPerHour, DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgFeetPerSecond, DataVerticalSpeedAvgKilometerPerHour, DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgMetersPerMinute, DataVerticalSpeedAvgMilesPerHour
} from '../../data/data.vertical-speed-avg';
import {DataPowerMax} from '../../data/data.power-max';
import {DataPowerMin} from '../../data/data.power-min';
import {DataPowerAvg} from '../../data/data.power-avg';
import {DataTemperatureMax} from '../../data/data.temperature-max';
import {DataTemperatureMin} from '../../data/data.temperature-min';
import {DataTemperatureAvg} from '../../data/data.temperature-avg';
import {DataDistance} from '../../data/data.distance';
import {DataDuration} from '../../data/data.duration';
import {DataPause} from '../../data/data.pause';
import {DataAscent} from '../../data/data.ascent';
import {DataDescent} from '../../data/data.descent';
import {GeoLibAdapter} from '../../geodesy/adapters/geolib.adapter';
import {DataPaceMax, DataPaceMaxMinutesPerMile} from '../../data/data.pace-max';
import {DataPace, DataPaceMinutesPerMile} from '../../data/data.pace';
import {DataPaceMin, DataPaceMinMinutesPerMile} from '../../data/data.pace-min';
import {DataPaceAvg, DataPaceAvgMinutesPerMile} from '../../data/data.pace-avg';
import {DataBatteryCharge} from '../../data/data.battery-charge';
import {DataBatteryConsumption} from '../../data/data.battery-consumption';
import {DataBatteryLifeEstimation} from '../../data/data.battery-life-estimation';
import {DataPositionInterface} from '../../data/data.position.interface';
import {DataLatitudeDegrees} from '../../data/data.latitude-degrees';
import {Stream} from '../../streams/stream';
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
  isNumber, isNumberOrString
} from './helpers';
import {DataLongitudeDegrees} from '../../data/data.longitude-degrees';
import {StreamInterface} from '../../streams/stream.interface';
import {DataActivityTypes} from "../../data/data.activity-types";
import {DataDeviceNames} from "../../data/data.device-names";
import {DataEnergy} from "../../data/data.energy";

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
      .getSquashedStreamData(streamType, startDate, endDate);
    const average = data.reduce((average: number, value: number) => {
      average += value;
      return average;
    }, 0);
    return (average / data.length);
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

  public static getDataTypeDifference(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    return this.getDataTypeMax(activity, streamType, startDate, endDate) - this.getDataTypeMin(activity, streamType, startDate, endDate);
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
    const event = new Event(`Merged at ${(new Date()).toISOString()}`, activities[0].startDate, activities[activities.length - 1].endDate);
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

    const distanceStream = activity.getAllStreams().find(stream => stream.type === DataDistance.type);
    if (distanceStream) {
      activity.removeStream(distanceStream);
    }

    // Should  reset all stats
    activity.clearStats();

    // Set the distance
    activity.setDistance(new DataDistance(endDistance - startDistance));

    return activity;
  }

  public static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface {
    activity.getAllStreams().forEach((stream) => {
      // Get the data for the range specified
      const trimmedStreamData = activity.getStreamData(stream.type, startDate, endDate);
      // debugger;
      activity.removeStream(stream);
      activity.addStream(new Stream(stream.type, trimmedStreamData));
    });

    activity.startDate = startDate || activity.startDate;
    activity.endDate = endDate || activity.endDate;
    // debugger
    return activity;
  }


  public static getStreamDataTypesBasedOnDataType(streamToBaseOn: StreamInterface, streams: StreamInterface[]): { [type: string]: { [type: string]: number | null } } {
    return streamToBaseOn.data.reduce((accu: { [type: string]: { [type: string]: number | null } }, streamDataItem, index) => {
      if (!isNumberOrString(streamDataItem)) {
        return accu
      }
      streams.forEach((stream) => {
        if (isNumberOrString(stream.data[index])) {
          accu[<number>streamDataItem] = accu[<number>streamDataItem] || {};
          accu[<number>streamDataItem][stream.type] = stream.data[index];
        }
      });
      return accu
    }, {})
  }

  public static getStreamDataTypesBasedOnTime(startDate: Date, endDate: Date, streams: StreamInterface[]): { [type: number]: { [type: string]: number | null } } {
    const streamDataBasedOnTime: { [type: number]: { [type: string]: number | null } } = {};
    for (let i = 0; i < this.getDataLength(startDate, endDate); i++) { // Perhaps this can be optimized with a search function
      streams.forEach((stream: StreamInterface) => {
        if (isNumber(stream.data[i])) {
          streamDataBasedOnTime[startDate.getTime() + (i * 1000)] = streamDataBasedOnTime[startDate.getTime() + (i * 1000)] || {};
          streamDataBasedOnTime[startDate.getTime() + (i * 1000)][stream.type] = stream.data[i];
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
    event.setDuration(new DataDuration(0));
    event.addStat(new DataAscent(0));
    event.addStat(new DataDescent(0));
    event.addStat(new DataEnergy(0));
    event.getActivities().forEach((activity) => {
      event.setDuration(new DataDuration(event.getDuration().getValue() + activity.getDuration().getValue()));
    });

    event.setPause(new DataPause(0));
    event.getActivities().forEach((activity) => {
      event.setPause(new DataPause(event.getPause().getValue() + activity.getPause().getValue()));
    });

    event.setDistance(new DataDistance(0));
    event.getActivities().forEach((activity) => {
      event.setDistance(new DataDistance(event.getDistance().getValue() + activity.getDistance().getValue()));
    });

    event.getActivities().forEach((activity) => {
      const activityAscent = activity.getStat(DataAscent.type);
      if (activityAscent) {
        const ascent = event.getStat(DataAscent.type);
        if (!ascent) {
          event.addStat(new DataAscent(<number>activityAscent.getValue()))
        } else {
          event.addStat(new DataAscent(<number>ascent.getValue() + <number>activityAscent.getValue()))
        }
      }
    });

    event.getActivities().forEach((activity) => {
      const activityDescent = activity.getStat(DataDescent.type);
      if (activityDescent) {
        const Descent = event.getStat(DataDescent.type);
        if (!Descent) {
          event.addStat(new DataDescent(<number>activityDescent.getValue()))
        } else {
          event.addStat(new DataDescent(<number>Descent.getValue() + <number>activityDescent.getValue()))
        }
      }
    });

    event.getActivities().forEach((activity) => {
      const activityEnergy = activity.getStat(DataEnergy.type);
      if (activityEnergy) {
        const energy = event.getStat(DataDescent.type);
        if (!energy) {
          event.addStat(new DataEnergy(<number>activityEnergy.getValue()))
        } else {
          event.addStat(new DataEnergy(<number>energy.getValue() + <number>activityEnergy.getValue()))
        }
      }
    });

    event.getActivities().forEach((activity) => {
      const activityAVGHeartRate = activity.getStat(DataHeartRateAvg.type);
      if (activityAVGHeartRate) {
        const avgHR = event.getStat(DataHeartRateAvg.type);
        if (!avgHR) {
          event.addStat(new DataHeartRateAvg(<number>activityAVGHeartRate.getValue()))
        } else {
          event.addStat(new DataHeartRateAvg((<number>avgHR.getValue() + <number>activityAVGHeartRate.getValue()) / 2));
        }
      }
    });

  }

  public static getEventDataTypeGain(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff: number = 5): number {
    return this.getEventDataTypeGainOrLoss(activity, streamType, true, starDate, endDate, minDiff);
  }


  public static getEventDataTypeLoss(
    activity: ActivityInterface,
    streamType: string,
    starDate?: Date,
    endDate?: Date,
    minDiff: number = 5): number {
    return this.getEventDataTypeGainOrLoss(activity, streamType, false, starDate, endDate, minDiff);
  }

  private static getEventDataTypeGainOrLoss(
    activity: ActivityInterface,
    streamType: string,
    gain: boolean,
    startDate?: Date,
    endDate?: Date,
    minDiff: number = 5): number {
    // debugger;
    let gainOrLoss = 0;
    activity.getSquashedStreamData(streamType, startDate, endDate)
      .reduce((previousValue: number, nextValue: number) => {
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

  private static getDataTypeMinOrMax(
    activity: ActivityInterface,
    streamType: string,
    max: boolean,
    startDate?: Date,
    endDate?: Date): number {
    const data = activity
      .getSquashedStreamData(streamType, startDate, endDate)
    if (max) {
      return data.reduce(function (previousValue, currentValue) {
        return Math.max(previousValue, currentValue);
      }, -Infinity);
    }
    return data.reduce(function (previousValue, currentValue) {
      return Math.min(previousValue, currentValue);
    }, Infinity);
  }


  /**
   * Generates the stats for an activity
   * @param activity
   */
  private static generateMissingStatsForActivity(activity: ActivityInterface) {
    // Add the number of points this activity has
    // @todo this wont work since the stats are after the generated streams // Could be wrong and I could still vise versa
    // activity.addStat(new DataNumberOfSamples(activity.getAllStreams().reduce((sum, stream) => sum + stream.getNumericData().length, 0)));

    // If there is no duration define that from the start date and end date
    if (!activity.getStat(DataDuration.type)) {
      activity.addStat(new DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000))
    }

    // If there is no pause define that from the start date and end date and duration
    if (!activity.getStat(DataPause.type)) {
      activity.addStat(new DataPause(((activity.endDate.getTime() - activity.startDate.getTime()) / 1000) - activity.getDuration().getValue()))
    }

    // If there is no distance
    if (!activity.getStat(DataDistance.type)) {
      let distance = 0;
      if (activity.hasStreamData(DataDistance.type)) {
        distance = activity.getSquashedStreamData(DataDistance.type)[activity.getSquashedStreamData(DataDistance.type).length - 1] || 0;
      } else if (activity.hasStreamData(DataLongitudeDegrees.type) && activity.hasStreamData(DataLatitudeDegrees.type)) {
        distance = this.generateDistanceForActivity(activity, activity.startDate, activity.endDate);
      }
      activity.addStat(new DataDistance(distance));
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
    if (!activity.getStat(DataPowerAvg.type)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerAvg(this.getDataTypeAvg(activity, DataPower.type, activity.startDate, activity.endDate)));
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
      activity.addStat(new DataBatteryConsumption(this.getDataTypeDifference(activity, DataBatteryCharge.type, activity.startDate, activity.endDate)));
    }

    // Battery Life Estimation based on Consumption
    if (!activity.getStat(DataBatteryLifeEstimation.type)) {
      const consumption = activity.getStat(DataBatteryConsumption.type);
      if (consumption && consumption.getValue()) {
        activity.addStat(new DataBatteryLifeEstimation(Number((+activity.endDate - +activity.startDate) / 1000 * 100) / Number(consumption.getValue())));
      }
    }
  }

  // @todo move to factory
  private static generateMissingUnitStatsForActivity(activity: ActivityInterface) {
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

  }

  /**
   * Generates missing streams for an activity such as distance etc if they are missing
   * @param activity
   */
  public static generateMissingStreamsForActivity(activity: ActivityInterface): ActivityInterface {
    // Generate distance
    if (activity.hasStreamData(DataLatitudeDegrees.type) && !activity.hasStreamData(DataDistance.type)) {
      const distanceStream = activity.createStream(DataDistance.type);
      let distance = 0;
      activity.getPositionData().reduce((prevPosition: DataPositionInterface | null, position: DataPositionInterface | null, index: number, array) => {
        // debugger;
        if (!position) {
          return prevPosition;
        }

        if (prevPosition && position) {
          distance += this.geoLibAdapter.getDistance([prevPosition, position]);
        }

        distanceStream.data[index] = distance;
        return position;
      });
      activity.addStream(distanceStream);
    }

    return activity;
  }

  public static generateDistanceForActivity(
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

    if (!speedStream) {
      return unitStreams;
    }

    if (!paceStream) {
      paceStream = new Stream(DataPace.type, speedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToPace(<number>dataValue);
      }));
      unitStreams.push(paceStream);
    }

    // Generate speed in Kilometers per hour
    unitStreams.push(new Stream(DataSpeedKilometersPerHour.type, speedStream.data.map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInKilometersPerHour(<number>dataValue);
    })));
    // Generate speed in Miles per hour
    unitStreams.push(new Stream(DataSpeedMilesPerHour.type, speedStream.data.map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInMilesPerHour(<number>dataValue);
    })));
    // Generate speed in feet per second
    unitStreams.push(new Stream(DataSpeedFeetPerSecond.type, speedStream.data.map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertSpeedToSpeedInFeetPerSecond(<number>dataValue);
    })));


    // Generate pace in minutes per mile
    unitStreams.push(new Stream(DataPaceMinutesPerMile.type, paceStream.data.map(dataValue => {
      if (!isNumber(dataValue)) {
        return null
      }
      return convertPaceToPaceInMinutesPerMile(<number>dataValue);
    })));


    // If we have more vertical speed data
    if (verticalSpeedStream) {
      // Generate vertical speed in feet per second
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerSecond.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerSecond(<number>dataValue);
      })));

      // Generate vertical speed in meters per minute
      unitStreams.push(new Stream(DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerMinute(<number>dataValue);
      })));

      unitStreams.push(new Stream(DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerMinute(<number>dataValue);
      })));

      // Generate vertical speed in feet per mintute
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerMinute.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerMinute(<number>dataValue);
      })));

      // Generate vertical speed in meters per hour
      unitStreams.push(new Stream(DataVerticalSpeedMetersPerHour.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMetersPerHour(<number>dataValue);
      })));

      // Generate vertical speed in feet per hour
      unitStreams.push(new Stream(DataVerticalSpeedFeetPerHour.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInFeetPerHour(<number>dataValue);
      })));

      // Generate vertical speed in in kilometers per hour
      unitStreams.push(new Stream(DataVerticalSpeedKilometerPerHour.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInKilometersPerHour(<number>dataValue);
      })));

      // Generate vertical speed in miles per hour
      unitStreams.push(new Stream(DataVerticalSpeedMilesPerHour.type, verticalSpeedStream.data.map(dataValue => {
        if (!isNumber(dataValue)) {
          return null
        }
        return convertSpeedToSpeedInMilesPerHour(<number>dataValue);
      })));
    }

    return unitStreams;
  }
}

