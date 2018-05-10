import {EventInterface} from '../../event.interface';
export interface EventExporterInterface  {
  readonly fileType: string;
  readonly fileExtension: string;

  getfileExtension(): string;

  getFileType(): string;

  getAsString(event: EventInterface): string;

}
