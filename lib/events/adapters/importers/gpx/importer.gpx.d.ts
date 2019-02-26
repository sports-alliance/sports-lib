import { EventInterface } from '../../../event.interface';
export declare class EventImporterGPX {
    static getFromString(gpx: string, name?: string): Promise<EventInterface>;
}
