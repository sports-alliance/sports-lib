import {EventInterface} from '../../event.interface';

export class EventExporterJSON {
  static fileType = 'application/json';
  static fileExtension = 'json';
  static getAsString(event: EventInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve (JSON.stringify(event));
    })
  }
}
