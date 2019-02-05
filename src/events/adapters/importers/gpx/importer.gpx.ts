import {Activity} from '../../../../activities/activity';
import {EventInterface} from '../../../event.interface';
import {Creator} from '../../../../creators/creator';
import {Event} from '../../../event';
import {ActivityTypes} from '../../../../activities/activity.types';
import {ActivityInterface} from '../../../../activities/activity.interface';
import {GPXSampleMapper} from './importer.gpx.mapper';
import {isNumberOrString} from "../../../utilities/helpers";
import {EventUtilities} from "../../../utilities/event.utilities";

const GXParser = require('gxparser').GXParser;

export class EventImporterGPX {

  static getFromString(gpx: string, name = 'New Event'): Promise<EventInterface> {

    return new Promise((resolve, reject) => {

      const parsedGPX: any = GXParser(gpx);
      const activities: ActivityInterface[] = parsedGPX.trk.reduce((activities: ActivityInterface[], trk: any) => {
        // Get the samples
        const samples = trk.trkseg.reduce((trkptArray: any[], trkseg: any) => {
          return trkptArray.concat(trkseg.trkpt)
        }, []);

        // Determine if it's a route. The samples will most probably be missing the time
        const isActivity = !!trk.trkseg[0].trkpt[0].time;

        // Create an activity. Set the dates depending on route etc
        const startDate = new Date(isActivity ? trk.trkseg[0].trkpt[0].time[0] : new Date());
        const endDate = isActivity ?
          new Date(trk.trkseg[trk.trkseg.length - 1].trkpt[trk.trkseg[trk.trkseg.length - 1].trkpt.length - 1].time[0]) :
          new Date(startDate.getTime() + samples.length * 1000);
        let activityType =  isActivity ? ActivityTypes.unknown : ActivityTypes.route;
        if (trk.type && ActivityTypes[<keyof typeof ActivityTypes>trk.type]) {
          activityType = ActivityTypes[<keyof typeof ActivityTypes>trk.type]
        }
        const activity = new Activity(
          startDate,
          endDate,
          activityType,
          new Creator(
            parsedGPX.creator,
            parsedGPX.version,
          ),
        );
        // Match
        GPXSampleMapper.forEach((sampleMapping) => {
          const subjectSamples = <any[]>samples.filter((sample: any) => isNumberOrString(sampleMapping.getSampleValue(sample)));
          if (subjectSamples.length) {
            activity.addStream(activity.createStream(sampleMapping.dataType));
            subjectSamples.forEach((subjectSample, index) => {
              activity.addDataToStream(sampleMapping.dataType, isActivity ? new Date(subjectSample.time[0]) : new Date(activity.startDate.getTime() + index * 1000), <number>sampleMapping.getSampleValue(subjectSample));
            });
          }
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
      EventUtilities.generateEventStatsForAllActivities(event);
      resolve(event);
    });
  }
}



