import { ActivityTypes, ActivityTypesHelper } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { CreatorInterface } from '../../../../creators/creator.interface';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataDistance } from '../../../../data/data.distance';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { FileType } from '../../../../events/adapters/file-type.enum';
import { FITCreatorMapper } from '../../../../fit/fit-creator.mapper';
import { GeoLibAdapter } from '../../../../geodesy/adapters/geolib.adapter';
import { Route } from '../../../route';
import { RouteFile } from '../../../route-file';
import { RouteFileInterface } from '../../../route-file.interface';
import { RouteParsingOptions } from '../../../route-parsing-options';
import { RoutePointInterface, RouteWaypointInterface } from '../../../route-point.interface';
import { RouteStream } from '../../../route-stream';
import { RouteUtilities } from '../../../route.utilities';
import { Buffer } from 'buffer';

interface FITRouteRecord {
  position_lat?: number;
  position_long?: number;
  altitude?: number;
  enhanced_altitude?: number;
  distance?: number;
  timestamp?: string | Date;
}

interface FITCoursePoint {
  position_lat?: number;
  position_long?: number;
  altitude?: number;
  enhanced_altitude?: number;
  distance?: number;
  name?: string;
  type?: string | number;
  timestamp?: string | Date;
}

export class RouteImporterFIT {
  private static readonly geoLibAdapter = new GeoLibAdapter();

  static async getFromArrayBuffer(
    arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>,
    options: RouteParsingOptions = RouteParsingOptions.DEFAULT,
    name = 'New Route File'
  ): Promise<RouteFileInterface> {
    const fitDataObject = await this.parseFIT(arrayBuffer);
    if (!this.isFITCourse(fitDataObject)) {
      throw new ParsingEventLibError('FIT file is not a route/course file');
    }

    const records = this.getRouteRecords(fitDataObject);
    if (!records.length) {
      throw new ParsingEventLibError('No routes found in FIT');
    }

    const creator = this.getCreator(fitDataObject);
    const routeName = this.getCourseName(fitDataObject) || name;
    const route = new Route(
      creator,
      options,
      routeName,
      this.getActivityType(fitDataObject),
      this.getPointsFromRecords(records),
      this.getRouteMetadata(fitDataObject)
    );

    this.addRouteStreams(route, records);
    RouteUtilities.generateMissingStreamsAndStatsForRoute(route);

    return new RouteFile(
      routeName,
      FileType.FIT,
      creator,
      [route],
      this.getWaypointsFromCoursePoints(fitDataObject, records),
      this.getCreatedAt(fitDataObject, records)
    );
  }

  private static async parseFIT(arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>): Promise<any> {
    // @ts-ignore
    const { default: FitFileParser } = await import('fit-file-parser');
    return new Promise((resolve, reject) => {
      const fitFileParser = new FitFileParser({
        force: true,
        speedUnit: 'm/s',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: false,
        mode: 'both'
      });

      fitFileParser.parse(arrayBuffer, (error: any, fitDataObject: any) => {
        if (error || !fitDataObject) {
          reject(new ParsingEventLibError('Unable to parse FIT route file'));
          return;
        }
        resolve(fitDataObject);
      });
    });
  }

  private static isFITCourse(fitDataObject: any): boolean {
    const fileIdType = this.toArray(fitDataObject?.file_ids)[0]?.type;
    if (fileIdType) {
      return fileIdType === 'course';
    }

    return (
      !!fitDataObject?.course ||
      (this.toArray(fitDataObject?.course_points).length > 0 && !this.toArray(fitDataObject?.sessions).length)
    );
  }

  private static getRouteRecords(fitDataObject: any): FITRouteRecord[] {
    const records = this.toArray<FITRouteRecord>(fitDataObject?.records);
    const lapRecords = this.toArray<any>(fitDataObject?.laps).reduce((accu: FITRouteRecord[], lap) => {
      return accu.concat(this.toArray<FITRouteRecord>(lap?.records));
    }, []);

    return (records.length ? records : lapRecords).filter(record => {
      return this.isFiniteNumber(record.position_lat) && this.isFiniteNumber(record.position_long);
    });
  }

  private static getPointsFromRecords(records: FITRouteRecord[]): RoutePointInterface[] {
    return records.map(record => ({
      latitudeDegrees: record.position_lat as number,
      longitudeDegrees: record.position_long as number,
      altitude: this.getRecordAltitude(record)
    }));
  }

  private static addRouteStreams(route: Route, records: FITRouteRecord[]): void {
    route.addStream(
      new RouteStream(
        DataLatitudeDegrees.type,
        records.map(record => record.position_lat as number)
      )
    );
    route.addStream(
      new RouteStream(
        DataLongitudeDegrees.type,
        records.map(record => record.position_long as number)
      )
    );

    if (records.some(record => this.isFiniteNumber(this.getRecordAltitude(record)))) {
      route.addStream(
        new RouteStream(
          DataAltitude.type,
          records.map(record => this.getRecordAltitude(record))
        )
      );
    }

    if (records.some(record => this.isFiniteNumber(record.distance))) {
      route.addStream(
        new RouteStream(
          DataDistance.type,
          records.map(record => (this.isFiniteNumber(record.distance) ? record.distance : null))
        )
      );
    }
  }

