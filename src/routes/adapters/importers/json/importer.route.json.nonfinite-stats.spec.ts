import { DataAltitudeMin } from '../../../../data/data.altitude-min';
import { DataDistance } from '../../../../data/data.distance';
import { DataPaceMax } from '../../../../data/data.pace-max';
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

  it('round-trips child route summaries while retaining runtime pace and stream gaps', () => {
    const { route, routeFile } = createRouteFile();
    for (const target of [route, routeFile]) target.addStat(new DataPaceMax(Infinity));
    const json = routeFile.toJSON();
    for (const stats of [json.stats, json.routes[0].stats]) {
      expect(stats).not.toHaveProperty(DataPaceMax.type);
      expect(stats?.[DataDistance.type]).toBe(10);
    }
    expect(route.getStat(DataPaceMax.type)?.getValue()).toBe(Infinity);
    const restored = RouteImporterJSON.getRouteFileFromJSON(JSON.parse(JSON.stringify(json)));
    expect(restored.toJSON()).toEqual(json);
    expect(restored.getRoutes()[0].getStreamData(DataDistance.type)).toEqual([0, null, 10]);
  });

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
});
