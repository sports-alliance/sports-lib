import { ActivityTypes } from '../activities/activity.types';
import { Creator } from '../creators/creator';
import { CreatorInterface } from '../creators/creator.interface';
import { DataInterface } from '../data/data.interface';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPositionInterface } from '../data/data.position.interface';
import { DataAltitude } from '../data/data.altitude';
import { isNumber } from '../events/utilities/helpers';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
import { RouteInterface } from './route.interface';
import { RouteParsingOptions } from './route-parsing-options';
import { RouteLinkInterface, RouteMetadataInterface, RoutePointInterface } from './route-point.interface';
import { RouteStream } from './route-stream';
import { RouteStreamInterface } from './route-stream.interface';
import { RouteJSONInterface } from './route.json.interface';

export class Route extends StatsClassAbstract implements RouteInterface {
  public name: string | null;
  public activityType: ActivityTypes | null;
  public comment: string | null;
  public description: string | null;
  public number: number | null;
  public links: RouteLinkInterface[];
  public extensions?: unknown;
  public creator: CreatorInterface;
  public parseOptions: RouteParsingOptions;

  private streams: RouteStreamInterface[] = [];
  private points: RoutePointInterface[] = [];

  constructor(
    creator: Creator = new Creator('Unknown Device'),
    options: RouteParsingOptions = RouteParsingOptions.DEFAULT,
    name: string | null = null,
    activityType: ActivityTypes | null = null,
    points: RoutePointInterface[] = [],
    metadata: RouteMetadataInterface = {}
  ) {
    super();
    this.creator = creator;
    this.parseOptions = options;
    this.name = name;
    this.activityType = activityType;
    this.points = points;
    this.comment = metadata.comment || null;
    this.description = metadata.description || null;
    this.number = metadata.number ?? null;
    this.links = metadata.links || [];
    this.extensions = metadata.extensions;
  }

  createStream(type: string, length = this.getPointCount()): RouteStreamInterface {
    return new RouteStream(type, Array(length).fill(null));
  }

  addDataToStream(type: string, index: number, value: number): this {
    this.getStreamData(type)[index] = value;
    return this;
  }

  addStream(stream: RouteStreamInterface): this {
    if (this.streams.find(routeStream => routeStream.type === stream.type)) {
      throw new Error(`Duplicate type of stream when adding ${stream.type} to route ${this.getID()}`);
    }
    this.streams.push(stream);
    return this;
  }

  addStreams(streams: RouteStreamInterface[]): this {
    const existingTypes = new Set(this.streams.map(stream => stream.type));
    streams.forEach(stream => {
      if (existingTypes.has(stream.type)) {
        return;
      }
      this.streams.push(stream);
      existingTypes.add(stream.type);
    });
    return this;
  }

  clearStreams(): this {
    this.streams = [];
    return this;
  }

  removeStream(streamType: string | RouteStreamInterface): this {
    const stream = streamType instanceof RouteStream ? streamType : this.getStream(<string>streamType);
    this.streams = this.streams.filter(routeStream => stream !== routeStream);
    return this;
  }

  replaceStreamData(streamType: string, data: (number | null)[]): this {
    this.removeStream(streamType);
    this.addStream(this.createStream(streamType, data.length).setData(data));
    return this;
  }

  getAllStreams(): RouteStreamInterface[] {
    return this.streams;
  }

  getAllExportableStreams(): RouteStreamInterface[] {
    return this.getAllStreams().filter(stream => stream.isExportable());
  }

  getStream(streamType: string): RouteStreamInterface {
    const find = this.streams.find(stream => stream.type === streamType);
    if (!find) {
      throw Error(`No route stream found with type ${streamType}`);
    }
    return find;
  }

  hasStreamData(streamType: string | RouteStreamInterface): boolean {
    try {
      this.getStreamData(streamType);
    } catch (_e) {
      return false;
    }
    return true;
  }

