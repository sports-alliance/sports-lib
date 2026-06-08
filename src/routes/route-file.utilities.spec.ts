import { Creator } from '../creators/creator';
import { DataAscent } from '../data/data.ascent';
import { DataDescent } from '../data/data.descent';
import { DataDistance } from '../data/data.distance';
import { DataGradeAvg } from '../data/data.grade-avg';
import { DataGradeMax } from '../data/data.grade-max';
import { DataGradeMin } from '../data/data.grade-min';
import { Route } from './route';
import { RouteFile } from './route-file';
import { RouteFileUtilities } from './route-file.utilities';

describe('RouteFileUtilities', () => {
  const creator = new Creator('test');

  function createRoute(stats: {
    distance?: number;
    ascent?: number;
    descent?: number;
    minGrade?: number;
    maxGrade?: number;
    avgGrade?: number;
  }): Route {
    const route = new Route(creator);

    if (stats.distance !== undefined) {
      route.addStat(new DataDistance(stats.distance));
    }
    if (stats.ascent !== undefined) {
      route.addStat(new DataAscent(stats.ascent));
    }
    if (stats.descent !== undefined) {
      route.addStat(new DataDescent(stats.descent));
    }
    if (stats.minGrade !== undefined) {
      route.addStat(new DataGradeMin(stats.minGrade));
    }
    if (stats.maxGrade !== undefined) {
      route.addStat(new DataGradeMax(stats.maxGrade));
    }
    if (stats.avgGrade !== undefined) {
      route.addStat(new DataGradeAvg(stats.avgGrade));
    }

    return route;
  }

  it('copies child route stats for single-route files', () => {
    const route = createRoute({
      distance: 1000,
      ascent: 25,
      descent: 10,
      minGrade: -4,
      maxGrade: 12,
      avgGrade: 3
    });
    const routeFile = new RouteFile('single', undefined, creator, [route]);

    RouteFileUtilities.reGenerateStatsForRouteFile(routeFile);

    expect(routeFile.getStat(DataDistance.type)).toBe(route.getStat(DataDistance.type));
    expect(routeFile.getStat(DataGradeAvg.type)).toBe(route.getStat(DataGradeAvg.type));
  });

  it('aggregates stats across multi-route files', () => {
    const routeFile = new RouteFile('multi', undefined, creator, [
      createRoute({ distance: 1000, ascent: 10, descent: 15, minGrade: -8, maxGrade: 12, avgGrade: 4 }),
      createRoute({ distance: 3000, ascent: 20, descent: 25, minGrade: -12, maxGrade: 18, avgGrade: 8 })
    ]);

    RouteFileUtilities.reGenerateStatsForRouteFile(routeFile);

    expect(routeFile.getStat(DataDistance.type)!.getValue()).toBe(4000);
    expect(routeFile.getStat(DataAscent.type)!.getValue()).toBe(30);
    expect(routeFile.getStat(DataDescent.type)!.getValue()).toBe(40);
    expect(routeFile.getStat(DataGradeMin.type)!.getValue()).toBe(-12);
    expect(routeFile.getStat(DataGradeMax.type)!.getValue()).toBe(18);
    expect(routeFile.getStat(DataGradeAvg.type)!.getValue()).toBe(7);
  });

  it('falls back to simple average grade when route distances are missing', () => {
    const routeFile = new RouteFile('multi', undefined, creator, [
      createRoute({ avgGrade: 4 }),
      createRoute({ distance: 3000, avgGrade: 8 })
    ]);

    RouteFileUtilities.reGenerateStatsForRouteFile(routeFile);

    expect(routeFile.getStat(DataGradeAvg.type)!.getValue()).toBe(6);
  });
});
