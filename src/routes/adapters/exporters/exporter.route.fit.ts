import type { FitEncoderField } from 'fit-file-parser/encoder';
import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { getFitCoursePointId } from 'fit-file-parser/profile';
import { DataAscent } from '../../../data/data.ascent';
import { DataDescent } from '../../../data/data.descent';
import { DataDistance } from '../../../data/data.distance';
import { ParsingEventLibError } from '../../../errors/parsing-event-lib.error';
import { GeoLibAdapter } from '../../../geodesy/adapters/geolib.adapter';
import { FITRouteSport, FITRouteSportMapper } from '../fit-route-sport.mapper';
import { RouteFileInterface } from '../../route-file.interface';
import { RouteInterface } from '../../route.interface';
import { RoutePointInterface, RouteWaypointInterface } from '../../route-point.interface';

const FIT_DEFAULT_CREATED_AT = new Date('2000-01-01T00:00:00.000Z');
const FIT_MANUFACTURER_DEVELOPMENT = 255;
const FIT_PRODUCT_ID = 1;
const FIT_SERIAL_NUMBER = 1;
const FIT_FILE_TYPE_COURSE = 6;
const FIT_EVENT_TIMER = 0;
const FIT_EVENT_TYPE_START = 0;
const FIT_EVENT_TYPE_STOP_DISABLE_ALL = 9;
const FIT_UINT16_MAX = 0xffff;
const FIT_UINT32_MAX = 0xffffffff;
const FIT_SINT32_MIN = -0x80000000;
const FIT_SINT32_MAX = 0x7fffffff;

interface FITRouteRecord {
  point: RoutePointInterface;
  distance: number;
  timestamp: number;
}

export class RouteExporterFIT {
  fileType = 'application/vnd.ant.fit';
  fileExtension = 'fit';

  private static readonly geoLibAdapter = new GeoLibAdapter();

  static getAsArrayBuffer(routeFile: RouteFileInterface): Promise<ArrayBuffer> {
    return new RouteExporterFIT().getAsArrayBuffer(routeFile);
  }

  static export(routeFile: RouteFileInterface): ArrayBuffer {
    return new RouteExporterFIT().export(routeFile);
  }

  getAsArrayBuffer(routeFile: RouteFileInterface): Promise<ArrayBuffer> {
    return Promise.resolve(this.export(routeFile));
  }

  export(routeFile: RouteFileInterface): ArrayBuffer {
    const route = this.getSingleRoute(routeFile);
    const createdAt = this.getCreatedAt(routeFile.createdAt);
    const records = this.getRouteRecords(route, createdAt);
    if (!records.length) {
      throw new ParsingEventLibError('FIT route export requires at least one route point with valid coordinates');
    }

    const writer = new FitEncoder();
    const routeName = route.name || routeFile.name;
    const sport = FITRouteSportMapper.toFIT(route.activityType);
    this.writeFileId(writer, createdAt);
    this.writeCourse(writer, routeName, sport);
    this.writeLap(writer, route, records, sport.sport);
    this.writeEvent(writer, records[0].timestamp, FIT_EVENT_TYPE_START);
    this.writeRecords(writer, records);
    this.writeCoursePoints(writer, routeFile.getWaypoints(), records);
    this.writeEvent(writer, records[records.length - 1].timestamp, FIT_EVENT_TYPE_STOP_DISABLE_ALL);
    return writer.close().buffer as ArrayBuffer;
  }

  private getSingleRoute(routeFile: RouteFileInterface): RouteInterface {
    const routes = routeFile.getRoutes();
    if (routes.length !== 1) {
      throw new ParsingEventLibError('FIT route export requires exactly one route');
    }
    return routes[0];
  }

  private getCreatedAt(value: Date | null): Date {
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : FIT_DEFAULT_CREATED_AT;
  }

