import { ActivityUtilities } from '../../utilities/activity.utilities';
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

  /** Exports positional activities with TrackPointExtension/v2 speed in m/s, retaining recorded zero speed and power.
   * Builds its positional time grid locally without adding or removing activity streams. */
  async getAsString(event: EventInterface): Promise<string> {
    const { setGPXPointSpeed, useGPXTrackPointV2 } = await import('../gpx-speed');
    return new Promise<string>((resolve, _reject) => {
      const tracks: typeof Track = [];
      event.getActivities().forEach(activity => {
        // We cannot export activities with no positional data!
        if (!activity.hasPositionData()) {
          return;
        }
        const timeStream = activity.generateTimeStream([DataLatitudeDegrees.type, DataLongitudeDegrees.type]);
        const exportedTypes = [
          DataLongitudeDegrees.type,
          DataDistance.type,
          DataHeartRate.type,
          DataCadence.type,
          DataStrokeRate.type,
          DataTemperature.type,
          DataPower.type,
          DataAltitude.type,
          DataSpeed.type
        ];
        const segment = new Segment(
          ActivityUtilities.getStreamDataTypesBasedOnDataType(
            activity.getStream(DataLatitudeDegrees.type),
            [timeStream, ...activity.getAllStreams().filter(stream => exportedTypes.includes(stream.type))]
          )
            .reduce((pointsArray: (typeof Point)[], data, _index, _array) => {
              const point = new Point(<number>data[DataLatitudeDegrees.type], <number>data[DataLongitudeDegrees.type], {
                ele: data[DataAltitude.type] || undefined,
                time: new Date(activity.startDate.getTime() + <number>data[DataTime.type] * 1000),
                hr: data[DataHeartRate.type],
                power: data[DataPower.type] ?? undefined,
                atemp: data[DataTemperature.type] || undefined,
                cad: data[DataStrokeRate.type] || data[DataCadence.type] || undefined,
                extensions: {
                  power: data[DataPower.type] ?? undefined,
                  distance: data[DataDistance.type] || undefined
                }
              });
              setGPXPointSpeed(point, data[DataSpeed.type]);
              pointsArray.push(point);
              return pointsArray;
            }, [])
        );
        tracks.push(new Track([segment], { name: activity.type, type: activity.type }));
      });

      const builder = new GarminBuilder();
      useGPXTrackPointV2(builder);
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
