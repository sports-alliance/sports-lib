import {CreatorInterface} from '../creators/creator.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {LapInterface} from '../laps/lap.interface';
import {IntensityZonesInterface} from '../intensity-zones/intensity-zones.interface';
import {StatsClassInterface} from '../stats/stats.class.interface';
import {DurationClassInterface} from '../duration/duration.class.interface';
import {ActivityTypes} from './activity.types';
import {StreamDataItem, StreamInterface} from '../streams/stream.interface';
import {ActivityJSONInterface} from './activity.json.interface';
import {IDClassInterface} from '../id/id.class.interface';
import {DataPositionInterface} from '../data/data.position.interface';

export interface ActivityInterface extends StatsClassInterface, DurationClassInterface, SerializableClassInterface, IDClassInterface {
  type: ActivityTypes;
  creator: CreatorInterface;
  intensityZones: IntensityZonesInterface[];

  hasStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): boolean;
  hasPositionData(startDate?: Date, endDate?: Date): boolean;
  getStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): (number|null)[];
  getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[];
  getStreamDataByTime(streamType: string, filterNull?: boolean): StreamDataItem[]
  getStreamDataByDuration(streamType: string, filterNull?: boolean, filterInfinity?: boolean): StreamDataItem[]
  getStreamDataTypesBasedOnTime(streamTypes: string[]): { [type: number]: { [type: string]: number | null } };
  getStreamDataTypesBasedOnDataType(streamTypeToBaseOn: string, streamTypes: string[]): { [type: string]: { [type: string]: number | null } };
  createStream(type: string): StreamInterface;
  getStream(type: string): StreamInterface;
  addStream(stream: StreamInterface): this;
  addStreams(streams: StreamInterface[]): this;
  removeStream(stream: StreamInterface): this;
  getAllStreams(): StreamInterface[];
  getAllExportableStreams(): StreamInterface[];
  clearStreams(): this;
  addDataToStream(type: string, date: Date, data: number): this;
  getPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): (DataPositionInterface|null)[];
  getSquashedPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): (DataPositionInterface|null)[];
  getLaps(): LapInterface[];
  addLap(lap: LapInterface): this;
  toJSON(): ActivityJSONInterface
}
