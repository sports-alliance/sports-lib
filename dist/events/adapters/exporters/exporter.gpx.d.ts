import { EventExporterInterface } from './exporter.interface';
import { EventInterface } from '../../event.interface';
export declare class EventExporterGPX implements EventExporterInterface {
    fileType: string;
    fileExtension: string;
    getAsString(event: EventInterface): string;
    getfileExtension(): string;
    getFileType(): string;
}
