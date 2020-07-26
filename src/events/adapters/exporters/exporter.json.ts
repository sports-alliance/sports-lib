import { EventInterface } from '../../event.interface';
import { ActivityJSONInterface } from '../../../activities/activity.json.interface';
import { StreamJSONInterface } from '../../../streams/stream';
import { EventExporter } from './exporter.interface';

export class EventExporterJSON implements EventExporter {
  fileType = 'application/json';
  fileExtension = 'json';

  getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      const jsonEvent = <any>event.toJSON();
      jsonEvent.activities = event.getActivities().reduce((activities: ActivityJSONInterface[], activity) => {
        const jsonActivity = <any>activity.toJSON();
        jsonActivity.streams = activity.getAllStreams().reduce((streams: StreamJSONInterface[], stream) => {
          streams.push(stream.toJSON());
          return streams;
        }, []);
        activities.push(jsonActivity);
        return activities;
      }, []);
      resolve(JSON.stringify(jsonEvent));
    })
  }
}
