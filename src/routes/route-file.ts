import { Creator } from '../creators/creator';
import { CreatorInterface } from '../creators/creator.interface';
import { FileType } from '../events/adapters/file-type.enum';
import { StatsClassAbstract } from '../stats/stats.class.abstract';
import { StatsUtilities } from '../stats/stats.utilities';
import { RouteFileJSONInterface } from './route-file.json.interface';
import { RouteFileInterface } from './route-file.interface';
import { RouteInterface } from './route.interface';
import { RouteWaypointInterface } from './route-point.interface';
import { RouteJSONInterface } from './route.json.interface';

export class RouteFile extends StatsClassAbstract implements RouteFileInterface {
  public name: string;
  public srcFileType: FileType | string;
  public createdAt: Date | null;
  public creator: CreatorInterface;

  private routes: RouteInterface[] = [];
  private waypoints: RouteWaypointInterface[] = [];

  constructor(
    name = 'New Route File',
    srcFileType: FileType | string = FileType.GPX,
    creator: CreatorInterface = new Creator('Unknown Device'),
    routes: RouteInterface[] = [],
    waypoints: RouteWaypointInterface[] = [],
    createdAt: Date | null = null
  ) {
    super();
    this.name = name;
    this.srcFileType = srcFileType;
    this.creator = creator;
    this.createdAt = createdAt;
    this.routes = routes;
    this.waypoints = waypoints;
  }

  addRoute(route: RouteInterface): this {
    this.routes.push(route);
    return this;
  }

  addRoutes(routes: RouteInterface[]): this {
    routes.forEach(route => this.addRoute(route));
    return this;
  }

  clearRoutes(): this {
    this.routes = [];
    return this;
  }

  getRoutes(): RouteInterface[] {
    return this.routes;
  }

  getFirstRoute(): RouteInterface {
    return this.getRoutes()[0];
  }

  hasRoutes(): boolean {
    return this.routes.length > 0;
  }

  addWaypoint(waypoint: RouteWaypointInterface): this {
    this.waypoints.push(waypoint);
    return this;
  }

  addWaypoints(waypoints: RouteWaypointInterface[]): this {
    waypoints.forEach(waypoint => this.addWaypoint(waypoint));
    return this;
  }

  getWaypoints(): RouteWaypointInterface[] {
    return this.waypoints;
  }

  toJSON(): RouteFileJSONInterface {
    const routeFileJSON: RouteFileJSONInterface = {
      name: this.name,
      srcFileType: this.srcFileType,
      createdAt: this.createdAt ? this.createdAt.getTime() : null,
      creator: this.creator.toJSON(),
      stats: StatsUtilities.serializeStats(this.getStats()),
      routes: this.getRoutes().reduce((routes: RouteJSONInterface[], route) => {
        routes.push(route.toJSON());
        return routes;
      }, []),
      waypoints: this.getWaypoints()
    };

    const id = this.getID();
    if (id) {
      routeFileJSON.id = id;
    }

    return routeFileJSON;
  }
}
