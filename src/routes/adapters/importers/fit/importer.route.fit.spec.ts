import { readFileSync } from 'fs';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataDistance } from '../../../../data/data.distance';
import { DataGNSSDistanceMiles } from '../../../../data/data.gnss-distance-miles';
import { DataGrade } from '../../../../data/data.grade';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataGradeMax } from '../../../../data/data.grade-max';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { DataSpeed } from '../../../../data/data.speed';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { FileType } from '../../../../events/adapters/file-type.enum';
import { SportsLib } from '../../../../index';
import { RouteParsingOptions } from '../../../route-parsing-options';
import { RouteImporterFIT } from './importer.route.fit';

describe('RouteImporterFIT', () => {
  const importerWithPrivateParse = RouteImporterFIT as unknown as {
    parseFIT: (arrayBuffer: ArrayBuffer) => Promise<unknown>;
  };

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
    expect(route.getStat(DataDistance.type)!.getValue()).toBeCloseTo(23187.9, 1);
    expect(route.getStreamData(DataDistance.type)[0]).toBe(0);
    expect(route.getStreamData(DataDistance.type)[route.getPointCount() - 1]).toBeCloseTo(23187.75, 1);
    expect(routeFile.getStat(DataDistance.type)!.getValue()).toEqual(route.getStat(DataDistance.type)!.getValue());
    expect(routeFile.getStat(DataAscent.type)!.getValue()).toEqual(route.getStat(DataAscent.type)!.getValue());
    expect(routeFile.getStat(DataGradeMin.type)!.getValue()).toEqual(route.getStat(DataGradeMin.type)!.getValue());
    expect(routeFile.getStat(DataGradeMax.type)!.getValue()).toEqual(route.getStat(DataGradeMax.type)!.getValue());
    expect(routeFile.getStat(DataGradeAvg.type)!.getValue()).toEqual(route.getStat(DataGradeAvg.type)!.getValue());

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
    const parseSpy = jest.spyOn(importerWithPrivateParse, 'parseFIT').mockResolvedValue({
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

  it('should preserve FIT course summary stats when they are present', () => {
    const parseSpy = jest.spyOn(importerWithPrivateParse, 'parseFIT').mockResolvedValue({
      file_ids: [{ type: 'course', manufacturer: 'garmin', product: 0 }],
      course: {
        name: 'Summary Course',
        sport: 'cycling',
        total_distance: 222,
        total_ascent: 77,
        total_descent: 33,
        avg_grade: 5,
        max_pos_grade: 11,
        max_neg_grade: -9
      },
      records: [
        { position_lat: 1, position_long: 2, distance: 0, altitude: 10 },
        { position_lat: 1.1, position_long: 2.1, distance: 100, altitude: 20 }
      ],
      course_points: []
    });

    return RouteImporterFIT.getFromArrayBuffer(new ArrayBuffer(0))
      .then(routeFile => {
        const route = routeFile.getFirstRoute();

        expect(route.getStat(DataDistance.type)!.getValue()).toBe(222);
        expect(route.getStat(DataAscent.type)!.getValue()).toBe(77);
        expect(route.getStat(DataDescent.type)!.getValue()).toBe(33);
        expect(route.getStat(DataGradeAvg.type)!.getValue()).toBe(5);
        expect(route.getStat(DataGradeMax.type)!.getValue()).toBe(11);
        expect(route.getStat(DataGradeMin.type)!.getValue()).toBe(-9);
        expect(routeFile.getStat(DataDistance.type)!.getValue()).toBe(222);
      })
      .finally(() => {
        parseSpy.mockRestore();
      });
  });

  it('should aggregate FIT lap summary stats when course summaries are absent', () => {
    const parseSpy = jest.spyOn(importerWithPrivateParse, 'parseFIT').mockResolvedValue({
      file_ids: [{ type: 'course', manufacturer: 'garmin', product: 0 }],
      course: {
        name: 'Lap Summary Course',
        sport: 'cycling'
      },
      laps: [
        {
          total_distance: 100,
          total_ascent: 10,
          total_descent: 5,
          avg_grade: 2,
          max_pos_grade: 8,
          max_neg_grade: -3,
          records: [
            { position_lat: 1, position_long: 2, distance: 0, altitude: 10 },
            { position_lat: 1.01, position_long: 2.01, distance: 100, altitude: 20 }
          ]
        },
        {
          total_distance: 300,
          total_ascent: 20,
          total_descent: 15,
          avg_grade: 6,
          max_pos_grade: 12,
          max_neg_grade: -9,
          records: [
            { position_lat: 1.02, position_long: 2.02, distance: 100, altitude: 20 },
            { position_lat: 1.03, position_long: 2.03, distance: 400, altitude: 15 }
          ]
        }
      ],
      course_points: []
    });

    return RouteImporterFIT.getFromArrayBuffer(new ArrayBuffer(0))
      .then(routeFile => {
        const route = routeFile.getFirstRoute();

        expect(route.getStat(DataDistance.type)!.getValue()).toBe(400);
        expect(route.getStat(DataAscent.type)!.getValue()).toBe(30);
        expect(route.getStat(DataDescent.type)!.getValue()).toBe(20);
        expect(route.getStat(DataGradeAvg.type)!.getValue()).toBe(5);
        expect(route.getStat(DataGradeMax.type)!.getValue()).toBe(12);
        expect(route.getStat(DataGradeMin.type)!.getValue()).toBe(-9);
        expect(routeFile.getStat(DataDistance.type)!.getValue()).toBe(400);
      })
      .finally(() => {
        parseSpy.mockRestore();
      });
  });

  it('should use final record distance when FIT lap summary distance coverage is incomplete', () => {
    const parseSpy = jest.spyOn(importerWithPrivateParse, 'parseFIT').mockResolvedValue({
      file_ids: [{ type: 'course', manufacturer: 'garmin', product: 0 }],
      course: {
        name: 'Partial Lap Summary Course',
        sport: 'cycling'
      },
      laps: [
        {
          total_distance: 100,
          total_ascent: 10,
          records: [
            { position_lat: 1, position_long: 2, distance: 0, altitude: 10 },
            { position_lat: 1.01, position_long: 2.01, distance: 100, altitude: 20 }
          ]
        },
        {
          records: [
            { position_lat: 1.02, position_long: 2.02, distance: 100, altitude: 20 },
            { position_lat: 1.03, position_long: 2.03, distance: 400, altitude: 40 },
            { position_lat: 1.04, position_long: 2.04, altitude: 40 }
          ]
        }
      ],
      course_points: []
    });

    return RouteImporterFIT.getFromArrayBuffer(
      new ArrayBuffer(0),
      new RouteParsingOptions({ streams: { smooth: { altitudeSmooth: false, grade: false, gradeSmooth: false } } })
    )
      .then(routeFile => {
        const route = routeFile.getFirstRoute();

        expect(route.getStat(DataDistance.type)!.getValue()).toBe(400);
        expect(routeFile.getStat(DataDistance.type)!.getValue()).toBe(400);
        expect(route.getStat(DataAscent.type)!.getValue()).toBe(30);
        expect(routeFile.getStat(DataAscent.type)!.getValue()).toBe(30);
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
