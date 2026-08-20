import { EventInterface } from '../../event.interface';
import { EventExporter } from './exporter.interface';
import { DataLatitudeDegrees } from '../../../data/data.latitude-degrees';
import { DataDistance } from '../../../data/data.distance';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataCadence } from '../../../data/data.cadence';
import { DataStrokeRate } from '../../../data/data.stroke-rate';
import { DataTemperature } from '../../../data/data.temperature';
import { DataPower } from '../../../data/data.power';
import { DataAltitude } from '../../../data/data.altitude';
import { DataSpeed } from '../../../data/data.speed';
import { DataLongitudeDegrees } from '../../../data/data.longitude-degrees';
import { DataTime } from '../../../data/data.time';

// @ts-ignore
import { buildGPX as _buildGPX, GarminBuilder as _GarminBuilder } from 'gpx-builder';
const buildGPX = _buildGPX as any;
const GarminBuilder = _GarminBuilder as any;
const { Point, Metadata, Person: _Person, Copyright, Link, Track, Segment } = GarminBuilder.MODELS;

export class EventExporterGPX implements EventExporter {
  fileType = 'application/gpx+xml';
  fileExtension = 'gpx';

  getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, _reject) => {
      const tracks: typeof Track = [];
      event.getActivities().forEach(activity => {
        // We cannot export activities with no positional data!
        if (!activity.hasPositionData()) {
          return;
        }
        const timeStream = activity.generateTimeStream([DataLatitudeDegrees.type, DataLongitudeDegrees.type]);
        // @todo it should make an activity copy
        activity.addStream(timeStream);
        const segment = new Segment(
          activity
            .getStreamDataTypesBasedOnDataType(DataLatitudeDegrees.type, [
              DataLongitudeDegrees.type,
              DataTime.type,
              DataDistance.type,
              DataHeartRate.type,
              DataCadence.type,
              DataStrokeRate.type,
              DataTemperature.type,
              DataPower.type,
              DataAltitude.type,
              DataSpeed.type
            ])
            .reduce((pointsArray: (typeof Point)[], data, _index, _array) => {
              pointsArray.push(
                new Point(<number>data[DataLatitudeDegrees.type], <number>data[DataLongitudeDegrees.type], {
                  ele: data[DataAltitude.type] || undefined,
                  time: new Date(activity.startDate.getTime() + <number>data[DataTime.type] * 1000),
                  hr: data[DataHeartRate.type],
                  power: data[DataPower.type] || undefined,
                  speed: data[DataSpeed.type] || undefined,
                  atemp: data[DataTemperature.type] || undefined,
                  cad: data[DataStrokeRate.type] || data[DataCadence.type] || undefined,
                  extensions: {
                    power: data[DataPower.type] || undefined,
                    distance: data[DataDistance.type] || undefined
                  }
                })
              );
              return pointsArray;
            }, [])
        );
        tracks.push(new Track([segment], { name: activity.type, type: activity.type }));
        // @todo it should make an activity copy
        activity.removeStream(timeStream);
      });

      const builder = new GarminBuilder();
      builder.setTracks(tracks);
      builder.setMetadata(
        new Metadata({
          name: event.name,
          desc: event.description,
          // author: new Person,
          copyright: new Copyright('Quantified-Self.IO ', new Date().getFullYear().toString()),
          link: new Link('https://quantified-self.io/', { text: 'Quantified Self IO', type: 'Application' }),
          time: new Date()
        })
      );
      builder.data.attributes.creator = event.getFirstActivity().creator.name;
      resolve(buildGPX(builder.toObject()));
    });
  }
}
