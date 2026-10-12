import { DataAltitudeMin } from '../../../../data/data.altitude-min';
import { DataDistance } from '../../../../data/data.distance';
import { DataPaceMax } from '../../../../data/data.pace-max';
import { DataStartPosition } from '../../../../data/data.start-position';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { SportsLib } from '../../../../index';
import { Route } from '../../../route';
import { RouteFile } from '../../../route-file';
import { RouteStream } from '../../../route-stream';
import { RouteImporterJSON } from './importer.route.json';

describe('Native route JSON non-finite stat compatibility', () => {
  const createRouteFile = () => {
    const route = new Route();
    route.addStat(new DataDistance(10));
    route.addStat(new DataAltitudeMin(-5));
    route.addStream(new RouteStream(DataDistance.type, [0, null, 10]));
    const routeFile = new RouteFile('route');
    routeFile.addRoute(route);
    routeFile.addStat(new DataDistance(10));
    return { route, routeFile };
  };

  it.each([NaN, Infinity, -Infinity])(
    'round-trips child route summaries with invalid pace (%s) and stream gaps',
    invalid => {
      const { route, routeFile } = createRouteFile();
      for (const target of [route, routeFile]) target.addStat(new DataPaceMax(invalid));
      const json = routeFile.toJSON();
      for (const stats of [json.stats, json.routes[0].stats]) {
        expect(stats).not.toHaveProperty(DataPaceMax.type);
        expect(stats?.[DataDistance.type]).toBe(10);
      }
      expect(route.getStat(DataPaceMax.type)?.getValue()).toBe(invalid);
      const restored = RouteImporterJSON.getRouteFileFromJSON(JSON.parse(JSON.stringify(json)));
      expect(restored.toJSON()).toEqual(json);
      expect(restored.getRoutes()[0].getStreamData(DataDistance.type)).toEqual([0, null, 10]);
    }
  );

  it.each([null, undefined, NaN, Infinity, -Infinity])('restores legacy invalid scalar stats (%s)', invalid => {
    const json = createRouteFile().routeFile.toJSON();
    for (const stats of [json.stats!, json.routes[0].stats]) Object.assign(stats, { [DataPaceMax.type]: invalid });
    const restored = RouteImporterJSON.getRouteFileFromJSON(json);
    for (const target of [restored, restored.getRoutes()[0]]) {
      expect(target.getStat(DataPaceMax.type)).toBeUndefined();
      expect(target.getStat(DataDistance.type)?.getValue()).toBe(10);
    }
    expect(restored.getRoutes()[0].getStat(DataAltitudeMin.type)?.getValue()).toBe(-5);
    expect(restored.getRoutes()[0].getStreamData(DataDistance.type)).toEqual([0, null, 10]);
  });

  it('regenerates route-file summaries when its legacy summary contains only invalid stats', () => {
    const json = createRouteFile().routeFile.toJSON();
    json.stats = { [DataPaceMax.type]: null };
    const restored = RouteImporterJSON.getRouteFileFromJSON(json);
    expect(restored.getStat(DataPaceMax.type)).toBeUndefined();
    expect(restored.getStat(DataDistance.type)?.getValue()).toBe(10);
  });

  it('preserves an explicit zero file summary instead of replacing it with child totals', () => {
    const json = createRouteFile().routeFile.toJSON();
    json.stats = { [DataDistance.type]: 0, [DataPaceMax.type]: null };
    const restored = SportsLib.importRoutesFromJSON(json);
    expect(restored.getStat(DataDistance.type)?.getValue()).toBe(0);
    expect(restored.getFirstRoute().getStat(DataDistance.type)?.getValue()).toBe(10);
    expect(restored.getStat(DataPaceMax.type)).toBeUndefined();
  });

  it('aggregates multiple child routes only when no valid file summary remains', () => {
    const { routeFile } = createRouteFile();
    const secondRoute = new Route();
    secondRoute.addStat(new DataDistance(20));
    routeFile.addRoute(secondRoute);
    const json = routeFile.toJSON();
    json.stats = { [DataPaceMax.type]: null };
    const restored = SportsLib.importRoutesFromJSON(json);
    expect(restored.getStat(DataDistance.type)?.getValue()).toBe(30);
    expect(restored.getRoutes().map(route => route.getStat(DataDistance.type)?.getValue())).toEqual([10, 20]);
  });

  it('keeps unavailable child and file summaries absent rather than manufacturing zero', () => {
    const json = createRouteFile().routeFile.toJSON();
    json.stats = { [DataDistance.type]: null };
    json.routes[0].stats = { [DataDistance.type]: null, [DataPaceMax.type]: Infinity };
    const restored = SportsLib.importRoutesFromJSON(json);
    expect(restored.getStats().size).toBe(0);
    expect(restored.getFirstRoute().getStats().size).toBe(0);
    expect(restored.getFirstRoute().getStreamData(DataDistance.type)).toEqual([0, null, 10]);
  });

  it('retains structured stats, route metadata, geometry and waypoints through JSON text', () => {
    const { route, routeFile } = createRouteFile();
    const position = { latitudeDegrees: 0, longitudeDegrees: 0 };
    route.setID('route-id');
    route.name = 'Route name';
    route.number = 0;
    route.links = [{ href: 'https://example.com/route', text: 'Route link' }];
    route.extensions = { custom: ['retained'] };
    route.setPoints([
      { ...position, altitude: -5 },
      { latitudeDegrees: 0, longitudeDegrees: 1, altitude: null }
    ]);
    routeFile.addWaypoint({ ...position, name: 'Waypoint', routeIndex: 0, routePointIndex: 0 });
    for (const target of [route, routeFile]) {
      target.addStat(new DataStartPosition(position));
      target.addStat(new DataPaceMax(Infinity));
    }
    const json = JSON.parse(JSON.stringify(routeFile.toJSON()));
    const restored = SportsLib.importRoutesFromJSON(json);
    expect(restored.getFirstRoute().getID()).toBe('route-id');
    expect(restored.getFirstRoute().toJSON()).toMatchObject({
      name: route.name,
      number: 0,
      links: route.links,
      extensions: route.extensions,
      points: json.routes[0].points,
      stats: { [DataStartPosition.type]: position, [DataAltitudeMin.type]: -5 }
    });
    expect(restored.getStat(DataStartPosition.type)?.getValue()).toEqual(position);
    expect(restored.getWaypoints()).toEqual(routeFile.getWaypoints());
  });

  it('still rejects conflicting geometry when invalid summaries are skipped', () => {
    const json = createRouteFile().routeFile.toJSON();
    json.routes[0].stats[DataPaceMax.type] = null;
    json.routes[0].points = [{ latitudeDegrees: 0, longitudeDegrees: 0 }];
    json.routes[0].streams = [{ type: DataLatitudeDegrees.type, data: [1] }];
    expect(() => SportsLib.importRoutesFromJSON(json)).toThrow('Route JSON geometry conflict');
  });
});
