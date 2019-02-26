import { EventInterface } from './events/event.interface';
import { EventJSONInterface } from './events/event.json.interface';
export declare class QuantifiedSelfLib {
    /**
     * Parses and returns an event using GPX format
     * @param gpxString
     */
    static importFromGPX(gpxString: string): Promise<EventInterface>;
    /**
     * Parses and returns an event using TCX format
     * @param xmlDocument
     */
    static importFromTCX(xmlDocument: XMLDocument): Promise<EventInterface>;
    /**
     * Parses and returns an event using FIT format
     * @param arrayBuffer
     */
    static importFromFit(arrayBuffer: ArrayBuffer): Promise<EventInterface>;
    /**
     * Parses and returns an event using Suunto format
     * @param jsonString
     */
    static importFromSuunto(jsonString: string): Promise<EventInterface>;
    /**
     * Parses and returns an event using native format (QuantifiedSelfLib exported format)
     * @param json EventJSONInterface
     */
    static importFromJSON(json: EventJSONInterface): EventInterface;
}
