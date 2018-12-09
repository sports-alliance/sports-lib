import {EventInterface} from '../event.interface';
import {ActivityInterface} from '../../activities/activity.interface';
import {EventExporterTCX} from '../adapters/exporters/exporter.tcx';
import {PointInterface} from '../../points/point.interface';
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
import {Activity} from '../../activities/activity';
import {DataNumberOfPoints} from '../../data/data.number-of-points';
import {DataBatteryCharge} from '../../data/data.battery-charge';
import {DataBatteryConsumption} from '../../data/data.battery-consumption';
import {DataBatteryLifeEstimation} from '../../data/data.battery-life-estimation';
import {EventExporterJSON} from '../adapters/exporters/exporter.json';
import {DataPositionInterface} from '../../data/data.position.interface';
import {DataLatitudeDegrees} from '../../data/data.latitude-degrees';
import {DataLongitudeDegrees} from '../../data/data.longitude-degrees';

export class EventUtilities {

  public static async getEventAsTCXBloB(event: EventInterface): Promise<Blob> {
    const tcxString = await EventExporterTCX.getAsString(event);
    return (new Blob(
      [tcxString],
      {type: EventExporterTCX.fileType},
    ));
  }

  public static async getEventAsJSONBloB(event: EventInterface): Promise<Blob> {
    const tcxString = await EventExporterJSON.getAsString(event);
    return (new Blob(
      [tcxString],
      {type: EventExporterTCX.fileType},
    ));
  }