  private getRouteRecords(route: RouteInterface, createdAt: Date): FITRouteRecord[] {
    const points = route.getPointData().filter(point => this.hasValidCoordinates(point));
    const sourceDistances = route.hasStreamData(DataDistance.type) ? route.getStreamData(DataDistance.type) : [];
    const sourceDistancesAlignWithPoints = sourceDistances.length === points.length;
    let previousPoint: RoutePointInterface | null = null;
    let previousDistance = 0;
    const startTimestamp = this.getFitTimestamp(createdAt);

    return points.map((point, index) => {
      const geometricDistance = previousPoint
        ? previousDistance + RouteExporterFIT.geoLibAdapter.getDistance([previousPoint, point])
        : 0;
      const sourceDistance = sourceDistancesAlignWithPoints ? sourceDistances[index] : null;
      const distance =
        this.isFiniteNumber(sourceDistance) && sourceDistance >= previousDistance ? sourceDistance : geometricDistance;
      previousPoint = point;
      previousDistance = distance;
      const timestamp = startTimestamp + index;
      this.assertUInt32(timestamp, 'FIT route timestamp');
      const fitDistance = this.getFitDistanceValue(distance);
      return {
        point,
        distance: fitDistance / 100,
        timestamp
      };
    });
  }

  private writeFileId(writer: FitEncoder, createdAt: Date): void {
    writer.writeMessage(
      0,
      [
        this.field(0, 1, FitBaseType.Enum, FIT_FILE_TYPE_COURSE),
        this.field(1, 2, FitBaseType.Uint16, FIT_MANUFACTURER_DEVELOPMENT),
        this.field(2, 2, FitBaseType.Uint16, FIT_PRODUCT_ID),
        this.field(3, 4, FitBaseType.Uint32z, FIT_SERIAL_NUMBER),
        this.field(4, 4, FitBaseType.Uint32, this.getFitTimestamp(createdAt))
      ],
      0
    );
  }

  private writeCourse(writer: FitEncoder, name: string, fitSport: FITRouteSport): void {
    const nameBytes = this.getStringBytes(name);
    const fields = [
      this.field(4, 1, FitBaseType.Enum, fitSport.sport),
      this.field(5, nameBytes.length, FitBaseType.String, nameBytes)
    ];
    if (fitSport.subSport !== undefined) {
      fields.push(this.field(7, 1, FitBaseType.Enum, fitSport.subSport));
    }
    writer.writeMessage(31, fields, 1);
  }

  private writeLap(writer: FitEncoder, route: RouteInterface, records: FITRouteRecord[], sport: number): void {
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    const elapsedTime = Math.max(0, lastRecord.timestamp - firstRecord.timestamp);
    const fields = [
      this.field(253, 4, FitBaseType.Uint32, lastRecord.timestamp),
      this.field(2, 4, FitBaseType.Uint32, firstRecord.timestamp),
      this.field(3, 4, FitBaseType.Sint32, this.getSemicircles(firstRecord.point.latitudeDegrees)),
      this.field(4, 4, FitBaseType.Sint32, this.getSemicircles(firstRecord.point.longitudeDegrees)),
      this.field(5, 4, FitBaseType.Sint32, this.getSemicircles(lastRecord.point.latitudeDegrees)),
      this.field(6, 4, FitBaseType.Sint32, this.getSemicircles(lastRecord.point.longitudeDegrees)),
      this.field(7, 4, FitBaseType.Uint32, this.getFitMilliseconds(elapsedTime)),
      this.field(8, 4, FitBaseType.Uint32, this.getFitMilliseconds(elapsedTime)),
      this.field(9, 4, FitBaseType.Uint32, this.getFitDistanceValue(lastRecord.distance)),
      this.field(25, 1, FitBaseType.Enum, sport)
    ];
    const ascent = this.getUnsignedStat(route, DataAscent.type);
    const descent = this.getUnsignedStat(route, DataDescent.type);
    if (ascent !== null) {
      fields.push(this.field(21, 2, FitBaseType.Uint16, ascent));
    }
    if (descent !== null) {
      fields.push(this.field(22, 2, FitBaseType.Uint16, descent));
    }
    writer.writeMessage(19, fields, 2);
  }