  private static getWaypointsFromCoursePoints(fitDataObject: any, records: FITRouteRecord[]): RouteWaypointInterface[] {
    return this.toArray<FITCoursePoint>(fitDataObject?.course_points)
      .map(coursePoint => this.getWaypointFromCoursePoint(coursePoint, records))
      .filter((waypoint): waypoint is RouteWaypointInterface => waypoint !== null);
  }

  private static getWaypointFromCoursePoint(
    coursePoint: FITCoursePoint,
    records: FITRouteRecord[]
  ): RouteWaypointInterface | null {
    const routePointIndex = this.getNearestRoutePointIndex(coursePoint, records);
    const routePoint = routePointIndex === null ? null : records[routePointIndex];
    const latitude = this.isFiniteNumber(coursePoint.position_lat)
      ? coursePoint.position_lat
      : routePoint?.position_lat;
    const longitude = this.isFiniteNumber(coursePoint.position_long)
      ? coursePoint.position_long
      : routePoint?.position_long;

    if (!this.isFiniteNumber(latitude) || !this.isFiniteNumber(longitude)) {
      return null;
    }

    const routeDistance = routePoint && this.isFiniteNumber(routePoint.distance) ? routePoint.distance : null;
    const sourceDistance = this.isFiniteNumber(coursePoint.distance) ? coursePoint.distance : null;
    const distance =
      sourceDistance !== null && (sourceDistance !== 0 || routePointIndex === 0) ? sourceDistance : routeDistance;

    return {
      latitudeDegrees: latitude,
      longitudeDegrees: longitude,
      altitude: this.getRecordAltitude(coursePoint) ?? (routePoint ? this.getRecordAltitude(routePoint) : null),
      name: coursePoint.name || null,
      type: coursePoint.type === undefined || coursePoint.type === null ? null : String(coursePoint.type),
      distance,
      routeIndex: 0,
      routePointIndex
    };
  }

  private static getNearestRoutePointIndex(coursePoint: FITCoursePoint, records: FITRouteRecord[]): number | null {
    if (!records.length) {
      return null;
    }

    if (this.isFiniteNumber(coursePoint.position_lat) && this.isFiniteNumber(coursePoint.position_long)) {
      return this.getNearestRoutePointIndexByPosition(coursePoint, records);
    }

    if (this.isFiniteNumber(coursePoint.distance)) {
      return this.getNearestRoutePointIndexByDistance(coursePoint.distance, records);
    }

    return null;
  }

  private static getNearestRoutePointIndexByPosition(coursePoint: FITCoursePoint, records: FITRouteRecord[]): number {
    let bestIndex = 0;
    let bestDistance = Infinity;

    records.forEach((record, index) => {
      if (!this.isFiniteNumber(record.position_lat) || !this.isFiniteNumber(record.position_long)) {
        return;
      }
      const distance = this.geoLibAdapter.getDistance([
        {
          latitudeDegrees: coursePoint.position_lat as number,
          longitudeDegrees: coursePoint.position_long as number
        },
        {
          latitudeDegrees: record.position_lat,
          longitudeDegrees: record.position_long
        }
      ]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private static getNearestRoutePointIndexByDistance(distance: number, records: FITRouteRecord[]): number | null {
    let bestIndex: number | null = null;
    let bestDistance = Infinity;

    records.forEach((record, index) => {
      if (!this.isFiniteNumber(record.distance)) {
        return;
      }
      const delta = Math.abs(record.distance - distance);
      if (delta < bestDistance) {
        bestDistance = delta;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private static getCreator(fitDataObject: any): CreatorInterface {
    if (this.toArray(fitDataObject?.file_ids).length) {
      try {
        return FITCreatorMapper.getCreatorFromFitDataObject(fitDataObject);
      } catch (_e) {
        // Fall through to the generic route creator.
      }
    }
    return new Creator('Unknown Device');
  }

  private static getCourseName(fitDataObject: any): string | null {
    const courseName = fitDataObject?.course?.name;
    return typeof courseName === 'string' && courseName.length ? courseName : null;
  }

  private static getActivityType(fitDataObject: any): ActivityTypes {
    return (
      ActivityTypesHelper.resolveActivityType(fitDataObject?.course?.sport) ||
      ActivityTypesHelper.resolveActivityType(this.toArray(fitDataObject?.sports)[0]?.sport) ||
      ActivityTypes.route
    );
  }

  private static getRouteMetadata(fitDataObject: any): { extensions?: unknown } {
    const capabilities = fitDataObject?.course?.capabilities;
    return capabilities ? { extensions: { fit: { courseCapabilities: capabilities } } } : {};
  }

  private static getCreatedAt(fitDataObject: any, records: FITRouteRecord[]): Date | null {
    return (
      this.getDate(this.toArray(fitDataObject?.file_ids)[0]?.time_created) ||
      this.getDate(records[0]?.timestamp) ||
      null
    );
  }

  private static getDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private static getRecordAltitude(record: FITRouteRecord | FITCoursePoint): number | null {
    if (this.isFiniteNumber(record.enhanced_altitude)) {
      return record.enhanced_altitude;
    }
    return this.isFiniteNumber(record.altitude) ? record.altitude : null;
  }

  private static isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  private static toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}
