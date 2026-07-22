import { DataAscent } from '../../../data/data.ascent';
import { DataDescent } from '../../../data/data.descent';
import { DataDistance } from '../../../data/data.distance';
import { ParsingEventLibError } from '../../../errors/parsing-event-lib.error';
import { GeoLibAdapter } from '../../../geodesy/adapters/geolib.adapter';
import { FITRouteSport, FITRouteSportMapper } from '../fit-route-sport.mapper';
import { RouteFileInterface } from '../../route-file.interface';
import { RouteInterface } from '../../route.interface';
import { RoutePointInterface, RouteWaypointInterface } from '../../route-point.interface';

const FIT_EPOCH_MS = 631065600000;
const FIT_PROFILE_VERSION = 21188;
const FIT_PROTOCOL_VERSION = 2;
const FIT_HEADER_SIZE = 14;
const FIT_DEFAULT_CREATED_AT = new Date('2000-01-01T00:00:00.000Z');
const FIT_MANUFACTURER_DEVELOPMENT = 255;
const FIT_PRODUCT_ID = 1;
const FIT_SERIAL_NUMBER = 1;
const FIT_FILE_TYPE_COURSE = 6;
const FIT_EVENT_TIMER = 0;
const FIT_EVENT_TYPE_START = 0;
const FIT_EVENT_TYPE_STOP_DISABLE_ALL = 9;
const FIT_BASE_TYPE_ENUM = 0;
const FIT_BASE_TYPE_UINT8 = 2;
const FIT_BASE_TYPE_UINT16 = 0x84;
const FIT_BASE_TYPE_SINT32 = 0x85;
const FIT_BASE_TYPE_UINT32 = 0x86;
const FIT_BASE_TYPE_STRING = 7;
const FIT_BASE_TYPE_UINT32Z = 0x8c;
const FIT_UINT8_MAX = 0xff;
const FIT_UINT16_MAX = 0xffff;
const FIT_UINT32_MAX = 0xffffffff;
const FIT_SINT32_MIN = -0x80000000;
const FIT_SINT32_MAX = 0x7fffffff;

interface FITField {
  number: number;
  size: number;
  baseType: number;
  value: number | number[];
}

interface FITRouteRecord {
  point: RoutePointInterface;
  distance: number;
  timestamp: number;
}

/**
 * Writes the FIT Course subset used by RouteImporterFIT. It intentionally does
 * not try to be a general FIT encoder.
 */
class FITCourseBinaryWriter {
  private readonly data: number[] = [];
  private readonly activeDefinitions = new Map<number, string>();

  writeMessage(localMessageNumber: number, globalMessageNumber: number, fields: FITField[]): void {
    this.validateMessage(localMessageNumber, globalMessageNumber, fields);
    const definitionSignature = JSON.stringify({ globalMessageNumber, fields: fields.map(this.getFieldDefinition) });
    if (this.activeDefinitions.get(localMessageNumber) !== definitionSignature) {
      this.writeDefinition(localMessageNumber, globalMessageNumber, fields);
      this.activeDefinitions.set(localMessageNumber, definitionSignature);
    }

    this.writeUInt8(localMessageNumber);
    fields.forEach(field => this.writeFieldValue(field));
  }

  close(): ArrayBuffer {
    if (this.data.length > FIT_UINT32_MAX) {
      throw new RangeError('FIT data section cannot exceed 4294967295 bytes');
    }
    const header = [
      FIT_HEADER_SIZE,
      FIT_PROTOCOL_VERSION,
      FIT_PROFILE_VERSION & 0xff,
      (FIT_PROFILE_VERSION >>> 8) & 0xff,
      this.data.length & 0xff,
      (this.data.length >>> 8) & 0xff,
      (this.data.length >>> 16) & 0xff,
      (this.data.length >>> 24) & 0xff,
      0x2e,
      0x46,
      0x49,
      0x54
    ];
    const headerCRC = this.calculateCRC(header);
    const output = header.concat([headerCRC & 0xff, (headerCRC >>> 8) & 0xff], this.data);
    const fileCRC = this.calculateCRC(output);
    output.push(fileCRC & 0xff, (fileCRC >>> 8) & 0xff);
    return new Uint8Array(output).buffer;
  }

  private getFieldDefinition(field: FITField): Pick<FITField, 'number' | 'size' | 'baseType'> {
    return { number: field.number, size: field.size, baseType: field.baseType };
  }

  private validateMessage(localMessageNumber: number, globalMessageNumber: number, fields: FITField[]): void {
    this.assertIntegerInRange(localMessageNumber, 0, 0x0f, 'FIT local message number');
    this.assertIntegerInRange(globalMessageNumber, 0, FIT_UINT16_MAX, 'FIT global message number');
    if (!Array.isArray(fields) || fields.length > FIT_UINT8_MAX) {
      throw new RangeError('FIT message definitions support between 0 and 255 fields');
    }
    fields.forEach(field => this.validateField(field));
  }

