import {Event} from '../../../event';
import {Activity} from '../../../../activities/activity';
import {Lap} from '../../../../laps/lap';
import {EventInterface} from '../../../event.interface';
import {Creator} from '../../../../creators/creator';
import {IntensityZones} from '../../../../intensity-zones/intensity-zones';
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
import {StreamJSONInterface} from '../../../../streams/stream.json.interface';
import {StreamInterface} from '../../../../streams/stream.interface';
import {Stream} from '../../../../streams/stream';

export class EventImporterJSON {

  static getEventFromJSON(json: EventJSONInterface): EventInterface {
    // debugger;
    const event = new Event(json.name, new Date(json.startDate), new Date(json.endDate), json.privacy);
    Object.keys(json.stats).forEach((statName: any) => {
      event.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]))
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
    Object.keys(json.stats).forEach((statName: any) => {
      lap.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]))
    });
    return lap;
  }


  static getStreamFromJSON(json: StreamJSONInterface): StreamInterface {
    return new Stream(json.type, json.data);
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
    Object.keys(json.stats).forEach((statName: any) => {
      activity.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]))
    });
    json.laps.forEach((lapJSON: LapJSONInterface) => {
      activity.addLap(EventImporterJSON.getLapFromJSON(lapJSON));
    });
    json.intensityZones.forEach((intensityZonesJSON) => {
      activity.intensityZones.push(EventImporterJSON.getIntensityZonesFromJSON(intensityZonesJSON))
    });
    return activity;
  }
}