  getStreamData(streamType: string | RouteStreamInterface): (number | null)[] {
    const stream = streamType instanceof RouteStream ? streamType : this.getStream(<string>streamType);
    return stream.getData();
  }

  getSquashedStreamData(streamType: string): number[] {
    return <number[]>this.getStreamData(streamType).filter(data => isNumber(data));
  }

  hasPositionData(): boolean {
    return this.hasStreamData(DataLatitudeDegrees.type) && this.hasStreamData(DataLongitudeDegrees.type);
  }

  getPositionData(): (DataPositionInterface | null)[] {
    const latitudeStreamData = this.hasStreamData(DataLatitudeDegrees.type)
      ? this.getStreamData(DataLatitudeDegrees.type)
      : [];
    const longitudeStreamData = this.hasStreamData(DataLongitudeDegrees.type)
      ? this.getStreamData(DataLongitudeDegrees.type)
      : [];
    return Array.from({ length: this.getPointCount() }).reduce(
      (positionArray: (DataPositionInterface | null)[], _value, index) => {
        const currentLatitude = latitudeStreamData[index];
        const currentLongitude = longitudeStreamData[index];
        if (!isNumber(currentLatitude) || !isNumber(currentLongitude)) {
          positionArray.push(null);
          return positionArray;
        }
        positionArray.push({
          latitudeDegrees: <number>currentLatitude,
          longitudeDegrees: <number>currentLongitude
        });
        return positionArray;
      },
      []
    );
  }

  getSquashedPositionData(): DataPositionInterface[] {
    return <DataPositionInterface[]>this.getPositionData().filter(data => data !== null);
  }

  getPointData(): RoutePointInterface[] {
    const latitudeStreamData = this.hasStreamData(DataLatitudeDegrees.type)
      ? this.getStreamData(DataLatitudeDegrees.type)
      : [];
    const longitudeStreamData = this.hasStreamData(DataLongitudeDegrees.type)
      ? this.getStreamData(DataLongitudeDegrees.type)
      : [];
    const altitudeStreamData = this.hasStreamData(DataAltitude.type) ? this.getStreamData(DataAltitude.type) : [];

    return Array.from({ length: this.getPointCount() }).reduce((pointData: RoutePointInterface[], _value, index) => {
      const sourcePoint = this.points[index] || {};
      const latitude = isNumber(latitudeStreamData[index])
        ? <number>latitudeStreamData[index]
        : sourcePoint.latitudeDegrees;
      const longitude = isNumber(longitudeStreamData[index])
        ? <number>longitudeStreamData[index]
        : sourcePoint.longitudeDegrees;
      if (!isNumber(latitude) || !isNumber(longitude)) {
        return pointData;
      }

      pointData.push({
        ...sourcePoint,
        latitudeDegrees: latitude,
        longitudeDegrees: longitude,
        altitude: isNumber(altitudeStreamData[index])
          ? <number>altitudeStreamData[index]
          : (sourcePoint.altitude ?? null)
      });
      return pointData;
    }, []);
  }

  setPoints(points: RoutePointInterface[]): this {
    this.points = points;
    return this;
  }

  getPointCount(): number {
    return Math.max(
      this.points.length,
      this.streams.reduce((length, stream) => Math.max(length, stream.getData().length), 0)
    );
  }

  toJSON(): RouteJSONInterface {
    const stats = {};
    this.stats.forEach((value: DataInterface) => {
      Object.assign(stats, value.toJSON());
    });

    const routeJSON: RouteJSONInterface = {
      name: this.name || null,
      activityType: this.activityType,
      comment: this.comment,
      description: this.description,
      number: this.number,
      links: this.links,
      extensions: this.extensions,
      creator: this.creator.toJSON(),
      stats,
      streams: this.getAllStreams().reduce((streams: ReturnType<RouteStreamInterface['toJSON']>[], stream) => {
        streams.push(stream.toJSON());
        return streams;
      }, []),
      points: this.getPointData()
    };

    const id = this.getID();
    if (id) {
      routeJSON.id = id;
    }

    return routeJSON;
  }
}