  private validateField(field: FITField): void {
    this.assertIntegerInRange(field.number, 0, FIT_UINT8_MAX, 'FIT field number');
    this.assertIntegerInRange(field.size, 1, FIT_UINT8_MAX, 'FIT field size');
    this.assertIntegerInRange(field.baseType, 0, FIT_UINT8_MAX, 'FIT base type');
    if (Array.isArray(field.value)) {
      if (field.value.length !== field.size) {
        throw new RangeError(`FIT field ${field.number} expected ${field.size} bytes, received ${field.value.length}`);
      }
      field.value.forEach(value =>
        this.assertIntegerInRange(value, 0, FIT_UINT8_MAX, `FIT field ${field.number} byte`)
      );
      return;
    }
    const expectedSize = this.getBaseTypeSize(field.baseType);
    if (expectedSize === null || field.size !== expectedSize) {
      throw new RangeError(`FIT field ${field.number} has an invalid size for base type ${field.baseType}`);
    }
    this.assertValueForBaseType(field.value, field.baseType, field.number);
  }

  private getBaseTypeSize(baseType: number): number | null {
    switch (baseType) {
      case FIT_BASE_TYPE_ENUM:
      case FIT_BASE_TYPE_UINT8:
        return 1;
      case FIT_BASE_TYPE_UINT16:
        return 2;
      case FIT_BASE_TYPE_SINT32:
      case FIT_BASE_TYPE_UINT32:
      case FIT_BASE_TYPE_UINT32Z:
        return 4;
      default:
        return null;
    }
  }

  private assertValueForBaseType(value: number, baseType: number, fieldNumber: number): void {
    switch (baseType) {
      case FIT_BASE_TYPE_ENUM:
      case FIT_BASE_TYPE_UINT8:
        this.assertIntegerInRange(value, 0, FIT_UINT8_MAX, `FIT field ${fieldNumber}`);
        return;
      case FIT_BASE_TYPE_UINT16:
        this.assertIntegerInRange(value, 0, FIT_UINT16_MAX, `FIT field ${fieldNumber}`);
        return;
      case FIT_BASE_TYPE_SINT32:
        this.assertIntegerInRange(value, FIT_SINT32_MIN, FIT_SINT32_MAX, `FIT field ${fieldNumber}`);
        return;
      case FIT_BASE_TYPE_UINT32:
      case FIT_BASE_TYPE_UINT32Z:
        this.assertIntegerInRange(value, 0, FIT_UINT32_MAX, `FIT field ${fieldNumber}`);
        return;
      default:
        throw new RangeError(`Unsupported FIT base type ${baseType}`);
    }
  }

  private writeDefinition(localMessageNumber: number, globalMessageNumber: number, fields: FITField[]): void {
    this.writeUInt8(0x40 | localMessageNumber);
    this.writeUInt8(0);
    this.writeUInt8(0);
    this.writeUInt16(globalMessageNumber);
    this.writeUInt8(fields.length);
    fields.forEach(field => {
      this.writeUInt8(field.number);
      this.writeUInt8(field.size);
      this.writeUInt8(field.baseType);
    });
  }

  private writeFieldValue(field: FITField): void {
    if (Array.isArray(field.value)) {
      field.value.forEach(value => this.writeUInt8(value));
      return;
    }

    switch (field.baseType) {
      case FIT_BASE_TYPE_ENUM:
      case FIT_BASE_TYPE_UINT8:
        this.writeUInt8(field.value);
        return;
      case FIT_BASE_TYPE_UINT16:
        this.writeUInt16(field.value);
        return;
      case FIT_BASE_TYPE_SINT32:
        this.writeInt32(field.value);
        return;
      case FIT_BASE_TYPE_UINT32:
      case FIT_BASE_TYPE_UINT32Z:
        this.writeUInt32(field.value);
        return;
      default:
        throw new Error(`Unsupported FIT base type ${field.baseType}`);
    }
  }

  private writeUInt8(value: number): void {
    this.assertIntegerInRange(value, 0, FIT_UINT8_MAX, 'FIT uint8');
    this.data.push(value);
  }

  private writeUInt16(value: number): void {
    this.assertIntegerInRange(value, 0, FIT_UINT16_MAX, 'FIT uint16');
    this.data.push(value & 0xff, (value >>> 8) & 0xff);
  }

  private writeUInt32(value: number): void {
    this.assertIntegerInRange(value, 0, FIT_UINT32_MAX, 'FIT uint32');
    this.data.push(
      value & 0xff,
      Math.floor(value / 0x100) & 0xff,
      Math.floor(value / 0x10000) & 0xff,
      Math.floor(value / 0x1000000) & 0xff
    );
  }

