import { EventInterface } from '../../event.interface';

export interface EventExporter {
  fileType: string
  fileExtension: string;

  getAsString(event: EventInterface): Promise<string>;
}
