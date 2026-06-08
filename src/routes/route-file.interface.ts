import { CreatorInterface } from '../creators/creator.interface';
import { FileType } from '../events/adapters/file-type.enum';
import { IDClassInterface } from '../id/id.class.interface';
import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { RouteFileJSONInterface } from './route-file.json.interface';
import { RouteInterface } from './route.interface';
import { RouteWaypointInterface } from './route-point.interface';

export interface RouteFileInterface extends SerializableClassInterface, IDClassInterface, StatsClassInterface {
  name: string;
  srcFileType: FileType | string;
  createdAt: Date | null;
  creator: CreatorInterface;

  addRoute(route: RouteInterface): this;

  addRoutes(routes: RouteInterface[]): this;

  clearRoutes(): this;

  getRoutes(): RouteInterface[];

  getFirstRoute(): RouteInterface;

  hasRoutes(): boolean;

  addWaypoint(waypoint: RouteWaypointInterface): this;

  addWaypoints(waypoints: RouteWaypointInterface[]): this;

  getWaypoints(): RouteWaypointInterface[];

  toJSON(): RouteFileJSONInterface;
}
