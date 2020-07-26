import { EventInterface } from '../../event.interface';
import { EventExporter } from './exporter.interface';
import { DataLatitudeDegrees } from '../../../data/data.latitude-degrees';
import { DataDistance } from '../../../data/data.distance';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataCadence } from '../../../data/data.cadence';
import { DataTemperature } from '../../../data/data.temperature';
import { DataPower } from '../../../data/data.power';
import { DataAltitude } from '../../../data/data.altitude';
import { DataSpeed } from '../../../data/data.speed';
import { DataLongitudeDegrees } from '../../../data/data.longitude-degrees';
import { DataTime } from '../../../data/data.time';

const {buildGPX, GarminBuilder} = require('gpx-builder');
const {Point, Metadata, Person, Copyright, Link, Track, Segment} = GarminBuilder.MODELS;

export class EventExporterGPX implements EventExporter {
  fileType = 'application/json';
  fileExtension = 'gpx';

  getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      if (event.getActivities().length > 1) {
        reject('Multi activity events are not supported');
      }
      const tracks: typeof Track = []
      event.getActivities().forEach((activity) => {
        const timeStream = event.getFirstActivity().generateTimeStream([DataLatitudeDegrees.type]);
        activity.addStream(timeStream);
        const segment = new Segment(
          event.getFirstActivity().getStreamDataTypesBasedOnDataType(DataLatitudeDegrees.type, [
            DataLongitudeDegrees.type,
            DataTime.type,
            DataDistance.type,
            DataHeartRate.type,
            DataCadence.type,
            DataTemperature.type,
            DataPower.type,
            DataAltitude.type,
            DataSpeed.type
          ]).reduce((pointsArray: typeof Point[], data) => {
            pointsArray.push(new Point(
              <number>data[DataLatitudeDegrees.type],
              <number>data[DataLongitudeDegrees.type],
              {
                ele: data[DataAltitude.type] || undefined,
                time: new Date(activity.startDate.getTime() + <number>data[DataTime.type] * 1000),
                hr: data[DataHeartRate.type],
                power: data[DataPower.type] || undefined,
                speed: data[DataSpeed.type] || undefined,
                atemp: data[DataTemperature.type] || undefined,
                cad: data[DataCadence.type] || undefined,
                extensions: {
                  power: data[DataPower.type] || undefined,
                  distance: data[DataCadence.type] || undefined,
                }
              }
            ))
            return pointsArray;
          }, []))
        tracks.push(new Track([segment]));
        activity.removeStream(timeStream);
      })


      const builder = new GarminBuilder();
      builder.setTracks(tracks);
      builder.setMetadata(new Metadata({
        name: event.name,
        desc: event.description,
        // author: new Person,
        copyright: new Copyright('Quantified-Self.IO ', new Date().getFullYear().toString()),
        link: new Link('https://quantified-self.io/', {text: 'Quantified Self IO', type: 'Application'}),
        time: new Date(),
      }));
      builder.data.attributes.creator = event.getFirstActivity().creator.name;
      resolve(buildGPX(builder.toObject()));
    })
  }
}