  private writeEvent(writer: FitEncoder, timestamp: number, eventType: number): void {
    writer.writeMessage(
      21,
      [
        this.field(253, 4, FitBaseType.Uint32, timestamp),
        this.field(0, 1, FitBaseType.Enum, FIT_EVENT_TIMER),
        this.field(1, 1, FitBaseType.Enum, eventType)
      ],
      3
    );
  }

  private writeRecords(writer: FitEncoder, records: FITRouteRecord[]): void {
    const hasAltitude = records.some(record => this.isFiniteNumber(record.point.altitude));
    records.forEach(record => {
      const fields = [
        this.field(253, 4, FitBaseType.Uint32, record.timestamp),
        this.field(0, 4, FitBaseType.Sint32, this.getSemicircles(record.point.latitudeDegrees)),
        this.field(1, 4, FitBaseType.Sint32, this.getSemicircles(record.point.longitudeDegrees)),
        this.field(5, 4, FitBaseType.Uint32, this.getFitDistanceValue(record.distance))
      ];
      if (hasAltitude) {
        const altitude = this.isFiniteNumber(record.point.altitude)
          ? this.getFitAltitude(record.point.altitude)
          : 0xffff;
        fields.splice(3, 0, this.field(2, 2, FitBaseType.Uint16, altitude));
      }
      writer.writeMessage(20, fields, 4);
    });
  }

  private writeCoursePoints(writer: FitEncoder, waypoints: RouteWaypointInterface[], records: FITRouteRecord[]): void {
    waypoints
      .filter(
        waypoint => waypoint.routeIndex === undefined || waypoint.routeIndex === null || waypoint.routeIndex === 0
      )
      .forEach((waypoint, index) => {
        if (index > 0xfffe) {
          throw new ParsingEventLibError('FIT route export supports at most 65535 waypoints');
        }
        const routeRecord = this.getWaypointRouteRecord(waypoint, records);
        if (!routeRecord) {
          return;
        }
        const point = this.hasValidCoordinates(waypoint) ? waypoint : routeRecord.point;
        const fields = [
          this.field(254, 2, FitBaseType.Uint16, index),
          this.field(1, 4, FitBaseType.Uint32, routeRecord.timestamp),
          this.field(2, 4, FitBaseType.Sint32, this.getSemicircles(point.latitudeDegrees)),
          this.field(3, 4, FitBaseType.Sint32, this.getSemicircles(point.longitudeDegrees)),
          this.field(
            4,
            4,
            FitBaseType.Uint32,
            this.isNonNegativeFiniteNumber(waypoint.distance)
              ? this.getFitDistanceValue(waypoint.distance)
              : this.getFitDistanceValue(routeRecord.distance)
          ),
          this.field(5, 1, FitBaseType.Enum, this.getCoursePointType(waypoint.type))
        ];
        if (waypoint.name) {
          const nameBytes = this.getStringBytes(waypoint.name);
          fields.push(this.field(6, nameBytes.length, FitBaseType.String, nameBytes));
        }
        writer.writeMessage(32, fields, 5);
      });
  }

  private getWaypointRouteRecord(waypoint: RouteWaypointInterface, records: FITRouteRecord[]): FITRouteRecord | null {
    if (!records.length) {
      return null;
    }
    const routePointIndex = waypoint.routePointIndex;
    if (
      typeof routePointIndex === 'number' &&
      Number.isInteger(routePointIndex) &&
      routePointIndex >= 0 &&
      routePointIndex < records.length
    ) {
      return records[routePointIndex];
    }
    if (this.isNonNegativeFiniteNumber(waypoint.distance)) {
      const waypointDistance = waypoint.distance;
      return records.reduce((nearest, record) => {
        return Math.abs(record.distance - waypointDistance) < Math.abs(nearest.distance - waypointDistance)
          ? record
          : nearest;
      });
    }
    if (this.hasValidCoordinates(waypoint)) {
      return records.reduce((nearest, record) => {
        const waypointPosition = waypoint as RoutePointInterface;
        const nearestDistance = RouteExporterFIT.geoLibAdapter.getDistance([waypointPosition, nearest.point]);
        const recordDistance = RouteExporterFIT.geoLibAdapter.getDistance([waypointPosition, record.point]);
        return recordDistance < nearestDistance ? record : nearest;
      });
    }
    return records[0];
  }

