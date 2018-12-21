import {CreatorInterface} from '../creators/creator.interface';
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
import {IDClassInterface} from '../id/id.class.interface';
import {DataPositionInterface} from '../data/data.position.interface';

export interface ActivityInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface, IDClassInterface {
  type: ActivityTypes;
  creator: CreatorInterface;
  intensityZones: IntensityZonesInterface[];
  geoLocationInfo?: GeoLocationInfo;
  weather?: Weather;


  hasStreamData(streamType: string, startDate?: Date, endDate?: Date): boolean;
  getStreamData(streamType: string, startDate?: Date, endDate?: Date): (number|null)[];
  getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[];
  createStream(type: string): StreamInterface;
  addStream(stream: StreamInterface): void;
  addStreams(streams: StreamInterface[]): void;
  removeStream(stream: StreamInterface): void;
  getAllStreams(): StreamInterface[];
  clearStreams(): void;
  addDataToStream(type: string, date: Date, data: number): void;
  getLatLongArray(startDate?: Date, endDate?: Date): (DataPositionInterface|null)[];
  getLaps(): LapInterface[];
  addLap(lap: LapInterface): void;
  toJSON(): ActivityJSONInterface
}
