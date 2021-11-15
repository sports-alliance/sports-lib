import { Activity } from '../../../../activities/activity';
import { EventInterface } from '../../../event.interface';
import { Creator } from '../../../../creators/creator';
import { Event } from '../../../event';
import { ActivityTypes, StravaGPXTypes } from '../../../../activities/activity.types';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { GPXSampleMapper } from './importer.gpx.mapper';
import { isNumberOrString } from '../../../utilities/helpers';
import { EventUtilities } from '../../../utilities/event.utilities';
import { GXParser } from './gx-parser';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { FileType } from '../../file-type.enum';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { EmptyEventLibError } from '../../../../errors/empty-event-sports-libs.error';

export class EventImporterGPX {
  static getFromString(
    gpx: string,
    domParser?: any,
    options: ActivityParsingOptions = ActivityParsingOptions.DEFAULT,
    name = 'New Event'
  ): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // debugger
      const parsedGPX: any = new GXParser(gpx, domParser);
      const track = parsedGPX.trk || parsedGPX.rte;

      if (!track?.length) {
        reject(new EmptyEventLibError());
      }

      const activities: ActivityInterface[] = track.reduce((activities: ActivityInterface[], trackOrRoute: any) => {
        // Get the samples
        let samples: any[] = [];
        let isActivity = false;
        if (trackOrRoute.trkseg) {
          samples = trackOrRoute.trkseg.reduce((trkptArray: any[], trkseg: any) => {
            if (!trkseg.trkpt) {
              return trkptArray;
            }
            return trkptArray.concat(trkseg.trkpt);
          }, []);
          // Determine if it's a route. The samples will most probably be missing the time
          isActivity = !!samples[0].time;
        } else if (trackOrRoute.rtept) {
          samples = trackOrRoute.rtept;
        }

        // Sort the points if its only an activity
        if (isActivity) {
          // Filter samples having time data only for upcoming sort
          samples = samples.filter(sample => {
            return !!sample.time;
          });

          // Sort samples !
          samples.sort((sampleA: any, sampleB: any) => {
            return +new Date(sampleA.time[0]) - +new Date(sampleB.time[0]);
          });
        }

        // Create an activity. Set the dates depending on route etc
        const startDate = new Date(isActivity ? samples[0].time[0] : new Date());
        // @todo for routes add a separate parser
        const endDate = isActivity
          ? new Date(samples[samples.length - 1].time[0])
          : new Date(startDate.getTime() + samples.length * 1000);

        let activityType = isActivity ? ActivityTypes.unknown : ActivityTypes.route;
        if (trackOrRoute.type && ActivityTypes[<keyof typeof ActivityTypes>trackOrRoute.type]) {
          activityType = ActivityTypes[<keyof typeof ActivityTypes>trackOrRoute.type];
        } else if (trackOrRoute.type && trackOrRoute.type[0] && parsedGPX.creator.match(/StravaGPX/gi) !== null) {
          const stravaGpxTypeId = parseInt(trackOrRoute.type[0], 10);
          const typeFound: ActivityTypes | undefined = StravaGPXTypes.map.get(stravaGpxTypeId);
          if (typeFound) {
            activityType = typeFound;
          }
        }
        const activityName = trackOrRoute.name?.[0] || '';
        const activity = new Activity(
          startDate,
          endDate,
          activityType,
          new Creator(parsedGPX.creator, undefined, parsedGPX.version),
          options,
          activityName
        );

        // Setup sample info which could be use when getting sample values
        const hasPowerMeter =
          samples.findIndex(sample => sample.extensions?.find((ext: any) => ext.power?.length)) !== -1;
        const samplesInfo = { hasPowerMeter: hasPowerMeter };

        // Match
        GPXSampleMapper.forEach(sampleMapping => {
          const subjectSamples = <any[]>(
            samples.filter((sample: any) => isNumberOrString(sampleMapping.getSampleValue(sample, samplesInfo)))
          );
          if (subjectSamples.length) {
            activity.addStream(activity.createStream(sampleMapping.dataType));
            subjectSamples.forEach((subjectSample, index) => {
              activity.addDataToStream(
                sampleMapping.dataType,
                isActivity ? new Date(subjectSample.time[0]) : new Date(activity.startDate.getTime() + index * 1000),
                <number>sampleMapping.getSampleValue(subjectSample, samplesInfo)
              );
            });
          }
        });

        // Compute moving time, timer time and elapsed time
        const elapsedTime = (activity.endDate.getTime() - activity.startDate.getTime()) / 1000;
        const timerTime = elapsedTime;

        // Apply stats
        activity.addStat(new DataDuration(elapsedTime));
        activity.addStat(new DataTimerTime(timerTime));

        activities.push(activity);

        return activities;
      }, []);

      const event = new Event(name, activities[0].startDate, activities[activities.length - 1].endDate, FileType.GPX);
      activities.forEach(activity => {
        event.addActivity(activity);
      });

      // generate global stats
      EventUtilities.generateStatsForAll(event);
      resolve(event);
    });
  }
}
