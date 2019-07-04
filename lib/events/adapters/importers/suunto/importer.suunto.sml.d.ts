import { EventInterface } from '../../../event.interface';
export declare class EventImporterSuuntoSML {
    static getFromXML(contents: string, name?: string): Promise<EventInterface>;
    static getFromJSONString(jsonString: string): Promise<EventInterface>;
}