  public static getDataTypeAvg(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    const data = activity
      .getStreamData(streamType, startDate, endDate)
      .filter((value) => !isNaN(value));
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

  public static mergeEvents(events: EventInterface[]): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // First sort the events by first point date
      events.sort((eventA: EventInterface, eventB: EventInterface) => {
        return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
      });
      const activities: ActivityInterface[] = [];
      for (const event of events) {
        for (const activity of event.getActivities()) {
          activities.push(activity);
        }
      }
      const event = new Event(`Merged at ${(new Date()).toISOString()}`, activities[0].startDate, activities[activities.length - 1].endDate);
      activities.forEach(activity => event.addActivity(activity));
      // Set the totals for the event
      event.setDuration(new DataDuration(event.getActivities().reduce((duration, activity) => activity.getDuration().getValue(), 0)));
      event.setDistance(new DataDistance(event.getActivities().reduce((duration, activity) => activity.getDistance() ? activity.getDistance().getValue() : 0, 0)));
      event.setPause(new DataPause(event.getActivities().reduce((duration, activity) => activity.getPause().getValue(), 0)));
      //@todo add generate
      return resolve(event);
    });
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


  public static cropDistance(startDistance: number, endDistance: number, activity: ActivityInterface): ActivityInterface {
    // Short to do the search just in case
    activity.sortPointsByDate();
    let startDistanceDate: Date | undefined; // Does not sound right
    let endDistanceDate: Date | undefined;

    activity.getPoints().forEach((point: PointInterface) => {
      // find start and end date
      let pointDistance = point.getDataByType(DataDistance.type);
      if (!startDistanceDate && pointDistance && pointDistance.getValue() >= startDistance) {
        startDistanceDate = point.getDate();
        return;
      }
      if (!endDistanceDate && pointDistance && pointDistance.getValue() >= endDistance) {
        endDistanceDate = point.getDate();
        return;
      }
    });

    activity = this.cropTime(activity, startDistanceDate, endDistanceDate);

    // Should  reset all stats
    activity.clearStats();

    // Set the distance
    activity.setDistance(new DataDistance(endDistance));

    return activity;
  }

  public static cropTime(activity: ActivityInterface, startDate?: Date, endDate?: Date): ActivityInterface {
    activity.getPoints().forEach((point: PointInterface) => {
      // Remove depending on Date
      if (startDate && point.getDate() < startDate) {
        activity.removePoint(point)
      }
      if (endDate && point.getDate() > endDate) {
        activity.removePoint(point)
      }
      // Clear up the distance data as it's accumulated
      point.removeDataByType(DataDistance.type);
    });

    activity.startDate = startDate || activity.endDate;
    activity.endDate = endDate || activity.endDate;
    return activity;
  }

  public static generateStats(event: EventInterface) {
    // Todo should also work for event
    event.getActivities().map((activity: ActivityInterface) => {
      // Generate for activities
      this.generateStatsForActivity(activity);
      activity.getLaps().map((lap: LapInterface) => {
        // this.generateStatsForActivity(lap);
      })
    })
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
    activity.getStreamData(streamType, startDate, endDate)
      .filter((value) => !isNaN(value))
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
      .getStreamData(streamType, startDate, endDate)
      .filter((value) => !isNaN(value));
    if (max) {
      return data.reduce(function (previousValue, currentValue) {
        return Math.max(previousValue, currentValue);
      }, -Infinity);
    }
    return data.reduce(function (previousValue, currentValue) {
      return Math.min(previousValue, currentValue);
    }, Infinity);
  }

  private static generateStatsForActivity(activity: ActivityInterface) {
    // Add the number of points this activity has
    //   subject.addStat(new DataNumberOfPoints(subject.getPoints().length))

    // If there is no duration define that from the start date and end date
    if (!activity.getStat(DataDuration.className)) {
      activity.addStat(new DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000))
    }

    // If there is no pause define that from the start date and end date and duration
    if (!activity.getStat(DataPause.className)) {
      activity.addStat(new DataPause(((activity.endDate.getTime() - activity.startDate.getTime()) / 1000) - activity.getDuration().getValue()))
    }

    // If there is no distance
    if (!activity.getStat(DataDistance.className)) {
      activity.addStat(new DataDistance(this.getDistanceForActivity(activity,  activity.startDate, activity.endDate)));
    }

    // Ascent (altitude gain)
    if (!activity.getStat(DataAscent.className)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAscent(this.getEventDataTypeGain(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Descent (altitude loss)
    if (!activity.getStat(DataDescent.className)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataDescent(this.getEventDataTypeLoss(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Max
    if (!activity.getStat(DataAltitudeMax.className)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeMax(this.getDataTypeMax(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Min
    if (!activity.getStat(DataAltitudeMin.className)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeMin(this.getDataTypeMin(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }
    // Altitude Avg
    if (!activity.getStat(DataAltitudeAvg.className)
      && activity.hasStreamData(DataAltitude.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataAltitudeAvg(this.getDataTypeAvg(activity, DataAltitude.type, activity.startDate, activity.endDate)));
    }

    // Heart Rate  Max
    if (!activity.getStat(DataHeartRateMax.className)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateMax(this.getDataTypeMax(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Heart Rate Min
    if (!activity.getStat(DataHeartRateMin.className)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateMin(this.getDataTypeMin(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Heart Rate Avg
    if (!activity.getStat(DataHeartRateAvg.className)
      && activity.hasStreamData(DataHeartRate.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataHeartRateAvg(this.getDataTypeAvg(activity, DataHeartRate.type, activity.startDate, activity.endDate)));
    }
    // Cadence Max
    if (!activity.getStat(DataCadenceMax.className)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceMax(this.getDataTypeMax(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Cadence Min
    if (!activity.getStat(DataCadenceMin.className)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceMin(this.getDataTypeMin(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Cadence Avg
    if (!activity.getStat(DataCadenceAvg.className)
      && activity.hasStreamData(DataCadence.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataCadenceAvg(this.getDataTypeAvg(activity, DataCadence.type, activity.startDate, activity.endDate)));
    }
    // Speed Max
    if (!activity.getStat(DataSpeedMax.className)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedMax(this.getDataTypeMax(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Speed Min
    if (!activity.getStat(DataSpeedMin.className)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedMin(this.getDataTypeMin(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Speed Avg
    if (!activity.getStat(DataSpeedAvg.className)
      && activity.hasStreamData(DataSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataSpeedAvg(this.getDataTypeAvg(activity, DataSpeed.type, activity.startDate, activity.endDate)));
    }
    // Pace Max
    if (!activity.getStat(DataPaceMax.className)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceMax(this.getDataTypeMin(activity, DataPace.type, activity.startDate, activity.endDate))); // Intentionally min
    }
    // Pace Min
    if (!activity.getStat(DataPaceMin.className)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceMin(this.getDataTypeMax(activity, DataPace.type, activity.startDate, activity.endDate))); // Intentionally max
    }
    // Pace Avg
    if (!activity.getStat(DataPaceAvg.className)
      && activity.hasStreamData(DataPace.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPaceAvg(this.getDataTypeAvg(activity, DataPace.type, activity.startDate, activity.endDate)));
    }
    // Vertical Speed Max
    if (!activity.getStat(DataVerticalSpeedMax.className)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedMax(this.getDataTypeMax(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Vertical Speed Min
    if (!activity.getStat(DataVerticalSpeedMin.className)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedMin(this.getDataTypeMin(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Vertical Speed Avg
    if (!activity.getStat(DataVerticalSpeedAvg.className)
      && activity.hasStreamData(DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataVerticalSpeedAvg(this.getDataTypeAvg(activity, DataVerticalSpeed.type, activity.startDate, activity.endDate)));
    }
    // Power Max
    if (!activity.getStat(DataPowerMax.className)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerMax(this.getDataTypeMax(activity, DataPower.type, activity.startDate, activity.endDate)));
    }
    // Power Min
    if (!activity.getStat(DataPowerMin.className)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerMin(this.getDataTypeMin(activity, DataPower.type, activity.startDate, activity.endDate)));
    }
    if (!activity.getStat(DataPowerAvg.className)
      && activity.hasStreamData(DataPower.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataPowerAvg(this.getDataTypeAvg(activity, DataPower.type, activity.startDate, activity.endDate)));
    }
    // Temperature Max
    if (!activity.getStat(DataTemperatureMax.className)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureMax(this.getDataTypeMax(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }
    // Temperature Min
    if (!activity.getStat(DataTemperatureMin.className)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureMin(this.getDataTypeMin(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }
    // Temperature Avg
    if (!activity.getStat(DataTemperatureAvg.className)
      && activity.hasStreamData(DataTemperature.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataTemperatureAvg(this.getDataTypeAvg(activity, DataTemperature.type, activity.startDate, activity.endDate)));
    }

    // Battery Consumption Avg
    if (!activity.getStat(DataBatteryConsumption.className)
      && activity.hasStreamData(DataBatteryCharge.type, activity.startDate, activity.endDate)) {
      activity.addStat(new DataBatteryConsumption(this.getDataTypeDifference(activity, DataBatteryCharge.type, activity.startDate, activity.endDate)));
    }

    // Battery Life Estimation based on Consumption
    if (!activity.getStat(DataBatteryLifeEstimation.className)) {
      const consumption = activity.getStat(DataBatteryConsumption.className);
      if (consumption && consumption.getValue()) {
        activity.addStat(new DataBatteryLifeEstimation(Number((+activity.endDate - +activity.startDate) / 1000 * 100) / Number(consumption.getValue())));
      }
    }
  }

  public static getDistanceForActivity(
    activity: ActivityInterface,
    startDate?: Date,
    endDate?: Date): number {
    const latitudeStreamData = activity.getStreamData(DataLatitudeDegrees.type, startDate, endDate).filter((value) => !isNaN(value));
    const longitudeStreamData = activity.getStreamData(DataLongitudeDegrees.type, startDate, endDate).filter((value) => !isNaN(value));

    // Lat long should be 1:1 @todo move this to setter
    const positionData =  latitudeStreamData.reduce((positionArray: DataPositionInterface[], value, index) => {
      positionArray.push({
        latitudeDegrees: latitudeStreamData[index],
        longitudeDegrees: longitudeStreamData[index],
      });
      return positionArray;
    }, []);

    return (new GeoLibAdapter()).getDistance(positionData);
  }

}

export function isNumberOrString(property: any) {
  return (typeof property === 'number' || typeof property === 'string');
}

/**
 * Converts speed from m/s to pace as of seconds
 * @param {number} number
 * @return {number}
 */
export function convertSpeedToPace(number: number): number {
  return number === 0 ? number : (1000 / number);
}

export function getSize(obj: any): string {
  var bytes = 0;

  function sizeOf(obj:any) {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  }
  function formatByteSize(bytes: number): string {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
    else return (bytes / 1073741824).toFixed(3) + " GiB";
  }
  return formatByteSize(sizeOf(obj));
};