  private writeInt32(value: number): void {
    this.assertIntegerInRange(value, FIT_SINT32_MIN, FIT_SINT32_MAX, 'FIT sint32');
    this.writeUInt32(value < 0 ? 0x100000000 + value : value);
  }

  private assertIntegerInRange(value: number, minimum: number, maximum: number, name: string): void {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new RangeError(`${name} must be an integer between ${minimum} and ${maximum}`);
    }
  }

  private calculateCRC(bytes: number[]): number {
    return bytes.reduce((crc, byte) => {
      let value = crc ^ byte;
      for (let index = 0; index < 8; index++) {
        value = value & 1 ? (value >>> 1) ^ 0xa001 : value >>> 1;
      }
      return value;
    }, 0);
  }
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

    const writer = new FITCourseBinaryWriter();
    const routeName = route.name || routeFile.name;
    const sport = FITRouteSportMapper.toFIT(route.activityType);
    this.writeFileId(writer, createdAt);
    this.writeCourse(writer, routeName, sport);
    this.writeLap(writer, route, records, sport.sport);
    this.writeEvent(writer, records[0].timestamp, FIT_EVENT_TYPE_START);
    this.writeRecords(writer, records);
    this.writeCoursePoints(writer, routeFile.getWaypoints(), records);
    this.writeEvent(writer, records[records.length - 1].timestamp, FIT_EVENT_TYPE_STOP_DISABLE_ALL);
    return writer.close();
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

  private writeFileId(writer: FITCourseBinaryWriter, createdAt: Date): void {
    writer.writeMessage(0, 0, [
      this.field(0, 1, FIT_BASE_TYPE_ENUM, FIT_FILE_TYPE_COURSE),
      this.field(1, 2, FIT_BASE_TYPE_UINT16, FIT_MANUFACTURER_DEVELOPMENT),
      this.field(2, 2, FIT_BASE_TYPE_UINT16, FIT_PRODUCT_ID),
      this.field(3, 4, FIT_BASE_TYPE_UINT32Z, FIT_SERIAL_NUMBER),
      this.field(4, 4, FIT_BASE_TYPE_UINT32, this.getFitTimestamp(createdAt))
    ]);
  }

  private writeCourse(writer: FITCourseBinaryWriter, name: string, fitSport: FITRouteSport): void {
    const nameBytes = this.getStringBytes(name);
    const fields = [
      this.field(4, 1, FIT_BASE_TYPE_ENUM, fitSport.sport),
      this.field(5, nameBytes.length, FIT_BASE_TYPE_STRING, nameBytes)
    ];
    if (fitSport.subSport !== undefined) {
      fields.push(this.field(7, 1, FIT_BASE_TYPE_ENUM, fitSport.subSport));
    }
    writer.writeMessage(1, 31, fields);
  }

  private writeLap(
    writer: FITCourseBinaryWriter,
    route: RouteInterface,
    records: FITRouteRecord[],
    sport: number
  ): void {
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    const elapsedTime = Math.max(0, lastRecord.timestamp - firstRecord.timestamp);
    const fields = [
      this.field(253, 4, FIT_BASE_TYPE_UINT32, lastRecord.timestamp),
      this.field(2, 4, FIT_BASE_TYPE_UINT32, firstRecord.timestamp),
      this.field(3, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(firstRecord.point.latitudeDegrees)),
      this.field(4, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(firstRecord.point.longitudeDegrees)),
      this.field(5, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(lastRecord.point.latitudeDegrees)),
      this.field(6, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(lastRecord.point.longitudeDegrees)),
      this.field(7, 4, FIT_BASE_TYPE_UINT32, this.getFitMilliseconds(elapsedTime)),
      this.field(8, 4, FIT_BASE_TYPE_UINT32, this.getFitMilliseconds(elapsedTime)),
      this.field(9, 4, FIT_BASE_TYPE_UINT32, this.getFitDistanceValue(lastRecord.distance)),
      this.field(25, 1, FIT_BASE_TYPE_ENUM, sport)
    ];
    const ascent = this.getUnsignedStat(route, DataAscent.type);
    const descent = this.getUnsignedStat(route, DataDescent.type);
    if (ascent !== null) {
      fields.push(this.field(21, 2, FIT_BASE_TYPE_UINT16, ascent));
    }
    if (descent !== null) {
      fields.push(this.field(22, 2, FIT_BASE_TYPE_UINT16, descent));
    }
    writer.writeMessage(2, 19, fields);
  }

  private writeEvent(writer: FITCourseBinaryWriter, timestamp: number, eventType: number): void {
    writer.writeMessage(3, 21, [
      this.field(253, 4, FIT_BASE_TYPE_UINT32, timestamp),
      this.field(0, 1, FIT_BASE_TYPE_ENUM, FIT_EVENT_TIMER),
      this.field(1, 1, FIT_BASE_TYPE_ENUM, eventType)
    ]);
  }

  private writeRecords(writer: FITCourseBinaryWriter, records: FITRouteRecord[]): void {
    const hasAltitude = records.some(record => this.isFiniteNumber(record.point.altitude));
    records.forEach(record => {
      const fields = [
        this.field(253, 4, FIT_BASE_TYPE_UINT32, record.timestamp),
        this.field(0, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(record.point.latitudeDegrees)),
        this.field(1, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(record.point.longitudeDegrees)),
        this.field(5, 4, FIT_BASE_TYPE_UINT32, this.getFitDistanceValue(record.distance))
      ];
      if (hasAltitude) {
        const altitude = this.isFiniteNumber(record.point.altitude)
          ? this.getFitAltitude(record.point.altitude)
          : 0xffff;
        fields.splice(3, 0, this.field(2, 2, FIT_BASE_TYPE_UINT16, altitude));
      }
      writer.writeMessage(4, 20, fields);
    });
  }

  private writeCoursePoints(
    writer: FITCourseBinaryWriter,
    waypoints: RouteWaypointInterface[],
    records: FITRouteRecord[]
  ): void {
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
          this.field(254, 2, FIT_BASE_TYPE_UINT16, index),
          this.field(1, 4, FIT_BASE_TYPE_UINT32, routeRecord.timestamp),
          this.field(2, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(point.latitudeDegrees)),
          this.field(3, 4, FIT_BASE_TYPE_SINT32, this.getSemicircles(point.longitudeDegrees)),
          this.field(
            4,
            4,
            FIT_BASE_TYPE_UINT32,
            this.isNonNegativeFiniteNumber(waypoint.distance)
              ? this.getFitDistanceValue(waypoint.distance)
              : this.getFitDistanceValue(routeRecord.distance)
          ),
          this.field(5, 1, FIT_BASE_TYPE_ENUM, this.getCoursePointType(waypoint.type))
        ];
        if (waypoint.name) {
          const nameBytes = this.getStringBytes(waypoint.name);
          fields.push(this.field(6, nameBytes.length, FIT_BASE_TYPE_STRING, nameBytes));
        }
        writer.writeMessage(5, 32, fields);
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
    const normalized = stringType.toLowerCase().replace(/[\s_-]/g, '');
    const types: Record<string, number> = {
      generic: 0,
      summit: 1,
      valley: 2,
      water: 3,
      food: 4,
      danger: 5,
      left: 6,
      right: 7,
      straight: 8,
      firstaid: 9,
      fourthcategory: 10,
      thirdcategory: 11,
      secondcategory: 12,
      firstcategory: 13,
      horscategory: 14,
      sprint: 15,
      leftfork: 16,
      rightfork: 17,
      middlefork: 18,
      slightleft: 19,
      sharpleft: 20,
      slightright: 21,
      sharpright: 22,
      uturn: 23,
      segmentstart: 24,
      segmentend: 25,
      campsite: 27,
      aidstation: 28,
      restarea: 29,
      generaldistance: 30,
      service: 31,
      energygel: 32,
      sportsdrink: 33,
      milemarker: 34,
      checkpoint: 35,
      shelter: 36,
      meetingspot: 37,
      overlook: 38,
      toilet: 39,
      shower: 40,
      gear: 41,
      sharpcurve: 42,
      steepincline: 43,
      tunnel: 44,
      bridge: 45,
      obstacle: 46,
      crossing: 47,
      store: 48,
      transition: 49,
      navaid: 50,
      transport: 51,
      alert: 52
    };
    return types[normalized] ?? 0;
  }

  private getSemicircles(degrees: number): number {
    return Math.max(FIT_SINT32_MIN, Math.min(FIT_SINT32_MAX, Math.round((degrees * 0x80000000) / 180)));
  }

  private getFitTimestamp(date: Date): number {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new ParsingEventLibError('FIT route export requires a valid creation time');
    }
    const timestamp = Math.floor((date.getTime() - FIT_EPOCH_MS) / 1000);
    this.assertUInt32(timestamp, 'FIT creation time');
    return timestamp;
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

  private getStringBytes(value: string): number[] {
    const encoder = new TextEncoder();
    const bytes: number[] = [];
    for (const character of value) {
      const characterBytes = Array.from(encoder.encode(character));
      if (bytes.length + characterBytes.length >= 0xff) {
        break;
      }
      bytes.push(...characterBytes);
    }
    return bytes.concat(0);
  }

  private field(number: number, size: number, baseType: number, value: number | number[]): FITField {
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
