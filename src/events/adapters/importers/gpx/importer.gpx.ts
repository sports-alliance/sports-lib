import { Activity } from '../../../../activities/activity';
import { EventInterface } from '../../../event.interface';
import { Creator } from '../../../../creators/creator';
import { Event } from '../../../event';
import { ActivityTypes, ActivityTypesHelper, StravaGPXTypes } from '../../../../activities/activity.types';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { GPXSampleMapper } from './importer.gpx.mapper';
import { isNumberOrString } from '../../../utilities/helpers';
import { EventUtilities } from '../../../utilities/event.utilities';
import { GXParser } from './gx-parser';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { FileType } from '../../file-type.enum';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { EmptyEventLibError } from '../../../../errors/empty-event-sports-libs.error';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import {
  getStreamSelectionFromOptions,
  isStreamTypeAllowedForImport,
  pruneActivityStreamsBySelection
} from '../../../../streams/stream.selection';

export class EventImporterGPX {
  static getFromString(
    gpx: string,
    domParser?: any,
    options: ActivityParsingOptions = ActivityParsingOptions.DEFAULT,
    name = 'New Event'
  ): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      const streamSelection = getStreamSelectionFromOptions(options);
      // debugger
      const parsedGPX: any = new GXParser(gpx, domParser);
      const tracks = parsedGPX.trk || [];

      if (!tracks?.length) {
        if (parsedGPX.rte?.length) {
          reject(new ParsingEventLibError('No activities found in GPX; use importRoutesFromGPX for routes'));
          return;
        }
        reject(new EmptyEventLibError());
        return;
      }

      const activities: ActivityInterface[] = tracks.reduce((activities: ActivityInterface[], track: any) => {
        // Get the samples
        let samples: any[] = [];
        if (track.trkseg) {
          samples = track.trkseg.reduce((trkptArray: any[], trkseg: any) => {
            if (!trkseg.trkpt) {
              return trkptArray;
            }
            return trkptArray.concat(trkseg.trkpt);
          }, []);
        }

        // Filter samples having time data only for upcoming sort
        samples = samples.filter(sample => {
          return !!sample.time;
        });

        if (!samples.length) {
          return activities;
        }

        // Sort samples
        samples.sort((sampleA: any, sampleB: any) => {
          return +new Date(sampleA.time[0]) - +new Date(sampleB.time[0]);
        });

        const startDate = new Date(samples[0].time[0]);
        const endDate = new Date(samples[samples.length - 1].time[0]);

        const rawActivityType = Array.isArray(track.type) ? track.type[0] : track.type;
        let activityType = ActivityTypesHelper.resolveActivityType(rawActivityType) || ActivityTypes.unknown;
        if (rawActivityType && parsedGPX.creator && parsedGPX.creator.match(/StravaGPX/gi) !== null) {
          const stravaGpxTypeId = parseInt(rawActivityType, 10);
          const typeFound: ActivityTypes | undefined = StravaGPXTypes.map.get(stravaGpxTypeId);
          if (typeFound) {
            activityType = typeFound;
          }
        }
        const activityName = track.name?.[0] || '';
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
        GPXSampleMapper.filter(sampleMapping =>
          isStreamTypeAllowedForImport(sampleMapping.dataType, streamSelection)
        ).forEach(sampleMapping => {
          const subjectSamples = <any[]>(
            samples.filter((sample: any) => isNumberOrString(sampleMapping.getSampleValue(sample, samplesInfo)))
          );
          if (subjectSamples.length) {
            activity.addStream(activity.createStream(sampleMapping.dataType));
            subjectSamples.forEach(subjectSample => {
              activity.addDataToStream(
                sampleMapping.dataType,
                new Date(subjectSample.time[0]),
                <number>sampleMapping.getSampleValue(subjectSample, samplesInfo)
              );
            });
          }
        });

        // Compute moving time, timer time and elapsed time
        const elapsedTime = (activity.endDate.getTime() - activity.startDate.getTime()) / 1000;
        const timerTime = elapsedTime;

        // Apply stats
        activity.addStat(new DataElapsedTime(elapsedTime));
        activity.addStat(new DataDuration(timerTime));
        activity.addStat(new DataTimerTime(timerTime));

        activities.push(activity);

        return activities;
      }, []);

      if (!activities.length) {
        reject(new ParsingEventLibError('No activities found in GPX; use importRoutesFromGPX for routes'));
        return;
      }

      const event = new Event(name, activities[0].startDate, activities[activities.length - 1].endDate, FileType.GPX);
      activities.forEach(activity => {
        event.addActivity(activity);
      });

      // generate global stats
      EventUtilities.generateStatsForAll(event);
      event.getActivities().forEach(activity => {
        pruneActivityStreamsBySelection(activity, streamSelection);
      });
      resolve(event);
    });
  }
}
