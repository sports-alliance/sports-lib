import { EventInterface } from '../../../event.interface';
export declare class EventImporterGPX {
    static getFromString(gpx: string, domParser?: Function, name?: string): Promise<EventInterface>;
}