  private getUnsignedStat(route: RouteInterface, type: string): number | null {
    const value = route.getStat(type)?.getValue();
    const rounded = this.isFiniteNumber(value) ? Math.round(value) : null;
    return rounded !== null && rounded >= 0 && rounded <= 0xfffe ? rounded : null;
  }

  private getCoursePointType(type: unknown): number {
    if (typeof type === 'number' && Number.isInteger(type) && type >= 0 && type <= 0xfe) {
      return type;
    }
    const stringType = String(type || 'generic').trim();
    if (/^\d+$/.test(stringType)) {
      const numericType = Number(stringType);
      if (numericType <= 0xfe) {
        return numericType;
      }
    }
    return getFitCoursePointId(stringType) ?? 0;
  }

  private getSemicircles(degrees: number): number {
    return Math.max(FIT_SINT32_MIN, Math.min(FIT_SINT32_MAX, Math.round((degrees * 0x80000000) / 180)));
  }

  private getFitTimestamp(date: Date): number {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new ParsingEventLibError('FIT route export requires a valid creation time');
    }
    try {
      return FitEncoder.toFitTimestamp(date);
    } catch {
      throw new ParsingEventLibError('FIT creation time cannot be represented by FIT');
    }
  }

  private getFitDistanceValue(distance: number): number {
    if (!this.isNonNegativeFiniteNumber(distance)) {
      throw new ParsingEventLibError('FIT route export requires non-negative finite distances');
    }
    const encoded = Math.round(distance * 100);
    this.assertUInt32(encoded, 'FIT distance');
    return encoded;
  }

  private getFitMilliseconds(seconds: number): number {
    if (!this.isNonNegativeFiniteNumber(seconds)) {
      throw new ParsingEventLibError('FIT route export requires a non-negative elapsed time');
    }
    const milliseconds = Math.round(seconds * 1000);
    this.assertUInt32(milliseconds, 'FIT elapsed time');
    return milliseconds;
  }

  private getFitAltitude(altitude: number): number {
    const encoded = Math.round((altitude + 500) * 5);
    if (!Number.isInteger(encoded) || encoded < 0 || encoded >= FIT_UINT16_MAX) {
      throw new ParsingEventLibError('FIT route export altitude must be between -500 and 12606.8 metres');
    }
    return encoded;
  }

  private getStringBytes(value: string): Uint8Array {
    const encoder = new TextEncoder();
    const bytes: number[] = [];
    for (const character of value) {
      const characterBytes = Array.from(encoder.encode(character));
      if (bytes.length + characterBytes.length >= 0xff) {
        break;
      }
      bytes.push(...characterBytes);
    }
    return Uint8Array.from(bytes.concat(0));
  }

  private field(number: number, size: number, baseType: FitBaseType, value: number | Uint8Array): FitEncoderField {
    return { number, size, baseType, value };
  }

  private hasValidCoordinates(point: Partial<RoutePointInterface>): point is RoutePointInterface {
    return (
      this.isFiniteNumber(point.latitudeDegrees) &&
      this.isFiniteNumber(point.longitudeDegrees) &&
      point.latitudeDegrees >= -90 &&
      point.latitudeDegrees <= 90 &&
      point.longitudeDegrees >= -180 &&
      point.longitudeDegrees <= 180
    );
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  private isNonNegativeFiniteNumber(value: unknown): value is number {
    return this.isFiniteNumber(value) && value >= 0;
  }

  private assertUInt32(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0 || value > FIT_UINT32_MAX) {
      throw new ParsingEventLibError(`${name} cannot be represented by FIT`);
    }
  }
}
