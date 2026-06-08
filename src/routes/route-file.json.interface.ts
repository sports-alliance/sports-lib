import { CreatorJSONInterface } from '../creators/creator.json.interface';
import { DataJSONInterface } from '../data/data.json.interface';
import { FileType } from '../events/adapters/file-type.enum';
import { RouteJSONInterface } from './route.json.interface';
import { RouteWaypointInterface } from './route-point.interface';

export interface RouteFileJSONInterface {
  id?: string;
  name: string;
  srcFileType: FileType | string;
  createdAt: number | null;
  creator: CreatorJSONInterface;
  stats?: DataJSONInterface;
  routes: RouteJSONInterface[];
  waypoints: RouteWaypointInterface[];
}
