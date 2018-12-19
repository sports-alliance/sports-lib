import {Activity} from '../../../../activities/activity';
import {EventInterface} from '../../../event.interface';
import {Creator} from '../../../../creators/creator';
import {Event} from '../../../event';
import {ActivityTypes} from '../../../../activities/activity.types';
import {DataDistance} from '../../../../data/data.distance';
import {DataDuration} from '../../../../data/data.duration';
import {DataPause} from '../../../../data/data.pause';
import {convertSpeedToPace, EventUtilities, isNumberOrString} from '../../../utilities/event.utilities';
import {GeoLibAdapter} from '../../../../geodesy/adapters/geolib.adapter';
import {ActivityInterface} from '../../../../activities/activity.interface';
import {Stream} from '../../../../streams/stream';
import {GPXSampleMapper} from './importer.gpx.mapper';
import {StreamInterface} from '../../../../streams/stream.interface';

const GXParser = require('gxparser').GXParser;

export class EventImporterGPX {

  static getFromString(gpx: string, name = 'New Event'): Promise<EventInterface> {

    return new Promise((resolve, reject) => {

      const parsedGPX: any = GXParser(gpx);
      const activities: ActivityInterface[] = parsedGPX.trk.reduce((activities: ActivityInterface[], trk: any) => {
        // Create an activity
        const activity = new Activity(
          new Date(trk.trkseg[0].trkpt[0].time[0]),
          new Date(trk.trkseg[trk.trkseg.length - 1].trkpt[trk.trkseg[trk.trkseg.length - 1].trkpt.length - 1].time[0]),
          ActivityTypes[<keyof typeof ActivityTypes>trk.type || ActivityTypes.unknown],
          new Creator(
            parsedGPX.creator,
            parsedGPX.version,
          ),
        );

        const samples = trk.trkseg.reduce((trkptArray: any[], trkseg: any) => {
          return trkptArray.concat(trkseg.trkpt)
        }, []);

        GPXSampleMapper.reduce((streamArray: StreamInterface[], map) => {
          const subjectSamples = samples.filter((sample: any) => isNumberOrString(map.getSampleValue(sample)));
          if (subjectSamples.length) {
            streamArray.push(new Stream(
              map.dataType,
              subjectSamples.reduce((array: any, sample: any) => {
                array[Math.ceil((+(new Date(sample.time[0])) - +activity.startDate) / 1000)] = map.getSampleValue(sample);
                return array;
              }, Array(Math.ceil((+activity.endDate - +activity.startDate) / 1000))),
            ))
          }
          return streamArray;
        }, []).forEach((stream) => {
          activity.streams.push(stream);
        });
        // debugger;
        activities.push(activity);
        return activities;
      }, []);

      const event = new Event(name, activities[0].startDate, activities[activities.length - 1].endDate);
      activities.forEach((activity) => {
        event.addActivity(activity);
      });
      // debugger;
      // generate global stats
      EventUtilities.generateActivityStats(event);


      // @todo should be moved elsewhere perhaps also in the generation
      // Find and write the distance of the points
      // const geoLib = new GeoLibAdapter();
      // let distance = 0;
      // event.getPointsWithPosition().reduce((prev: PointInterface, current: PointInterface, index: number) => {
      //   if (index === 0) {
      //     prev.addData(new DataDistance(distance))
      //   }
      //   distance += geoLib.getDistance([prev, current]);
      //   current.addData(new DataDistance(distance));
      //   return current;
      // });


      // @todo move this elsewhere and refactor

      resolve(event);
    });
  }
}



