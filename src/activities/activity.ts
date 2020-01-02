import {ActivityInterface} from './activity.interface';
import {DataInterface} from '../data/data.interface';
import {LapInterface} from '../laps/lap.interface';
import {IntensityZonesInterface} from '../intensity-zones/intensity-zones.interface';
import {Creator} from '../creators/creator';
import {ActivityTypes} from './activity.types';
import {DurationClassAbstract} from '../duration/duration.class.abstract';
import {CreatorInterface} from '../creators/creator.interface';
import {DataLatitudeDegrees} from '../data/data.latitude-degrees';
import {DataLongitudeDegrees} from '../data/data.longitude-degrees';
import {StreamDataItem, StreamInterface} from '../streams/stream.interface';
import {ActivityJSONInterface} from './activity.json.interface';
import {DataPositionInterface} from '../data/data.position.interface';
import {Stream} from '../streams/stream';
import {IntensityZonesJSONInterface} from '../intensity-zones/intensity-zones.json.interface';
import {isNumber} from '../events/utilities/helpers';
import {EventUtilities} from '../events/utilities/event.utilities';
import {DataGNSSDistance} from '../data/data.gnss-distance';

export class Activity extends DurationClassAbstract implements ActivityInterface {
  public type: ActivityTypes;
  public creator: CreatorInterface;
  public intensityZones: IntensityZonesInterface[] = []; // maybe rename

  private laps: LapInterface[] = [];
  private streams: StreamInterface[] = [];

  constructor(startDate: Date, endDate: Date, type: ActivityTypes, creator: Creator) {
    super(startDate, endDate);
    if (!startDate || !endDate) {
      throw new Error('Start and end dates are required');
    }
    if (endDate < startDate) {
      throw new Error('Activity end date is before the start date and that is not acceptable')
    }
    if (+endDate - +startDate > 12 * 10 * 30 * 24 * 60 * 60 * 1000) {
      throw new Error('Activity duration is over 10 years and that is not supported');
    }
    this.type = type;
    this.creator = creator;
  }

  createStream(type: string): StreamInterface {
    return new Stream(type, Array(EventUtilities.getDataLength(this.startDate, this.endDate)).fill(null));
  }

  addDataToStream(type: string, date: Date, value: number): this {
    this.getStreamData(type)[Math.ceil((+date - +this.startDate) / 1000)] = value; // @todo ceil vs floor
    return this;
  }

  addStream(stream: StreamInterface): this {
    if (this.streams.find((activityStream) => activityStream.type === stream.type)) {
      throw new Error(`Duplicate type of stream when adding ${stream.type} to activity ${this.getID()}`);
    }
    this.streams.push(stream);
    return this;
  }

  clearStreams(): this {
    this.streams = [];
    return this;
  }

  removeStream(stream: StreamInterface): this {
    this.streams = this.streams.filter((activityStream) => stream !== activityStream)
    return this;
  }

  addStreams(streams: StreamInterface[]): this {
    this.streams.push(...streams);
    return this;
  }

  getAllStreams(): StreamInterface[] {
    return this.streams;
  }

  getAllExportableStreams(): StreamInterface[] {
    return this.getAllStreams().filter((stream) => !stream.isUnitDerivedDataType() && stream.type !== DataGNSSDistance.type);
  }

  hasStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): boolean {
    try {
      this.getStreamData(streamType, startDate, endDate);
    } catch (e) {
      return false
    }
    return true;
  }

  hasPositionData(startDate?: Date, endDate?: Date): boolean {
    return this.hasStreamData(DataLatitudeDegrees.type, startDate, endDate) && this.hasStreamData(DataLongitudeDegrees.type, startDate, endDate);
  }

  getStream(streamType: string): StreamInterface {
    const find = this.streams
      .find((stream) => stream.type === streamType);
    if (!find) {
      throw Error(`No stream found with type ${streamType}`);
    }
    return find;
  }

  getStreamData(streamType: string | StreamInterface, startDate?: Date, endDate?: Date): (number | null)[] {
    const stream = (streamType instanceof Stream) ? streamType : this.getStream(<string>streamType);
    if (!startDate && !endDate) {
      return stream.data;
    }

    if (startDate && endDate) {
      return stream.data
        .filter((value, index) => (new Date(this.startDate.getTime() + index * 1000)) <= endDate)
        .filter((value, index) => (new Date(this.startDate.getTime() + index * 1000)) >= startDate)
    }

    if (startDate) {
      return stream.data
        .filter((value, index) => (new Date(this.startDate.getTime() + index * 1000)) > startDate);
    }

    if (endDate) {
      return stream.data
        .filter((value, index) => (new Date(this.startDate.getTime() + index * 1000)) < endDate);
    }

    return [];
  }

  // @todo see how this fits with the filtering on the stream class
  /**
   * Gets the data array of an activity stream excluding the non numeric ones
   * @todo include strings and all data abstract types
   * @param streamType
   * @param startDate
   * @param endDate
   */
  getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[] {
    return <number[]>this.getStreamData(streamType, startDate, endDate).filter(data => isNumber(data))
  }

  /**
   * Combines the lat - long streams to a DataPositionInterface
   * @param startDate
   * @param endDate
   * @param latitudeStream
   * @param longitudeStream
   */
  getPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): (DataPositionInterface | null)[] {
    const latitudeStreamData = latitudeStream ? this.getStreamData(latitudeStream, startDate, endDate) : this.getStreamData(DataLatitudeDegrees.type, startDate, endDate);
    const longitudeStreamData = longitudeStream ? this.getStreamData(longitudeStream, startDate, endDate) : this.getStreamData(DataLongitudeDegrees.type, startDate, endDate);
    return latitudeStreamData.reduce((positionArray: (DataPositionInterface | null)[], value, index, array) => {
      const currentLatitude = latitudeStreamData[index];
      const currentLongitude = longitudeStreamData[index];
      if (!isNumber(currentLatitude) || !isNumber(currentLongitude)) {
        positionArray.push(null);
        return positionArray;
      }
      positionArray.push({
        latitudeDegrees: <number>currentLatitude,
        longitudeDegrees: <number>currentLongitude,
      });
      return positionArray;
    }, []);
  }

  /**
   * Combines the lat - long streams to a DataPositionInterface and excludes nulls
   * @param startDate
   * @param endDate
   * @param latitudeStream
   * @param longitudeStream
   */
  getSquashedPositionData(startDate?: Date, endDate?: Date, latitudeStream?: StreamInterface, longitudeStream?: StreamInterface): DataPositionInterface[] {
    return <DataPositionInterface[]>this.getPositionData(startDate, endDate, latitudeStream, longitudeStream).filter(data => data !== null);
  }

  getStreamDataTypesBasedOnDataType(streamTypeToBaseOn: string, streamTypes: string[]): { [type: string]: { [type: string]: number | null } } {
    return EventUtilities.getStreamDataTypesBasedOnDataType(
      this.getStream(streamTypeToBaseOn),
      this.getAllStreams()
        .filter(stream => stream.type !== streamTypeToBaseOn)
        .filter(stream => streamTypes.indexOf(stream.type) !== -1))
  }


  getStreamDataTypesBasedOnTime(streamTypes: string[]): { [type: number]: { [type: string]: number | null } } {
    return EventUtilities.getStreamDataTypesBasedOnTime(this.startDate, this.endDate, this.getAllStreams().filter(stream => streamTypes.indexOf(stream.type) !== -1))
  }

  getStreamDataByTime(streamType: string, filterNull = false, filterInfinity = false): StreamDataItem[] {
    return this.getStream(streamType).getStreamDataByTime(this.startDate, filterNull, filterInfinity);
  }

  addLap(lap: LapInterface): this {
    this.laps.push(lap);
    return this;
  }

  getLaps(activity?: ActivityInterface): LapInterface[] {
    return this.laps;
  }

  toJSON(): ActivityJSONInterface {
    const intensityZones: IntensityZonesJSONInterface[] = [];
    this.intensityZones.forEach((value: IntensityZonesInterface) => {
      intensityZones.push(value.toJSON());
    });
    const stats = {};
    this.stats.forEach((value: DataInterface, key: string) => {
      Object.assign(stats, value.toJSON());
    });
    return {
      startDate: this.startDate.getTime(),
      endDate: this.endDate.getTime(),
      type: this.type,
      creator: this.creator.toJSON(),
      intensityZones: intensityZones,
      stats: stats,
      laps: this.getLaps().reduce((jsonLapsArray: any[], lap: LapInterface) => {
        jsonLapsArray.push(lap.toJSON());
        return jsonLapsArray;
      }, []),
    };
  }
}
