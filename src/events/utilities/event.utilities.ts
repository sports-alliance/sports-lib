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

export class EventUtilities {

  public static async getEventAsTCXBloB(event: EventInterface): Promise<Blob> {
    const tcxString = await EventExporterTCX.getAsString(event);
    return (new Blob(
      [tcxString],
      {type: EventExporterTCX.fileType},
    ));
  }

  public static getDataTypeAvg(
    event: EventInterface,
    dataType: string,
    startDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[]): number {
    let count = 0;
    const averageForDataType = event.getPoints(startDate, endDate, activities).reduce((average: number, point: PointInterface) => {
      const data = point.getDataByType(dataType);
      if (!data) {
        return average;
      }
      average += Number(data.getValue());
      count++;
      return average;
    }, 0);
    return (averageForDataType / count);
  }

  public static getDateTypeMax(
    event: EventInterface,
    dataType: string,
    startDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[]): number {
    return this.getDataTypeMinOrMax(true, event, dataType, startDate, endDate, activities);
  }

  public static getDateTypeMin(
    event: EventInterface,
    dataType: string,
    startDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[]): number {
    return this.getDataTypeMinOrMax(false, event, dataType, startDate, endDate, activities);
  }

  public static mergeEvents(events: EventInterface[]): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // First sort the events by first point date
      events.sort((eventA: EventInterface, eventB: EventInterface) => {
        return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
      });
      const mergeEvent = new Event(`Merged at ${(new Date()).toISOString()}`);
      mergeEvent.setDistance(new DataDistance(0));
      mergeEvent.setDuration(new DataDuration(0));
      mergeEvent.setPause(new DataPause(0));
      for (const event of events) {
        for (const activity of event.getActivities()) {
          mergeEvent.addActivity(activity);
          mergeEvent.getDistance().setValue(mergeEvent.getDistance().getValue() + activity.getDistance().getValue());
          mergeEvent.getDuration().setValue(mergeEvent.getDuration().getValue() + activity.getDuration().getValue());
          mergeEvent.getPause().setValue(mergeEvent.getPause().getValue() + activity.getPause().getValue());
          // @todo merge the rest of the stats
        }
      }
      return resolve(mergeEvent);
    });
  }

  public static generateStats(event: EventInterface) {
    // Todo should also work for event
    event.getActivities().map((activity: ActivityInterface) => {
      // Generate for activities
      this.generateStatsForActivityOrLap(event, activity);
      activity.getLaps().map((lap: LapInterface) => {
        this.generateStatsForActivityOrLap(event, lap);
      })
    })
  }

  public static getEventDataTypeGain(
    event: EventInterface,
    dataType: string,
    starDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[],
    minDiff?: number,
  ): number {
    return this.getEventDataTypeGainOrLoss(true, event, dataType, starDate, endDate, activities, minDiff);
  }


  public static getEventDataTypeLoss(
    event: EventInterface,
    dataType: string,
    starDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[],
    minDiff?: number,
  ): number {
    return this.getEventDataTypeGainOrLoss(false, event, dataType, starDate, endDate, activities, minDiff);
  }

  private static getEventDataTypeGainOrLoss(
    gain: boolean,
    event: EventInterface,
    dataType: string,
    starDate?: Date,
    endDate?: Date,
    activities?: ActivityInterface[],
    minDiff = 5,
  ): number {
    let gainOrLoss = 0;
    const points = event.getPoints(starDate, endDate, activities);
    // Todo get by type
    points.reduce((previous: PointInterface, next: PointInterface) => {
      const previousDataType = previous.getDataByType(dataType);
      const nextDataType = next.getDataByType(dataType);
      if (!previousDataType) {
        return next;
      }
      if (!nextDataType) {
        return previous;
      }

      // For gain
      if (gain) {
        // Increase the gain if eligible first check to be greater plus diff  [200, 300, 400, 100, 101, 102]
        if ((<number>previousDataType.getValue() + minDiff) <= <number>nextDataType.getValue()) {
          gainOrLoss += <number>nextDataType.getValue() - <number>previousDataType.getValue();
          return next;
        }
        // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
        if (<number>previousDataType.getValue() < <number>nextDataType.getValue()) {
          return previous;
        }
        return next
      }

      // For Loss
      if ((<number>previousDataType.getValue() - minDiff) >= <number>nextDataType.getValue()) {
        gainOrLoss += <number>previousDataType.getValue() - <number>nextDataType.getValue();
        return next;
      }
      // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
      if (<number>previousDataType.getValue() > <number>nextDataType.getValue()) {
        return previous;
      }
      return next;
    });
    return gainOrLoss;
  }

  private static getDataTypeMinOrMax(max: boolean,
                                     event: EventInterface,
                                     dataType: string,
                                     startDate?: Date,
                                     endDate?: Date,
                                     activities?: ActivityInterface[]): number {
    const dataValuesArray = event.getPoints(startDate, endDate, activities).reduce((dataValues: number[], point: PointInterface) => {
      const pointData = point.getDataByType(dataType);
      if (pointData) {
        dataValues.push(<number>pointData.getValue());
      }
      return dataValues;
    }, []);
    if (max) {
      return Math.max(...dataValuesArray);
    }
    return Math.min(...dataValuesArray);
  }

  private static generateStatsForActivityOrLap(event: EventInterface, subject: ActivityInterface | LapInterface) {
    // Add the number of points this activity has
    if (subject instanceof Activity){
      subject.addStat(new DataNumberOfPoints(subject.getPoints().length))
    }

    // If there is no duration define that from the start date and end date
    if (!subject.getStat(DataDuration.className)) {
      subject.addStat(new DataDuration((subject.endDate.getTime() - subject.startDate.getTime()) / 1000))
    }

    // If there is no pause define that from the start date and end date and duration
    if (!subject.getStat(DataPause.className)) {
      subject.addStat(new DataPause(((subject.endDate.getTime() - subject.startDate.getTime()) / 1000) - subject.getDuration().getValue()))
    }

    // If there is no distance
    if (!subject.getStat(DataDistance.className)) {
      subject.addStat(new DataDistance(this.getDistanceInMeters(event, subject.startDate, subject.endDate)));
    }

    // Ascent (altitude gain)
    if (!subject.getStat(DataAscent.className)
      && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataAscent(this.getEventDataTypeGain(event, DataAltitude.type, subject.startDate, subject.endDate)));
    }
    // Descent (altitude loss)
    if (!subject.getStat(DataDescent.className)
      && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataDescent(this.getEventDataTypeLoss(event, DataAltitude.type, subject.startDate, subject.endDate)));
    }
    // Altitude Max
    if (!subject.getStat(DataAltitudeMax.className)
      && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataAltitudeMax(this.getDateTypeMax(event, DataAltitude.type, subject.startDate, subject.endDate)));
    }
    // Altitude Min
    if (!subject.getStat(DataAltitudeMin.className)
      && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataAltitudeMin(this.getDateTypeMin(event, DataAltitude.type, subject.startDate, subject.endDate)));
    }
    // Altitude Avg
    if (!subject.getStat(DataAltitudeAvg.className)
      && event.getPointsWithDataType(DataAltitude.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataAltitudeAvg(this.getDataTypeAvg(event, DataAltitude.type, subject.startDate, subject.endDate)));
    }

    // Heart Rate  Max
    if (!subject.getStat(DataHeartRateMax.className)
      && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataHeartRateMax(this.getDateTypeMax(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    }
    // Heart Rate Min
    if (!subject.getStat(DataHeartRateMin.className)
      && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataHeartRateMin(this.getDateTypeMin(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    }
    // Heart Rate Avg
    if (!subject.getStat(DataHeartRateAvg.className)
      && event.getPointsWithDataType(DataHeartRate.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataHeartRateAvg(this.getDataTypeAvg(event, DataHeartRate.type, subject.startDate, subject.endDate)));
    }
    // Cadence Max
    if (!subject.getStat(DataCadenceMax.className)
      && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataCadenceMax(this.getDateTypeMax(event, DataCadence.type, subject.startDate, subject.endDate)));
    }
    // Cadence Min
    if (!subject.getStat(DataCadenceMin.className)
      && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataCadenceMin(this.getDateTypeMin(event, DataCadence.type, subject.startDate, subject.endDate)));
    }
    // Cadence Avg
    if (!subject.getStat(DataCadenceAvg.className)
      && event.getPointsWithDataType(DataCadence.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataCadenceAvg(this.getDataTypeAvg(event, DataCadence.type, subject.startDate, subject.endDate)));
    }
    // Speed Max
    if (!subject.getStat(DataSpeedMax.className)
      && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataSpeedMax(this.getDateTypeMax(event, DataSpeed.type, subject.startDate, subject.endDate)));
    }
    // Speed Min
    if (!subject.getStat(DataSpeedMin.className)
      && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataSpeedMin(this.getDateTypeMin(event, DataSpeed.type, subject.startDate, subject.endDate)));
    }
    // Speed Avg
    if (!subject.getStat(DataSpeedAvg.className)
      && event.getPointsWithDataType(DataSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataSpeedAvg(this.getDataTypeAvg(event, DataSpeed.type, subject.startDate, subject.endDate)));
    }
    // Pace Max
    if (!subject.getStat(DataPaceMax.className)
      && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPaceMax(this.getDateTypeMin(event, DataPace.type, subject.startDate, subject.endDate))); // Intentionally min
    }
    // Pace Min
    if (!subject.getStat(DataPaceMin.className)
      && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPaceMin(this.getDateTypeMax(event, DataPace.type, subject.startDate, subject.endDate))); // Intentionally max
    }
    // Pace Avg
    if (!subject.getStat(DataPaceAvg.className)
      && event.getPointsWithDataType(DataPace.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPaceAvg(this.getDataTypeAvg(event, DataPace.type, subject.startDate, subject.endDate)));
    }
    // Vertical Speed Max
    if (!subject.getStat(DataVerticalSpeedMax.className)
      && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataVerticalSpeedMax(this.getDateTypeMax(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    }
    // Vertical Speed Min
    if (!subject.getStat(DataVerticalSpeedMin.className)
      && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataVerticalSpeedMin(this.getDateTypeMin(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    }
    // Vertical Speed Avg
    if (!subject.getStat(DataVerticalSpeedAvg.className)
      && event.getPointsWithDataType(DataVerticalSpeed.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataVerticalSpeedAvg(this.getDataTypeAvg(event, DataVerticalSpeed.type, subject.startDate, subject.endDate)));
    }
    // Power Max
    if (!subject.getStat(DataPowerMax.className)
      && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPowerMax(this.getDateTypeMax(event, DataPower.type, subject.startDate, subject.endDate)));
    }
    // Power Min
    if (!subject.getStat(DataPowerMin.className)
      && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPowerMin(this.getDateTypeMin(event, DataPower.type, subject.startDate, subject.endDate)));
    }
    if (!subject.getStat(DataPowerAvg.className)
      && event.getPointsWithDataType(DataPower.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataPowerAvg(this.getDataTypeAvg(event, DataPower.type, subject.startDate, subject.endDate)));
    }
    // Temperature Max
    if (!subject.getStat(DataTemperatureMax.className)
      && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataTemperatureMax(this.getDateTypeMax(event, DataTemperature.type, subject.startDate, subject.endDate)));
    }
    // Temperature Min
    if (!subject.getStat(DataTemperatureMin.className)
      && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataTemperatureMin(this.getDateTypeMin(event, DataTemperature.type, subject.startDate, subject.endDate)));
    }
    // Temperature Avg
    if (!subject.getStat(DataTemperatureAvg.className)
      && event.getPointsWithDataType(DataTemperature.type, subject.startDate, subject.endDate).length) {
      subject.addStat(new DataTemperatureAvg(this.getDataTypeAvg(event, DataTemperature.type, subject.startDate, subject.endDate)));
    }
  }

  public static getDistanceInMeters(
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
