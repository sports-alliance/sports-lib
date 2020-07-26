import { EventInterface } from '../../event.interface';
import { EventExporter } from './exporter.interface';

export class EventExporterGPX implements EventExporter {
  fileType = 'application/json';
  fileExtension = 'gpx';

  getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      debugger
      if (event.getActivities().length > 1) {
        reject('Multi activity events are not supported');
      }
      resolve();
    })
  }
}
