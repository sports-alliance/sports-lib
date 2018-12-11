import {Event} from '../../../event';
import {Activity} from '../../../../activities/activity';
import {Lap} from '../../../../laps/lap';
import {EventInterface} from '../../../event.interface';
import {Creator} from '../../../../creators/creator';
import {WeatherItem} from '../../../../weather/app.weather.item';
import {Weather} from '../../../../weather/app.weather';
import {GeoLocationInfo} from '../../../../geo-location-info/geo-location-info';
import {IntensityZones} from '../../../../intensity-zones/intensity-zones';
import {IBIData} from '../../../../data/ibi/data.ibi';
import {DynamicDataLoader} from '../../../../data/data.store';
import {ActivityInterface} from '../../../../activities/activity.interface';
import {EventJSONInterface} from '../../../event.json.interface';
import {CreatorJSONInterface} from '../../../../creators/creator.json.interface';
import {CreatorInterface} from '../../../../creators/creator.interface';
import {LapJSONInterface} from '../../../../laps/lap.json.interface';
import {LapInterface} from '../../../../laps/lap.interface';
import {LapTypes} from '../../../../laps/lap.types';
import {ActivityJSONInterface} from '../../../../activities/activity.json.interface';
import {ActivityTypes} from '../../../../activities/activity.types';
import {IntensityZonesJSONInterface} from '../../../../intensity-zones/intensity-zones.json.interface';

export class EventImporterJSON {

  static getEventFromJSON(json: EventJSONInterface): EventInterface {
    // debugger;
    const event = new Event(json.name, new Date(json.startDate), new Date(json.endDate));
    json.stats.forEach((stat: any) => {
      event.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
    });
    return event;
  }

  static getCreatorFromJSON(json: CreatorJSONInterface): CreatorInterface {
    const creator = new Creator(json.name);
    if (json.hwInfo) {
      creator.hwInfo = json.hwInfo;
    }
    if (json.swInfo) {
      creator.swInfo = json.swInfo;
    }
    if (json.serialNumber) {
      creator.serialNumber = json.serialNumber;
    }
    return creator;
  }

  static getLapFromJSON(json: LapJSONInterface): LapInterface {
    const lap = new Lap(new Date(json.startDate), new Date(json.endDate), LapTypes[<keyof typeof LapTypes>json.type]);
    json.stats.forEach((stat: any) => {
      lap.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
    });
    return lap;
  }


  static getIntensityZonesFromJSON(json: IntensityZonesJSONInterface): IntensityZones {
   const zones = new IntensityZones(json.type);
      zones.zone1Duration = json.zone1Duration;
      zones.zone2Duration = json.zone2Duration;
      zones.zone2LowerLimit = json.zone2LowerLimit;
      zones.zone3Duration = json.zone3Duration;
      zones.zone3LowerLimit = json.zone3LowerLimit;
      zones.zone4Duration = json.zone4Duration;
      zones.zone4LowerLimit = json.zone4LowerLimit;
      zones.zone5Duration = json.zone5Duration;
      zones.zone5LowerLimit = json.zone5LowerLimit;
      return zones;
  }

  static getActivityFromJSON(json: ActivityJSONInterface): ActivityInterface {
    const activity = new Activity(
      new Date(json.startDate),
      new Date(json.endDate),
      ActivityTypes[<keyof typeof ActivityTypes>json.type],
      EventImporterJSON.getCreatorFromJSON(json.creator));
    json.stats.forEach((stat: any) => {
      activity.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
    });
    json.laps.forEach((lapJSON: LapJSONInterface) => {
      activity.addLap(EventImporterJSON.getLapFromJSON(lapJSON));
    });
    activity.weather = json.weather;
    activity.geoLocationInfo = json.geoLocationInfo;
    json.intensityZones.forEach((intensityZonesJSON) => {
      activity.intensityZones.push(EventImporterJSON.getIntensityZonesFromJSON(intensityZonesJSON))
    });
    return activity;
  }

