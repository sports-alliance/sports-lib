import { EventExporterInterface } from './exporter.interface';
import { EventInterface } from '../../event.interface';
export declare class EventExporterTCX implements EventExporterInterface {
    private xmlSerializer;
    readonly fileType: string;
    readonly fileExtension: string;
    getAsString(event: EventInterface): string;
    getfileExtension(): string;
    getFileType(): string;
}
