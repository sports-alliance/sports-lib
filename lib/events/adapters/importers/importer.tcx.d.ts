import { EventInterface } from '../../event.interface';
export declare class EventImporterTCX {
    static getFromXML(xml: Document, name?: string): EventInterface;
    private static getPoints(trackPointsElements);
    private static getCreator(creatorElement?);
    private static getLaps(lapElements);
}
