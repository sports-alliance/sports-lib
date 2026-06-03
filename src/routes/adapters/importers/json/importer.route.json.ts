import { ActivityTypesHelper } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { CreatorInterface } from '../../../../creators/creator.interface';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { DynamicDataLoader } from '../../../../data/data.store';
import { EventImporterJSON } from '../../../../events/adapters/importers/json/importer.json';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { StreamJSONInterface } from '../../../../streams/stream';
import { Route } from '../../../route';
import { RouteFile } from '../../../route-file';
import { RouteFileJSONInterface } from '../../../route-file.json.interface';
import { RouteFileInterface } from '../../../route-file.interface';
import { RouteInterface } from '../../../route.interface';
import { RoutePointInterface } from '../../../route-point.interface';
import { RouteStream } from '../../../route-stream';
import { RouteJSONInterface } from '../../../route.json.interface';

export class RouteImporterJSON {
  static getRouteFileFromJSON(json: RouteFileJSONInterface): RouteFileInterface {
    const creator = json.creator ? EventImporterJSON.getCreatorFromJSON(json.creator) : new Creator('Unknown Device');
    const routeFile = new RouteFile(
      json.name,
      json.srcFileType,
      creator,
      [],
      json.waypoints || [],
      json.createdAt !== null && json.createdAt !== undefined ? new Date(json.createdAt) : null
    );
    if (json.id) {
      routeFile.setID(json.id);
    }

    (json.routes || []).forEach(routeJSON => {
      routeFile.addRoute(this.getRouteFromJSON(routeJSON, creator));
    });

    return routeFile;
  }

  static getRouteFromJSON(json: RouteJSONInterface, routeFileCreator?: CreatorInterface): RouteInterface {
    const creator = json.creator
      ? EventImporterJSON.getCreatorFromJSON(json.creator)
      : routeFileCreator || new Creator('Unknown Device');
    const streams = this.getStreamsFromJSON(json.streams || []);
    const points = this.getValidatedPoints(json.points || [], streams);
    this.addMissingGeometryStreamsFromPoints(points, streams);

    const route = new Route(
      creator,
      undefined,
      json.name || null,
      ActivityTypesHelper.resolveActivityType(json.activityType) || null,
      points,
      {
        comment: json.comment || null,
        description: json.description || null,
        number: json.number ?? null,
        links: json.links || [],
        extensions: json.extensions
      }
    );
    if (json.id) {
      route.setID(json.id);
    }

    Object.keys(json.stats || {}).forEach(statName => {
      route.addStat(DynamicDataLoader.getDataInstanceFromDataType(statName, (json.stats || {})[statName]));
    });

    streams.forEach(stream => route.addStream(stream));

    return route;
  }

  private static getStreamsFromJSON(
    streamsJSON: StreamJSONInterface[] | { [key: string]: (number | null)[] }
  ): RouteStream[] {
    if (Array.isArray(streamsJSON)) {
      return streamsJSON.map(streamJson => new RouteStream(streamJson.type, streamJson.data));
    }

    return Object.keys(streamsJSON || {}).map(streamKey => new RouteStream(streamKey, streamsJSON[streamKey]));
  }

  private static getValidatedPoints(points: RoutePointInterface[], streams: RouteStream[]): RoutePointInterface[] {
    if (!points.length) {
      return points;
    }

    const streamsByType = new Map(streams.map(stream => [stream.type, stream]));
    const latitudeStream = streamsByType.get(DataLatitudeDegrees.type);
    const longitudeStream = streamsByType.get(DataLongitudeDegrees.type);
    const altitudeStream = streamsByType.get(DataAltitude.type);

    this.validateGeometryStream(points, latitudeStream, point => point.latitudeDegrees, DataLatitudeDegrees.type, true);
    this.validateGeometryStream(
      points,
      longitudeStream,
      point => point.longitudeDegrees,
      DataLongitudeDegrees.type,
      true
    );
    this.validateGeometryStream(points, altitudeStream, point => point.altitude, DataAltitude.type, false);

    return points.map((point, index) => ({
      ...point,
      altitude:
        point.altitude !== undefined
          ? point.altitude
          : Number.isFinite(altitudeStream?.getData()[index])
            ? altitudeStream!.getData()[index]
            : null
    }));
  }

  private static validateGeometryStream(
    points: RoutePointInterface[],
    stream: RouteStream | undefined,
    getPointValue: (point: RoutePointInterface) => number | null | undefined,
    streamType: string,
    requiredPointValue: boolean
  ): void {
    points.forEach((point, index) => {
      const pointValue = getPointValue(point);
      if (requiredPointValue && !Number.isFinite(pointValue)) {
        throw new ParsingEventLibError(`Invalid route point ${streamType} at index ${index}`);
      }
    });

    if (!stream) {
      return;
    }

    const streamData = stream.getData();
    if (streamData.length !== points.length) {
      throw new ParsingEventLibError(
        `Route JSON geometry conflict: ${streamType} stream length ${streamData.length} does not match points length ${points.length}`
      );
    }

    streamData.forEach((streamValue, index) => {
      const pointValue = getPointValue(points[index]);
      if (!Number.isFinite(pointValue) && !Number.isFinite(streamValue)) {
        return;
      }
      if (!Number.isFinite(pointValue) && Number.isFinite(streamValue)) {
        return;
      }
      if (
        !Number.isFinite(pointValue) ||
        !Number.isFinite(streamValue) ||
        Math.abs((pointValue as number) - (streamValue as number)) > 1e-9
      ) {
        throw new ParsingEventLibError(`Route JSON geometry conflict: ${streamType} mismatch at index ${index}`);
      }
    });
  }

  private static addMissingGeometryStreamsFromPoints(points: RoutePointInterface[], streams: RouteStream[]): void {
    if (!points.length) {
      return;
    }

    const existingStreamTypes = new Set(streams.map(stream => stream.type));
    if (!existingStreamTypes.has(DataLatitudeDegrees.type)) {
      streams.push(
        new RouteStream(
          DataLatitudeDegrees.type,
          points.map(point => point.latitudeDegrees)
        )
      );
    }
    if (!existingStreamTypes.has(DataLongitudeDegrees.type)) {
      streams.push(
        new RouteStream(
          DataLongitudeDegrees.type,
          points.map(point => point.longitudeDegrees)
        )
      );
    }
    if (!existingStreamTypes.has(DataAltitude.type) && points.some(point => Number.isFinite(point.altitude))) {
      streams.push(
        new RouteStream(
          DataAltitude.type,
          points.map(point => (Number.isFinite(point.altitude) ? (point.altitude as number) : null))
        )
      );
    }
  }
}
