import { Activity } from '../../../../activities/activity';
import { EventInterface } from '../../../event.interface';
import { Creator } from '../../../../creators/creator';
import { Event } from '../../../event';
import { ActivityTypes, StravaGPXTypeMapping } from '../../../../activities/activity.types';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { GPXSampleMapper } from './importer.gpx.mapper';
import { isNumberOrString } from '../../../utilities/helpers';
import { EventUtilities } from '../../../utilities/event.utilities';
import { GXParser } from './gx-parser';

export class EventImporterGPX {

  static getFromString(gpx: string, domParser?: Function, name = 'New Event'): Promise<EventInterface> {

    return new Promise((resolve, reject) => {

      // debugger
      const parsedGPX: any = new GXParser(gpx, domParser);
      const track = parsedGPX.trk || parsedGPX.rte;

      const activities: ActivityInterface[] = track.reduce((activities: ActivityInterface[], trackOrRoute: any) => {
        // Get the samples
        let samples: any[] = [];
        let isActivity = false;
        if (trackOrRoute.trkseg) {
          samples = trackOrRoute.trkseg.reduce((trkptArray: any[], trkseg: any) => {
            return trkptArray.concat(trkseg.trkpt);
          }, []);
          // Determine if it's a route. The samples will most probably be missing the time
          isActivity = !!samples[0].time;
        } else if (trackOrRoute.rtept) {
          samples = trackOrRoute.rtept;
        }

        // Sort the points if its only an activity
        if (isActivity) {
          samples.sort((sampleA: any, sampleB: any) => {
            return +(new Date(sampleA.time[0])) - +(new Date(sampleB.time[0]));
          });
        }

        // debugger;

        // Create an activity. Set the dates depending on route etc
        const startDate = new Date(isActivity ? samples[0].time[0] : new Date());
        // @todo for routes add a seperate parser
        const endDate = isActivity ?
          new Date(trackOrRoute.trkseg[trackOrRoute.trkseg.length - 1].trkpt[trackOrRoute.trkseg[trackOrRoute.trkseg.length - 1].trkpt.length - 1].time[0]) :
          new Date(startDate.getTime() + samples.length * 1000);
        let activityType = isActivity ? ActivityTypes.unknown : ActivityTypes.route;
        if (trackOrRoute.type && ActivityTypes[<keyof typeof ActivityTypes>trackOrRoute.type]) {
          activityType = ActivityTypes[<keyof typeof ActivityTypes>trackOrRoute.type];
        } /*else if (trackOrRoute.type && trackOrRoute.type[0] && parsedGPX.creator.match(/StravaGPX/gi) !== null) {
          const stravaGpxTypeId = parseInt(trackOrRoute.type[0], 10);
          const entryFound: { id: number, type: string } | undefined = StravaGPXTypeMapping.map.find(entry => entry.id === stravaGpxTypeId);
          if (entryFound) {
            activityType = ActivityTypes[<keyof typeof ActivityTypes>entryFound.type];
          }
        }*/
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
      EventUtilities.generateStatsForAll(event);
      resolve(event);
    });
  }
}



