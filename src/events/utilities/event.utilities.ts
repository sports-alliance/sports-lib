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

  public static getDateTypeMax(
    activity: ActivityInterface,
    streamType: string,
    startDate?: Date,
    endDate?: Date): number {
    return this.getDataTypeMinOrMax(activity, streamType, true, startDate, endDate);
  }

  public static getDateTypeMin(
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
    return this.getDateTypeMax(activity, streamType, startDate, endDate) - this.getDateTypeMin(activity, streamType, startDate, endDate);
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
      this.generateStatsForActivityOrLap(activity);
      activity.getLaps().map((lap: LapInterface) => {
        this.generateStatsForActivityOrLap(lap);
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

  private static generateStatsForActivityOrLap(subject: ActivityInterface | LapInterface) {
    // Add the number of points this activity has
    // if (subject instanceof Activity) {
    //   subject.addStat(new DataNumberOfPoints(subject.getPoints().length))
    // }
    //
    // // If there is no duration define that from the start date and end date
    // if (!subject.getStat(DataDuration.className)) {
    //   subject.addStat(new DataDuration((subject.endDate.getTime() - subject.startDate.getTime()) / 1000))
    // }
    //
    // // If there is no pause define that from the start date and end date and duration
    // if (!subject.getStat(DataPause.className)) {
    //   subject.addStat(new DataPause(((subject.endDate.getTime() - subject.startDate.getTime()) / 1000) - subject.getDuration().getValue()))
    // }
    //
    // // If there is no distance
    // if (!subject.getStat(DataDistance.className)) {
    //   subject.addStat(new DataDistance(this.getDistanceForEvent(event, subject.startDate, subject.endDate)));
    // }
    //
    // // Ascent (altitude gain)
    // if (!subject.getStat(DataAscent.className)
    //   && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataAscent(this.getEventDataTypeGain(event, DataAltitude.type, subject.startDate, subject.endDate)));
    // }
    // // Descent (altitude loss)
    // if (!subject.getStat(DataDescent.className)
    //   && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataDescent(this.getEventDataTypeLoss(event, DataAltitude.type, subject.startDate, subject.endDate)));
    // }
    // // Altitude Max
    // if (!subject.getStat(DataAltitudeMax.className)
    //   && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataAltitudeMax(this.getDateTypeMax(event, DataAltitude.type, subject.startDate, subject.endDate)));
    // }
    // // Altitude Min
    // if (!subject.getStat(DataAltitudeMin.className)
    //   && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataAltitudeMin(this.getDateTypeMin(event, DataAltitude.type, subject.startDate, subject.endDate)));
    // }
    // // Altitude Avg
    // if (!subject.getStat(DataAltitudeAvg.className)
    //   && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataAltitudeAvg(this.getDataTypeAvg(event, DataAltitude.type, subject.startDate, subject.endDate)));
    // }
    //
    // // Heart Rate  Max
    // if (!subject.getStat(DataHeartRateMax.className)
    //   && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataHeartRateMax(this.getDateTypeMax(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    // }
    // // Heart Rate Min
    // if (!subject.getStat(DataHeartRateMin.className)
    //   && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataHeartRateMin(this.getDateTypeMin(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    // }
    // // Heart Rate Avg
    // if (!subject.getStat(DataHeartRateAvg.className)
    //   && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataHeartRateAvg(this.getDataTypeAvg(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    // }
    // // Cadence Max
    // if (!subject.getStat(DataCadenceMax.className)
    //   && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataCadenceMax(this.getDateTypeMax(event, DataCadence.type, subject.startDate, subject.endDate)));
    // }
    // // Cadence Min
    // if (!subject.getStat(DataCadenceMin.className)
    //   && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataCadenceMin(this.getDateTypeMin(event, DataCadence.type, subject.startDate, subject.endDate)));
    // }
    // // Cadence Avg
    // if (!subject.getStat(DataCadenceAvg.className)
    //   && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataCadenceAvg(this.getDataTypeAvg(event, DataCadence.type, subject.startDate, subject.endDate)));
    // }
    // // Speed Max
    // if (!subject.getStat(DataSpeedMax.className)
    //   && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataSpeedMax(this.getDateTypeMax(event, DataSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Speed Min
    // if (!subject.getStat(DataSpeedMin.className)
    //   && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataSpeedMin(this.getDateTypeMin(event, DataSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Speed Avg
    // if (!subject.getStat(DataSpeedAvg.className)
    //   && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataSpeedAvg(this.getDataTypeAvg(event, DataSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Pace Max
    // if (!subject.getStat(DataPaceMax.className)
    //   && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPaceMax(this.getDateTypeMin(event, DataPace.type, subject.startDate, subject.endDate))); // Intentionally min
    // }
    // // Pace Min
    // if (!subject.getStat(DataPaceMin.className)
    //   && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPaceMin(this.getDateTypeMax(event, DataPace.type, subject.startDate, subject.endDate))); // Intentionally max
    // }
    // // Pace Avg
    // if (!subject.getStat(DataPaceAvg.className)
    //   && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPaceAvg(this.getDataTypeAvg(event, DataPace.type, subject.startDate, subject.endDate)));
    // }
    // // Vertical Speed Max
    // if (!subject.getStat(DataVerticalSpeedMax.className)
    //   && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataVerticalSpeedMax(this.getDateTypeMax(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Vertical Speed Min
    // if (!subject.getStat(DataVerticalSpeedMin.className)
    //   && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataVerticalSpeedMin(this.getDateTypeMin(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Vertical Speed Avg
    // if (!subject.getStat(DataVerticalSpeedAvg.className)
    //   && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataVerticalSpeedAvg(this.getDataTypeAvg(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    // }
    // // Power Max
    // if (!subject.getStat(DataPowerMax.className)
    //   && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPowerMax(this.getDateTypeMax(event, DataPower.type, subject.startDate, subject.endDate)));
    // }
    // // Power Min
    // if (!subject.getStat(DataPowerMin.className)
    //   && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPowerMin(this.getDateTypeMin(event, DataPower.type, subject.startDate, subject.endDate)));
    // }
    // if (!subject.getStat(DataPowerAvg.className)
    //   && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataPowerAvg(this.getDataTypeAvg(event, DataPower.type, subject.startDate, subject.endDate)));
    // }
    // // Temperature Max
    // if (!subject.getStat(DataTemperatureMax.className)
    //   && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataTemperatureMax(this.getDateTypeMax(event, DataTemperature.type, subject.startDate, subject.endDate)));
    // }
    // // Temperature Min
    // if (!subject.getStat(DataTemperatureMin.className)
    //   && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataTemperatureMin(this.getDateTypeMin(event, DataTemperature.type, subject.startDate, subject.endDate)));
    // }
    // // Temperature Avg
    // if (!subject.getStat(DataTemperatureAvg.className)
    //   && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataTemperatureAvg(this.getDataTypeAvg(event, DataTemperature.type, subject.startDate, subject.endDate)));
    // }
    //
    // // Battery Consumption Avg
    // if (!subject.getStat(DataBatteryConsumption.className)
    //   && event.getPointsWithDataType(DataBatteryCharge.type, subject.startDate, subject.endDate).length) {
    //   subject.addStat(new DataBatteryConsumption(this.getDataTypeDifference(event, DataBatteryCharge.type, subject.startDate, subject.endDate)));
    // }
    //
    // // Battery Life Estimation based on Consumption
    // if (!subject.getStat(DataBatteryLifeEstimation.className)) {
    //   const consumption = subject.getStat(DataBatteryConsumption.className);
    //   if (consumption && consumption.getValue()) {
    //     subject.addStat(new DataBatteryLifeEstimation(Number((+subject.endDate - +subject.startDate) / 1000 * 100) / Number(consumption.getValue())));
    //   }
    // }
  }

  public static getDistanceForEvent(
    event: EventInterface,
    startDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[],
  ): number {
    return (new GeoLibAdapter()).getDistance(event.getPointsWithPosition(startDate, endDate, activities));
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
