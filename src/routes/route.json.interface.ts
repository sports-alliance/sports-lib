import { ActivityTypes } from '../activities/activity.types';
import { CreatorJSONInterface } from '../creators/creator.json.interface';
import { DataJSONInterface } from '../data/data.json.interface';
import { StreamJSONInterface } from '../streams/stream';
import { RouteLinkInterface, RoutePointInterface } from './route-point.interface';

export interface RouteJSONInterface {
  id?: string;
  name: string | null;
  activityType: ActivityTypes | null;
  comment?: string | null;
  description?: string | null;
  number?: number | null;
  links?: RouteLinkInterface[];
  extensions?: unknown;
  creator: CreatorJSONInterface;
  stats: DataJSONInterface;
  streams: StreamJSONInterface[] | { [key: string]: (number | null)[] };
  points: RoutePointInterface[];
}
