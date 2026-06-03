import { ActivityTypes } from '../activities/activity.types';
import { CreatorInterface } from '../creators/creator.interface';
import { DataPositionInterface } from '../data/data.position.interface';
import { IDClassInterface } from '../id/id.class.interface';
import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { StatsClassInterface } from '../stats/stats.class.interface';
import { RouteParsingOptions } from './route-parsing-options';
import { RouteLinkInterface, RoutePointInterface } from './route-point.interface';
import { RouteStreamInterface } from './route-stream.interface';
import { RouteJSONInterface } from './route.json.interface';

export interface RouteInterface extends StatsClassInterface, SerializableClassInterface, IDClassInterface {
  name: string | null;
  activityType: ActivityTypes | null;
  comment: string | null;
  description: string | null;
  number: number | null;
  links: RouteLinkInterface[];
  extensions?: unknown;
  creator: CreatorInterface;
  parseOptions: RouteParsingOptions;

  createStream(type: string, length?: number): RouteStreamInterface;

  addDataToStream(type: string, index: number, value: number): this;

  addStream(stream: RouteStreamInterface): this;

  addStreams(streams: RouteStreamInterface[]): this;

  clearStreams(): this;

  removeStream(streamType: string | RouteStreamInterface): this;

  replaceStreamData(streamType: string, data: (number | null)[]): this;

  getAllStreams(): RouteStreamInterface[];

  getAllExportableStreams(): RouteStreamInterface[];

  getStream(type: string): RouteStreamInterface;

  hasStreamData(streamType: string | RouteStreamInterface): boolean;

  getStreamData(streamType: string | RouteStreamInterface): (number | null)[];

  getSquashedStreamData(streamType: string): number[];

  hasPositionData(): boolean;

  getPositionData(): (DataPositionInterface | null)[];

  getSquashedPositionData(): DataPositionInterface[];

  getPointData(): RoutePointInterface[];

  setPoints(points: RoutePointInterface[]): this;

  getPointCount(): number;

  toJSON(): RouteJSONInterface;
}
