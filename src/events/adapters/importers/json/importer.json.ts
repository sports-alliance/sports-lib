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
import { DataPowerCurve } from '../../../../data/data.power-curve';
import { SwimLength } from '../../../../swim-lengths/swim-length';
import { StatsClassInterface } from '../../../../stats/stats.class.interface';
import { hydrateMissingSpeedDerivedStats } from '../../../../stats/speed-derived-stats';

export class EventImporterJSON {
  /**
   * Restores a native JSON event, canonicalizing stat keys and hydrating missing speed-derived
   * pace summaries on the event, its activities, and their laps.
   */
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
    this.addStatsFromJSON(event, json.stats || {});
    if (json.powerCurve && json.powerCurve[DataPowerCurve.type] !== undefined) {
      event.powerCurve = new DataPowerCurve(<any>json.powerCurve[DataPowerCurve.type]);
      event.addStat(<any>event.powerCurve);
    }
    (json.activities || []).forEach(activityJSON => {
      event.addActivity(this.getActivityFromJSON(activityJSON));
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
    if (json.index !== null && json.index !== undefined) {
      device.index = json.index;
    }
    if (json.name !== null && json.name !== undefined) {
      device.name = json.name;
    }
    if (json.batteryStatus !== null && json.batteryStatus !== undefined) {
      device.batteryStatus = json.batteryStatus;
    }
    if (json.batteryLevel !== null && json.batteryLevel !== undefined) {
      device.batteryLevel = json.batteryLevel;
    }
    if (json.batteryVoltage !== null && json.batteryVoltage !== undefined) {
      device.batteryVoltage = json.batteryVoltage;
    }
    if (json.manufacturer !== null && json.manufacturer !== undefined) {
      device.manufacturer = json.manufacturer;
    }

    if (json.serialNumber !== null && json.serialNumber !== undefined) {
      device.serialNumber = json.serialNumber;
    }

    if (json.product !== null && json.product !== undefined) {
      device.product = json.product;
    }

    if (json.swInfo !== null && json.swInfo !== undefined) {
      device.swInfo = json.swInfo;
    }

    if (json.hwInfo !== null && json.hwInfo !== undefined) {
      device.hwInfo = json.hwInfo;
    }

    if (json.antDeviceNumber !== null && json.antDeviceNumber !== undefined) {
      device.antDeviceNumber = json.antDeviceNumber;
    }

    if (json.antTransmissionType !== null && json.antTransmissionType !== undefined) {
      device.antTransmissionType = json.antTransmissionType;
    }

    if (json.antNetwork !== null && json.antNetwork !== undefined) {
      device.antNetwork = json.antNetwork;
    }

    if (json.sourceType !== null && json.sourceType !== undefined) {
      device.sourceType = json.sourceType;
    }

    if (json.antId !== null && json.antId !== undefined) {
      device.antId = json.antId;
    }

    if (json.cumOperatingTime !== null && json.cumOperatingTime !== undefined) {
      device.cumOperatingTime = json.cumOperatingTime;
    }

    if (json.timestamp) {
      device.timestamp = new Date(json.timestamp);
    }

    return device;
  }

  /** Restores a native JSON lap and hydrates any missing speed-derived pace summaries. */
  static getLapFromJSON(json: LapJSONInterface, lapIndex: number): LapInterface {
    const lap = new Lap(
      new Date(json.startDate),
      new Date(json.endDate),
      lapIndex + 1,
      LapTypes[<keyof typeof LapTypes>json.type]
    );
    this.addStatsFromJSON(lap, json.stats);
    return lap;
  }

  private static getCanonicalDataType(dataType: string): string {
    try {
      return DynamicDataLoader.getDataClassFromDataType(dataType).type;
    } catch (_error) {
      return dataType;
    }
  }

  private static shouldReplaceCanonicalEntry<T>(
    existing: { sourceType: string; value: T } | undefined,
    sourceType: string,
    canonicalType: string
  ): boolean {
    if (!existing) {
      return true;
    }
    return existing.sourceType !== canonicalType && sourceType === canonicalType;
  }

  private static getCanonicalJSONMap<T>(json: { [key: string]: T }): Map<string, { sourceType: string; value: T }> {
    const canonicalMap = new Map<string, { sourceType: string; value: T }>();
    Object.keys(json || {}).forEach(sourceType => {
      const canonicalType = this.getCanonicalDataType(sourceType);
      const existing = canonicalMap.get(canonicalType);
      if (this.shouldReplaceCanonicalEntry(existing, sourceType, canonicalType)) {
        canonicalMap.set(canonicalType, { sourceType, value: json[sourceType] });
      }
    });
    return canonicalMap;
  }

  private static addStatsFromJSON(
    target: Pick<StatsClassInterface, 'addStat' | 'getStat'>,
    stats: DataJSONInterface = {}
  ): void {
    this.getCanonicalJSONMap(stats).forEach((entry, canonicalType) => {
      target.addStat(DynamicDataLoader.getDataInstanceFromDataType(canonicalType, entry.value));
    });
    hydrateMissingSpeedDerivedStats(target);
  }

  static getStreamFromJSON(json: StreamJSONInterface): StreamInterface {
    const streamType = this.getCanonicalDataType(json.type);

    if (streamType === DataIBI.type) {
      return new IBIStream(<number[]>json.data);
    }
    return new Stream(streamType, json.data);
  }

  private static getCanonicalStreamsFromJSON(
    streams: StreamJSONInterface[] | { [key: string]: (number | null)[] }
  ): StreamJSONInterface[] {
    const canonicalMap = new Map<string, { sourceType: string; value: StreamJSONInterface }>();
    const addStream = (sourceType: string, data: StreamJSONInterface['data']) => {
      const canonicalType = this.getCanonicalDataType(sourceType);
      if (canonicalType === DataTime.type) {
        return;
      }
      const existing = canonicalMap.get(canonicalType);
      if (this.shouldReplaceCanonicalEntry(existing, sourceType, canonicalType)) {
        canonicalMap.set(canonicalType, {
          sourceType,
          value: {
            type: canonicalType,
            data
          }
        });
      }
    };

    if (Array.isArray(streams)) {
      streams.forEach(streamJson => addStream(streamJson.type, streamJson.data));
    } else {
      Object.keys(streams || {}).forEach(streamKey => {
        addStream(streamKey, streams[streamKey]);
      });
    }

    return Array.from(canonicalMap.values()).map(entry => entry.value);
  }

  static getIntensityZonesFromJSON(json: IntensityZonesJSONInterface): IntensityZones {
    const zones = new IntensityZones(json.type);
    zones.zone1Duration = json.zone1Duration;
    zones.zone1LowerLimit = json.zone1LowerLimit;
    zones.zone2Duration = json.zone2Duration;
    zones.zone2LowerLimit = json.zone2LowerLimit;
    zones.zone3Duration = json.zone3Duration;
    zones.zone3LowerLimit = json.zone3LowerLimit;
    zones.zone4Duration = json.zone4Duration;
    zones.zone4LowerLimit = json.zone4LowerLimit;
    zones.zone5Duration = json.zone5Duration;
    zones.zone5LowerLimit = json.zone5LowerLimit;
    zones.zone6Duration = json.zone6Duration;
    zones.zone6LowerLimit = json.zone6LowerLimit;
    zones.zone7Duration = json.zone7Duration;
    zones.zone7LowerLimit = json.zone7LowerLimit;
    return zones;
  }

  static getActivityEventFromJSON(json: DataJSONInterface): DataEvent {
    return <DataEvent>(
      DynamicDataLoader.getDataInstanceFromDataType(<string>Object.keys(json)[0], <number>Object.values(json)[0])
    );
  }

  /** Restores a native JSON activity and hydrates missing speed-derived pace summaries on it and its laps. */
  static getActivityFromJSON(json: ActivityJSONInterface): ActivityInterface {
    const activity = new Activity(
      new Date(json.startDate),
      new Date(json.endDate),
      ActivityTypes[<keyof typeof ActivityTypes>json.type],
      EventImporterJSON.getCreatorFromJSON(json.creator)
    );
    this.addStatsFromJSON(activity, json.stats);
    if (json.powerCurve && json.powerCurve[DataPowerCurve.type] !== undefined) {
      activity.powerCurve = new DataPowerCurve(<any>json.powerCurve[DataPowerCurve.type]);
      activity.addStat(<any>activity.powerCurve);
    }
    json.laps.forEach((lapJSON: LapJSONInterface, index: number) => {
      activity.addLap(EventImporterJSON.getLapFromJSON(lapJSON, index));
    });
    if (Array.isArray(json.swimLengths)) {
      json.swimLengths.forEach(swimLengthJSON => {
        activity.addSwimLength(SwimLength.fromJSON(swimLengthJSON));
      });
    }

    this.getCanonicalStreamsFromJSON(json.streams).forEach(streamJson => {
      activity.addStream(EventImporterJSON.getStreamFromJSON(streamJson));
    });

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
