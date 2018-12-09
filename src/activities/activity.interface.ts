import {CreatorInterface} from '../creators/creator.interface';
import {PointInterface} from '../points/point.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {LapInterface} from '../laps/lap.interface';
import {IBIData} from '../data/ibi/data.ibi';
import {IntensityZonesInterface} from '../intensity-zones/intensity-zones.interface';
import {StatsClassInterface} from '../stats/stats.class.interface';
import {Weather} from '../weather/app.weather';
import {GeoLocationInfo} from '../geo-location-info/geo-location-info';
import {DurationClassInterface} from '../duration/duration.class.interface';
import {ActivityTypes} from './activity.types';
import {StreamInterface} from '../streams/stream.interface';
import {ActivityJSONInterface} from './activity.json.interface';

export interface ActivityInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface {
  type: ActivityTypes;
  creator: CreatorInterface;
  ibiData: IBIData;
  intensityZones: Map<string, IntensityZonesInterface>;
  streams: StreamInterface[];
  geoLocationInfo?: GeoLocationInfo;
  weather?: Weather;


  hasStreamData(streamType: string, startDate?: Date, endDate?: Date): boolean;
  getStreamData(streamType: string, startDate?: Date, endDate?: Date): number[];
  addPoint(point: PointInterface, overrideAllDataOnCollision?: boolean): void;
  removePoint(point: PointInterface): void;
  removePoint(point: PointInterface): void;
  getPoints(startDate?: Date, endDate?: Date): PointInterface[];
  getPointsInterpolated(startDate?: Date, endDate?: Date, step?: number): PointInterface[];
  getStartPoint(): PointInterface;
  getEndPoint(): PointInterface;
  getLaps(): LapInterface[];
  addLap(lap: LapInterface): void;
  sortPointsByDate(): void; // Todo make return
  toJSON(): ActivityJSONInterface
}