  static getFromJSON(json: any): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // @todo Should build a json interface
      const event = new Event(json.name, new Date(json.startDate), new Date(json.endDate));
      event.setID(json.id);
      json.stats.forEach((stat: any) => {
        event.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
      });
      if (!json.activities) {
        resolve(event);
        return
      }

      const activities: ActivityInterface[] = json.activities.map((activityObject: any) => {
        const creator = new Creator(activityObject.creator.name);
        creator.hwInfo = activityObject.creator.hwInfo;
        creator.swInfo = activityObject.creator.swInfo;
        creator.serialNumber = activityObject.creator.serialNumber;
        const activity = new Activity(
          new Date(activityObject.startDate),
          new Date(activityObject.endDate),
          activityObject.type,
          creator);
        activity.setID(activityObject.id);
        activity.ibiData = new IBIData(activityObject.ibiData);
        if (activityObject.weather) {
          activity.weather = this.getWeather(activityObject);
        }
        if (activityObject.geoLocationInfo) {
          activity.geoLocationInfo = this.getGeoLocationInfo(activityObject);
        }
        activityObject.stats.forEach((stat: any) => {
          activity.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
        });

        if (activityObject.laps) {
          for (const lapObject of activityObject.laps) {
            const lap = new Lap(new Date(lapObject.startDate), new Date(lapObject.endDate), lapObject.type);
            lap.setID(lapObject.id);
            lapObject.stats.forEach((stat: any) => {
              lap.addStat(DynamicDataLoader.getDataInstance(stat.className, stat.value))
            });
            activity.addLap(lap);
          }
        }

        // if (activityObject.intensityZones) {
        //   for (const key in activityObject.intensityZones) {
        //     const zones = new IntensityZones();
        //     zones.zone1Duration = activityObject.intensityZones[key].zone1Duration;
        //     zones.zone2Duration = activityObject.intensityZones[key].zone2Duration;
        //     zones.zone2LowerLimit = activityObject.intensityZones[key].zone2LowerLimit;
        //     zones.zone3Duration = activityObject.intensityZones[key].zone3Duration;
        //     zones.zone3LowerLimit = activityObject.intensityZones[key].zone3LowerLimit;
        //     zones.zone4Duration = activityObject.intensityZones[key].zone4Duration;
        //     zones.zone4LowerLimit = activityObject.intensityZones[key].zone4LowerLimit;
        //     zones.zone5Duration = activityObject.intensityZones[key].zone5Duration;
        //     zones.zone5LowerLimit = activityObject.intensityZones[key].zone5LowerLimit;
        //     activity.intensityZones.set(key, zones);
        //   }
        // }

        // for (const pointObject of activityObject.points) {
        //   const point = new Point(new Date(pointObject.date));
        //   activity.addPoint(point);
        //   for (const dataObject of pointObject.data) {
        //     point.addData(DynamicDataLoader.getDataInstance(dataObject.className, dataObject.value));
        //   }
        // }
        return activity;
      });

      activities.forEach(activity => event.addActivity(activity));
      resolve(event);
    })
  }

  private static getGeoLocationInfo(object: any): GeoLocationInfo {
    const geoLocationInfo = new GeoLocationInfo(
      object.geoLocationInfo.latitude,
      object.geoLocationInfo.longitude,
    );
    geoLocationInfo.city = object.geoLocationInfo.city;
    geoLocationInfo.country = object.geoLocationInfo.country;
    geoLocationInfo.province = object.geoLocationInfo.province;
    return geoLocationInfo;
  }

  private static getWeather(object: any): Weather {
    const weatherItems = [];
    for (const weatherItemObject of object.weather.weatherItems) {
      weatherItems.push(
        new WeatherItem(
          new Date(weatherItemObject.date),
          weatherItemObject.conditions,
          weatherItemObject.temperatureInCelsius,
        ),
      )
    }
    return new Weather(weatherItems);
  }
}
