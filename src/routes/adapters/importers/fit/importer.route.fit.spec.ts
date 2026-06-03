import { readFileSync } from 'fs';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataDistance } from '../../../../data/data.distance';
import { DataGNSSDistanceMiles } from '../../../../data/data.gnss-distance-miles';
import { DataGrade } from '../../../../data/data.grade';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { DataSpeed } from '../../../../data/data.speed';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { FileType } from '../../../../events/adapters/file-type.enum';
import { SportsLib } from '../../../../index';
import { RouteParsingOptions } from '../../../route-parsing-options';
import { RouteImporterFIT } from './importer.route.fit';

describe('RouteImporterFIT', () => {
  const readFixture = (path: string): ArrayBuffer => {
    const buffer = readFileSync(path);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  };

  it('should import a FIT course as a first-class route file', async () => {
    const routeFile = await RouteImporterFIT.getFromArrayBuffer(
      readFixture(`${process.cwd()}/samples/fit-routes/coursepointer-cptr002.fit`)
    );
    const route = routeFile.getFirstRoute();
    const waypoints = routeFile.getWaypoints();

    expect(routeFile.name).toBe('cptr002');
    expect(routeFile.srcFileType).toBe(FileType.FIT);
    expect(routeFile.createdAt?.toISOString()).toBe('2025-05-06T15:56:24.000Z');
    expect(routeFile.getRoutes()).toHaveLength(1);
    expect(route.activityType).toBe(ActivityTypes.Cycling);
    expect(route.getPointCount()).toBe(666);
    expect(route.hasStreamData(DataLatitudeDegrees.type)).toBe(true);
    expect(route.hasStreamData(DataLongitudeDegrees.type)).toBe(true);
    expect(route.hasStreamData(DataDistance.type)).toBe(true);
    expect(route.hasStreamData(DataGrade.type)).toBe(true);
    expect(route.getStat(DataDistance.type)!.getValue()).toBeCloseTo(23187.75, 1);
    expect(route.getStreamData(DataDistance.type)[0]).toBe(0);
    expect(route.getStreamData(DataDistance.type)[route.getPointCount() - 1]).toBeCloseTo(23187.75, 1);

    expect(waypoints).toHaveLength(2);
    expect(waypoints[0]).toMatchObject({
      name: 'First here cour',
      type: 'generic',
      distance: 8813,
      routeIndex: 0
    });
    expect(waypoints[0].routePointIndex).toBeGreaterThan(0);
    expect(waypoints[1]).toMatchObject({
      name: 'Point2',
      routeIndex: 0
    });
    expect(waypoints[1].distance).toBeCloseTo(18349.29, 1);
    expect(waypoints[1].routePointIndex).toBeGreaterThan(waypoints[0].routePointIndex as number);
  });

  it('should expose FIT course import through the public SportsLib route API', async () => {
    const routeFile = await SportsLib.importRoutesFromFit(
      readFixture(`${process.cwd()}/samples/fit-routes/coursepointer-cptr002.fit`)
    );

    expect(routeFile.name).toBe('cptr002');
    expect(routeFile.getFirstRoute().getPointCount()).toBe(666);
  });

  it('should infer course point distance from geometry when Garmin Connect exports zero distances', async () => {
    const routeFile = await RouteImporterFIT.getFromArrayBuffer(
      readFixture(`${process.cwd()}/samples/fit-routes/coursepointer-cptr003-connect.fit`)
    );
    const waypoints = routeFile.getWaypoints();

    expect(waypoints).toHaveLength(4);
    expect(waypoints.map(waypoint => waypoint.name)).toEqual(['Russian Ridge', 'Saratoga', 'OLH Start', 'OLH End']);
    expect(waypoints.every(waypoint => typeof waypoint.type === 'string')).toBe(true);
    waypoints.forEach(waypoint => {
      expect(waypoint.distance).toBeGreaterThan(0);
      expect(waypoint.routePointIndex).toEqual(expect.any(Number));
    });
    expect(waypoints[0].distance).toBeCloseTo(23382.02, 1);
    expect(waypoints[1].distance).toBeCloseTo(44795.42, 1);
    expect(waypoints[2].distance).toBeCloseTo(8879.36, 1);
    expect(waypoints[3].distance).toBeCloseTo(14168.11, 1);
  });

  it('should support route stream includeTypes for FIT courses', async () => {
    const routeFile = await RouteImporterFIT.getFromArrayBuffer(
      readFixture(`${process.cwd()}/samples/fit-routes/coursepointer-cptr002.fit`),
      new RouteParsingOptions({
        streams: { includeTypes: [DataDistance.type, DataGNSSDistanceMiles.type, DataGrade.type] }
      })
    );

    const streamTypes = routeFile
      .getFirstRoute()
      .getAllStreams()
      .map(stream => stream.type);
    expect(new Set(streamTypes)).toEqual(new Set([DataDistance.type, DataGNSSDistanceMiles.type, DataGrade.type]));
  });

  it('should reject unsupported activity-only includeTypes for FIT routes', async () => {
    await expect(
      RouteImporterFIT.getFromArrayBuffer(
        readFixture(`${process.cwd()}/samples/fit-routes/coursepointer-cptr002.fit`),
        new RouteParsingOptions({ streams: { includeTypes: [DataSpeed.type] } })
      )
    ).rejects.toThrow('Unsupported route stream includeTypes');
  });

  it('should preserve parser-decoded course point types without FIT enum mapping in sports-lib', () => {
    const parseSpy = jest.spyOn(RouteImporterFIT as any, 'parseFIT').mockResolvedValue({
      file_ids: [{ type: 'course', manufacturer: 'garmin', product: 0 }],
      course: { name: 'Decoded Course', sport: 'cycling' },
      records: [
        { position_lat: 1, position_long: 2, distance: 0, altitude: 10 },
        { position_lat: 1.1, position_long: 2.1, distance: 100, altitude: 12 }
      ],
      course_points: [
        { position_lat: 1, position_long: 2, type: 'rest_area', name: 'Decoded' },
        { position_lat: 1.1, position_long: 2.1, type: 29, name: 'Numeric' }
      ]
    });

    return RouteImporterFIT.getFromArrayBuffer(new ArrayBuffer(0))
      .then(routeFile => {
        expect(routeFile.getWaypoints().map(waypoint => waypoint.type)).toEqual(['rest_area', '29']);
      })
      .finally(() => {
        parseSpy.mockRestore();
      });
  });

  it('should reject normal activity FIT files', async () => {
    await expect(
      RouteImporterFIT.getFromArrayBuffer(readFixture(`${process.cwd()}/src/specs/fixtures/runs/fit/2067489619.fit`))
    ).rejects.toBeInstanceOf(ParsingEventLibError);
  });
});
