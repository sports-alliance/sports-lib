import { Creator } from '../creators/creator';
import { Route } from './route';
import { RouteFile } from './route-file';
import {
  decodeRoutePolyline5,
  encodeRoutePolyline5,
  RoutePreviewUtilities,
  simplifyCoordinatePairsVisvalingamWhyatt
} from './route-preview.utilities';
import { RoutePreviewCoordinateInterface } from './route-preview.interface';

describe('RoutePreviewUtilities', () => {
  it('encodes and decodes standard Google polyline5 fixtures', () => {
    const points = [
      { latitudeDegrees: 38.5, longitudeDegrees: -120.2 },
      { latitudeDegrees: 40.7, longitudeDegrees: -120.95 },
      { latitudeDegrees: 43.252, longitudeDegrees: -126.453 }
    ];

    const encoded = encodeRoutePolyline5(points);

    expect(encoded).toBe('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    expect(decodeRoutePolyline5(encoded)).toEqual(points);
  });

  it('simplifies dense geometry while preserving endpoints', () => {
    const points = buildSineRoutePoints(200);

    const simplified = RoutePreviewUtilities.simplifyPolyline(points, { maxPoints: 20 });

    expect(simplified).toHaveLength(20);
    expect(simplified[0]).toEqual(points[0]);
    expect(simplified[simplified.length - 1]).toEqual(points[points.length - 1]);
  });

  it('drops invalid and zero coordinates before simplifying', () => {
    const simplified = RoutePreviewUtilities.simplifyPolyline([
      { latitudeDegrees: 0, longitudeDegrees: 0 },
      { latitudeDegrees: Number.NaN, longitudeDegrees: 1 },
      { latitudeDegrees: 39.1, longitudeDegrees: 20.1 },
      { latitudeDegrees: 39.2, longitudeDegrees: 20.2 },
      { latitudeDegrees: 95, longitudeDegrees: 20.3 },
      { latitudeDegrees: 39.3, longitudeDegrees: 20.3 }
    ], { maxPoints: 10 });

    expect(simplified).toEqual([
      { latitudeDegrees: 39.1, longitudeDegrees: 20.1 },
      { latitudeDegrees: 39.2, longitudeDegrees: 20.2 },
      { latitudeDegrees: 39.3, longitudeDegrees: 20.3 }
    ]);
  });

  it('builds multi-segment route previews with capped point counts and bounds', () => {
    const firstRoute = createRoute('route-a', 'First', buildSineRoutePoints(500, 39, 20));
    const secondRoute = createRoute('route-b', 'Second', buildSineRoutePoints(500, 40, 21));
    const routeFile = new RouteFile('Routes', undefined, new Creator('test'), [firstRoute, secondRoute]);

    const preview = RoutePreviewUtilities.buildRouteFilePreview(routeFile, {
      maxPointsPerSegment: 100,
      maxPointsPerRoute: 150
    });

    expect(preview).toMatchObject({
      version: 1,
      encoding: 'polyline5',
      precision: 5,
      sourcePointCount: 1000,
      pointCount: 150
    });
    expect(preview?.segments).toHaveLength(2);
    expect(preview?.segments.map(segment => segment.pointCount)).toEqual([75, 75]);
    expect(preview?.segments[0]).toMatchObject({
      id: 'route-a',
      name: 'First',
      sourcePointCount: 500
    });
    expect(preview?.segments[0].bounds?.minLatitudeDegrees).toBeGreaterThan(38.9);
    expect(preview?.bounds?.minLongitudeDegrees).toBeLessThan(20.1);
    expect(decodeRoutePolyline5(preview?.segments[0].encodedPolyline)).toHaveLength(75);
  });

  it('returns null when no route segment has at least two valid coordinates', () => {
    const route = createRoute('route-a', 'First', [
      { latitudeDegrees: 0, longitudeDegrees: 0 },
      { latitudeDegrees: Number.NaN, longitudeDegrees: 20 }
    ]);
    const routeFile = new RouteFile('Routes', undefined, new Creator('test'), [route]);

    expect(RoutePreviewUtilities.buildRouteFilePreview(routeFile)).toBeNull();
  });

  it('simplifies generic coordinate pairs while preserving coordinate order', () => {
    const coordinates = Array.from({ length: 200 }, (_value, index) => [
      20 + (Math.sin(index / 12) * 0.05),
      39 + (index * 0.001)
    ]);

    const result = simplifyCoordinatePairsVisvalingamWhyatt(coordinates, {
      maxPoints: 20,
      minInputPoints: 20,
      minPointsToKeep: 8
    });

    expect(result).toMatchObject({
      inputPointCount: 200,
      outputPointCount: 20,
      simplified: true
    });
    expect(result.coordinates[0]).toEqual(coordinates[0]);
    expect(result.coordinates[result.coordinates.length - 1]).toEqual(coordinates[coordinates.length - 1]);
  });

  it('keeps generic coordinate pairs unchanged below the minimum input threshold', () => {
    const coordinates = [
      [20, 39],
      [20.1, 39.1],
      [20.2, 39.2]
    ];

    const result = simplifyCoordinatePairsVisvalingamWhyatt(coordinates, {
      maxPoints: 2,
      minInputPoints: 10
    });

    expect(result).toEqual({
      coordinates,
      inputPointCount: 3,
      outputPointCount: 3,
      simplified: false
    });
  });

  function createRoute(
    id: string,
    name: string,
    points: RoutePreviewCoordinateInterface[]
  ): Route {
    const route = new Route(new Creator('test'), undefined, name, null, points);
    route.setID(id);
    return route;
  }

  function buildSineRoutePoints(
    totalPoints: number,
    latitudeStart = 39,
    longitudeStart = 20
  ): RoutePreviewCoordinateInterface[] {
    return Array.from({ length: totalPoints }, (_value, index) => ({
      latitudeDegrees: latitudeStart + (index * 0.001),
      longitudeDegrees: longitudeStart + (Math.sin(index / 12) * 0.05)
    }));
  }
});
