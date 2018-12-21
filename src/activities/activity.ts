import {ActivityInterface} from './activity.interface';
import {DataInterface} from '../data/data.interface';
import {LapInterface} from '../laps/lap.interface';
import {IntensityZonesInterface} from '../intensity-zones/intensity-zones.interface';
import {Creator} from '../creators/creator';
import {Weather} from '../weather/app.weather';
import {GeoLocationInfo} from '../geo-location-info/geo-location-info';
import {ActivityTypes} from './activity.types';
import {DurationClassAbstract} from '../duration/duration.class.abstract';
import {CreatorInterface} from '../creators/creator.interface';
import {DataLatitudeDegrees} from '../data/data.latitude-degrees';
import {DataLongitudeDegrees} from '../data/data.longitude-degrees';
import {StreamInterface} from '../streams/stream.interface';
import {ActivityJSONInterface} from './activity.json.interface';
import {DataPositionInterface} from '../data/data.position.interface';
import {isNumeric} from 'tslint';
import {isNumber} from '../events/utilities/event.utilities';
import {Stream} from '../streams/stream';
import {DataAltitude} from '../data/data.altitude';

export class Activity extends DurationClassAbstract implements ActivityInterface {
  public type: ActivityTypes;
  public creator: CreatorInterface;
  public intensityZones: IntensityZonesInterface[] = [];// maybe rename
  public geoLocationInfo?: GeoLocationInfo;
  public weather?: Weather;

  private laps: LapInterface[] = [];
  private streams: StreamInterface[] = [];

  constructor(startDate: Date, endDate: Date, type: ActivityTypes, creator: Creator) {
    super(startDate, endDate);
    this.type = type;
    this.creator = creator;
  }

  createStream(type: string): StreamInterface {
    return new Stream(type, Array(Math.ceil((+this.endDate - +this.startDate) / 1000)).fill(null));
  }

  addDataToStream(type: string, date: Date, value: number): void {
    this.getStreamData(type)[Math.ceil((+date - +this.startDate) / 1000)] = value;
  }

  addStream(stream: StreamInterface): void {
    this.streams.push(stream);
  }

  clearStreams(): void {
    this.streams = [];
  }

  removeStream(stream: StreamInterface): void {
    this.streams.filter((activityStream) => stream !== activityStream)
  }

  addStreams(streams: StreamInterface[]): void {
    this.streams.push(...streams);
  }

  getAllStreams(): StreamInterface[] {
    return this.streams;
  }

  hasStreamData(streamType: string, startDate?: Date, endDate?: Date): boolean {
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

  getStreamData(streamType: string, startDate?: Date, endDate?: Date): (number|null)[] {
    const stream = this.streams
      .find((stream) => stream.type === streamType);
    if (!stream) {
      throw Error(`No stream found with type ${streamType}`);
    }

    if (!startDate && !endDate) {
      return stream.data;
    }

    if (startDate && endDate) {
      return stream.data
        .filter((value, index) => (new Date(startDate.getTime() + index * 1000)) > startDate)
        .filter((value, index) => (new Date(startDate.getTime() + index * 1000)) < endDate);
    }

    if (startDate) {
      return stream.data
        .filter((value, index) => (new Date(startDate.getTime() + index * 1000)) > startDate);
    }

    if (endDate) {
      return stream.data
        .filter((value, index) => (new Date(endDate.getTime() + index * 1000)) < endDate);
    }

    return [];
  }

  // @todo see how this fits with the filtering on the stream class
  getSquashedStreamData(streamType: string, startDate?: Date, endDate?: Date): number[] {
    return <number[]>this.getStreamData(streamType, startDate, endDate).filter(data => isNumber(data))
  }

  getPositionData(startDate?: Date, endDate?: Date): (DataPositionInterface | null)[] {
    const latitudeStreamData = this.getStreamData(DataLatitudeDegrees.type, startDate, endDate);
    const longitudeStreamData = this.getStreamData(DataLongitudeDegrees.type, startDate, endDate);
    return latitudeStreamData.reduce((positionArray: (DataPositionInterface | null)[], value, index, array) => {
      // debugger;
      const currentLatitude = latitudeStreamData[index];
      const currentLongitude = longitudeStreamData[index];
      if (!currentLatitude || !currentLongitude) {
        positionArray.push(null);
        return positionArray;
      }
      positionArray.push({
        latitudeDegrees: currentLatitude,
        longitudeDegrees: currentLongitude,
      });
      return positionArray;
    }, []);
  }

  addLap(lap: LapInterface) {
    this.laps.push(lap);
  }

  getLaps(activity?: ActivityInterface): LapInterface[] {
    return this.laps;
  }

  toJSON(): ActivityJSONInterface {
    const intensityZones: any = [];
    this.intensityZones.forEach((value: IntensityZonesInterface) => {
      intensityZones.push(value.toJSON());
    });
    const stats: any[] = [];
    this.stats.forEach((value: DataInterface, key: string) => {
      stats.push(value.toJSON());
    });
    return {
      startDate: this.startDate.toJSON(),
      endDate: this.endDate.toJSON(),
      type: this.type,
      creator: this.creator.toJSON(),
      intensityZones: intensityZones,
      stats: stats,
      geoLocationInfo: this.geoLocationInfo ? this.geoLocationInfo.toJSON() : null,
      weather: this.weather ? this.weather.toJSON() : null,
      laps: this.getLaps().reduce((jsonLapsArray: any[], lap: LapInterface) => {
        jsonLapsArray.push(lap.toJSON());
        return jsonLapsArray;
      }, []),
    };
  }
}
