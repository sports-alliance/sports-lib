import { Event } from '../../../event';
import { Activity } from '../../../../activities/activity';
import { Lap } from '../../../../laps/lap';
import { EventInterface } from '../../../event.interface';
import { Creator } from '../../../../creators/creator';
import { IntensityZones } from '../../../../intensity-zones/intensity-zones';
import { DynamicDataLoader } from '../../../../data/data.store';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { EventJSONInterface } from '../../../event.json.interface';
import { CreatorJSONInterface } from '../../../../creators/creator.json.interface';
import { CreatorInterface } from '../../../../creators/creator.interface';
import { LapJSONInterface } from '../../../../laps/lap.json.interface';
import { LapInterface } from '../../../../laps/lap.interface';
import { LapTypes } from '../../../../laps/lap.types';
import { ActivityJSONInterface } from '../../../../activities/activity.json.interface';
import { ActivityTypes } from '../../../../activities/activity.types';
import { IntensityZonesJSONInterface } from '../../../../intensity-zones/intensity-zones.json.interface';
import { StreamInterface } from '../../../../streams/stream.interface';
import { Stream, StreamJSONInterface } from '../../../../streams/stream';
import { DataIBI } from '../../../../data/data.ibi';
import { IBIStream } from '../../../../streams/ibi-stream';
import { DeviceJsonInterface } from '../../../../activities/devices/device.json.interface';
import { DeviceInterface } from '../../../../activities/devices/device.interface';
import { Device } from '../../../../activities/devices/device';
import { DataJSONInterface } from '../../../../data/data.json.interface';
import { DataEvent } from '../../../../data/data.event';
import { DataTime } from '../../../../data/data.time';

export class EventImporterJSON {
  static getEventFromJSON(json: EventJSONInterface): EventInterface {
    const event = new Event(
      json.name,
      new Date(json.startDate),
      new Date(json.endDate),
      json.srcFileType,
      json.privacy,
      json.description || undefined,
      json.isMerge || false
    );
    Object.keys(json.stats).forEach((statName: any) => {
      event.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]));
    });
    return event;
  }

  static getCreatorFromJSON(json: CreatorJSONInterface): CreatorInterface {
    const creator = new Creator(json.name || 'Unknown Device');

    if (json.hwInfo) {
      creator.hwInfo = json.hwInfo;
    }
    if (json.swInfo) {
      creator.swInfo = json.swInfo;
    }
    if (json.serialNumber) {
      creator.serialNumber = json.serialNumber;
    }
    if (json.manufacturer) {
      creator.manufacturer = json.manufacturer;
    }
    if (json.isRecognized) {
      creator.isRecognized = json.isRecognized;
    }
    if (json.productId) {
      creator.productId = json.productId;
    }
    if (json.devices && json.devices.length) {
      json.devices.forEach(jsonDevice => creator.devices.push(this.getDeviceFromJSON(jsonDevice)));
    }

    return creator;
  }

  static getDeviceFromJSON(json: DeviceJsonInterface): DeviceInterface {
    const device = new Device(json.type);
    if (json.index) {
      device.index = json.index;
    }
    if (json.name) {
      device.name = json.name;
    }
    if (json.batteryStatus) {
      device.batteryStatus = json.batteryStatus;
    }
    if (json.batteryVoltage) {
      device.batteryVoltage = json.batteryVoltage;
    }
    if (json.manufacturer) {
      device.manufacturer = json.manufacturer;
    }

    if (json.serialNumber) {
      device.serialNumber = json.serialNumber;
    }

    if (json.product) {
      device.product = json.product;
    }

    if (json.swInfo) {
      device.swInfo = json.swInfo;
    }

    if (json.hwInfo) {
      device.hwInfo = json.hwInfo;
    }

    if (json.antDeviceNumber) {
      device.antDeviceNumber = json.antDeviceNumber;
    }

    if (json.antTransmissionType) {
      device.antTransmissionType = json.antTransmissionType;
    }

    if (json.antNetwork) {
      device.antNetwork = json.antNetwork;
    }

    if (json.sourceType) {
      device.sourceType = json.sourceType;
    }

    if (json.cumOperatingTime) {
      device.cumOperatingTime = json.cumOperatingTime;
    }

    return device;
  }

  static getLapFromJSON(json: LapJSONInterface, lapIndex: number): LapInterface {
    const lap = new Lap(
      new Date(json.startDate),
      new Date(json.endDate),
      lapIndex + 1,
      LapTypes[<keyof typeof LapTypes>json.type]
    );
    Object.keys(json.stats).forEach((statName: any) => {
      lap.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]));
    });
    return lap;
  }

  static getStreamFromJSON(json: StreamJSONInterface): StreamInterface {
    if (json.type === DataIBI.type) {
      return new IBIStream(<number[]>json.data);
    }
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

  static getActivityEventFromJSON(json: DataJSONInterface): DataEvent {
    return <DataEvent>(
      DynamicDataLoader.getDataInstanceFromDataType(<string>Object.keys(json)[0], <number>Object.values(json)[0])
    );
  }

  static getActivityFromJSON(json: ActivityJSONInterface): ActivityInterface {
    const activity = new Activity(
      new Date(json.startDate),
      new Date(json.endDate),
      ActivityTypes[<keyof typeof ActivityTypes>json.type],
      EventImporterJSON.getCreatorFromJSON(json.creator)
    );
    Object.keys(json.stats).forEach((statName: any) => {
      activity.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, json.stats[statName]));
    });
    json.laps.forEach((lapJSON: LapJSONInterface, index: number) => {
      activity.addLap(EventImporterJSON.getLapFromJSON(lapJSON, index));
    });

    if (Array.isArray(json.streams)) {
      json.streams.forEach((streamJson: StreamJSONInterface) => {
        if (streamJson.type === DataTime.type) {
          return;
        }
        activity.addStream(EventImporterJSON.getStreamFromJSON(streamJson));
      });
    } else {
      Object.keys(json.streams).forEach(streamKey => {
        const streamJson: StreamJSONInterface = {
          type: streamKey,
          data: (json.streams as { [key: string]: number[] })[streamKey]
        };
        activity.addStream(EventImporterJSON.getStreamFromJSON(streamJson));
      });
    }

    json.intensityZones.forEach(intensityZonesJSON => {
      activity.intensityZones.push(EventImporterJSON.getIntensityZonesFromJSON(intensityZonesJSON));
    });
    if (json.events) {
      json.events.forEach(activityEvent => {
        activity.addEvent(this.getActivityEventFromJSON(activityEvent));
      });
    }
    return activity;
  }
}
