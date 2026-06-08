import { DataAscent } from '../data/data.ascent';
import { DataDescent } from '../data/data.descent';
import { DataDistance } from '../data/data.distance';
import { DataGradeAvg } from '../data/data.grade-avg';
import { DataGradeMax } from '../data/data.grade-max';
import { DataGradeMin } from '../data/data.grade-min';
import { DataInterface } from '../data/data.interface';
import { StatsUtilities } from '../stats/stats.utilities';
import { RouteFileInterface } from './route-file.interface';
import { RouteInterface } from './route.interface';

export class RouteFileUtilities {
  static reGenerateStatsForRouteFile(routeFile: RouteFileInterface): RouteFileInterface {
    routeFile.clearStats();

    const routes = routeFile.getRoutes();
    if (!routes.length) {
      return routeFile;
    }

    if (routes.length === 1) {
      routes[0].getStats().forEach(stat => routeFile.addStat(stat));
      return routeFile;
    }

    this.getSummaryStatsForRoutes(routes).forEach(stat => routeFile.addStat(stat));
    return routeFile;
  }

  static getSummaryStatsForRoutes(routes: RouteInterface[]): DataInterface[] {
    const stats: DataInterface[] = [];

    this.addStatFromValue(stats, StatsUtilities.sum(routes, DataDistance.type), DataDistance);
    this.addStatFromValue(stats, StatsUtilities.sum(routes, DataAscent.type), DataAscent);
    this.addStatFromValue(stats, StatsUtilities.sum(routes, DataDescent.type), DataDescent);
    this.addStatFromValue(stats, StatsUtilities.min(routes, DataGradeMin.type), DataGradeMin);
    this.addStatFromValue(stats, StatsUtilities.max(routes, DataGradeMax.type), DataGradeMax);
    this.addStatFromValue(
      stats,
      StatsUtilities.weightedAverage(routes, DataGradeAvg.type, DataDistance.type),
      DataGradeAvg
    );

    return stats;
  }

  private static addStatFromValue<T extends DataInterface>(
    stats: DataInterface[],
    value: number | null,
    DataClass: new (value: number) => T
  ): void {
    if (value === null) {
      return;
    }
    stats.push(new DataClass(value));
  }
}
