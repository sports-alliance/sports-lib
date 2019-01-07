import {EventInterface} from '../event.interface';
import {ActivityInterface} from '../../activities/activity.interface';
// import {EventExporterTCX} from '../adapters/exporters/exporter.tcx';
import {Event} from '../event';
import {LapInterface} from '../../laps/lap.interface';
import {DataHeartRate} from '../../data/data.heart-rate';
import {DataCadence} from '../../data/data.cadence';
import {DataSpeed} from '../../data/data.speed';
import {DataVerticalSpeed} from '../../data/data.vertical-speed';
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
import {DataSpeedMax} from '../../data/data.speed-max';
import {DataSpeedMin} from '../../data/data.speed-min';
import {DataSpeedAvg} from '../../data/data.speed-avg';
import {DataVerticalSpeedMax} from '../../data/data.vertical-speed-max';
import {DataVerticalSpeedMin} from '../../data/data.vertical-speed-min';
import {DataVerticalSpeedAvg} from '../../data/data.vertical-speed-avg';
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
import {DataPaceMax} from '../../data/data.pace-max';
import {DataPace} from '../../data/data.pace';
import {DataPaceMin} from '../../data/data.pace-min';
import {DataPaceAvg} from '../../data/data.pace-avg';
import {DataBatteryCharge} from '../../data/data.battery-charge';
import {DataBatteryConsumption} from '../../data/data.battery-consumption';
import {DataBatteryLifeEstimation} from '../../data/data.battery-life-estimation';
import {DataPositionInterface} from '../../data/data.position.interface';
import {DataLatitudeDegrees} from '../../data/data.latitude-degrees';
import {DataNumberOfSamples} from '../../data/data-number-of.samples';
import {Privacy} from '../../privacy/privacy.class.interface';
import {Stream} from "../../streams/stream";

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
    this.generateActivityStats(event);
    return event;
  }

  public static calculatePointDistance(activity: ActivityInterface) {
    // const geoLib = new GeoLibAdapter();
    // let distance = 0;
    // activity.getPointsWithPosition().reduce((prev: PointInterface, current: PointInterface, index: number) => {
    //   if (index === 0) {
    //     prev.addData(new DataDistance(distance))
    //   }
    //   distance += geoLib.getDistance([prev, current]);
    //   current.addData(new DataDistance(distance));
    //   return current;
    // });
  }


  // public static cropDistance(startDistance: number, endDistance: number, activity: ActivityInterface): ActivityInterface {
  //   // Short to do the search just in case
  //   let startDistanceDate: Date | undefined; // Does not sound right
  //   let endDistanceDate: Date | undefined;
  //
  //   activity.getPoints().forEach((point: PointInterface) => {
  //     // find start and end date
  //     let pointDistance = point.getDataByType(DataDistance.type);
  //     if (!startDistanceDate && pointDistance && pointDistance.getValue() >= startDistance) {
  //       startDistanceDate = point.getDate();
  //       return;
  //     }
  //     if (!endDistanceDate && pointDistance && pointDistance.getValue() >= endDistance) {
  //       endDistanceDate = point.getDate();
  //       return;
  //     }
  //   });
  //
  //   activity = this.cropTime(activity, startDistanceDate, endDistanceDate);
  //
  //   // Should  reset all stats
  //   activity.clearStats();
  //
  //   // Set the distance
  //   activity.setDistance(new DataDistance(endDistance));
  //
  //   return activity;
  // }

  public static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface {
    activity.getAllStreams().forEach((stream) => {
      // Get the data for the range specified
      const trimmedStreamData = activity.getStreamData(stream.type, startDate, endDate);
      activity.removeStream(stream);
      activity.addStream(new Stream(stream.type, trimmedStreamData));
    });

    activity.startDate = startDate || activity.endDate;
    activity.endDate = endDate || activity.endDate;
    return activity;
  }

  public static generateActivityStats(event: EventInterface) {
    // Todo should also work for event
    event.getActivities().forEach((activity: ActivityInterface) => {
      // Generate for activities
      this.generateStatsForActivity(activity);
      this.generateStreamsForActivity(activity);
      activity.getLaps().map((lap: LapInterface) => {
        // this.generateStatsForActivity(lap);
      })
    });

    // If the event does not have basic stats generate them
    // @todo think about the default state of those
    if (!event.getDuration()) {
      event.setDuration(new DataDuration(0));
      event.getActivities().forEach((activity) => {
        event.setDuration(new DataDuration(event.getDuration().getValue() + activity.getDuration().getValue()));
      });
    }

    if (!event.getPause()) {
      event.setPause(new DataPause(0));
      event.getActivities().forEach((activity) => {
        event.setPause(new DataPause(event.getPause().getValue() + activity.getPause().getValue()));
      });
    }

    if (!event.getDistance()) {
      event.setDistance(new DataDistance(0));
      event.getActivities().forEach((activity) => {
        event.setDistance(new DataDistance(event.getDistance().getValue() + activity.getDistance().getValue()));
      });
    }
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
  private static generateStatsForActivity(activity: ActivityInterface) {
    // Add the number of points this activity has
    activity.addStat(new DataNumberOfSamples(activity.getAllStreams().reduce((sum, stream) => sum + stream.getNumericData().length, 0)));

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
      activity.addStat(new DataDistance(this.getDistanceForActivity(activity, activity.startDate, activity.endDate)));
    }

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

  /**
   * Generates missing streams for an activity such as distance etc if they are missing
   * @param activity
   */
  private static generateStreamsForActivity(activity: ActivityInterface) {
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
  }

  public static getDistanceForActivity(
    activity: ActivityInterface,
    startDate?: Date,
    endDate?: Date): number {
    return this.geoLibAdapter.getDistance(<DataPositionInterface[]>activity.getPositionData(startDate, endDate).filter((position) => position !== null));
  }
}

