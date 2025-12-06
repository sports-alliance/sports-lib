import { EventInterface } from '../../event.interface';
import { EventExporter } from './exporter.interface';
import { EventJSONInterface } from '../../event.json.interface';

export class EventExporterJSON implements EventExporter {
  fileType = 'application/json';
  fileExtension = 'json';

  static export(event: EventInterface): EventJSONInterface {
    return new EventExporterJSON().export(event);
  }

  static getAsString(event: EventInterface): Promise<string> {
    return new EventExporterJSON().getAsString(event);
  }

  export(event: EventInterface): EventJSONInterface {
    return event.toJSON();
  }

  getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve(JSON.stringify(this.export));
    });
  }
}
