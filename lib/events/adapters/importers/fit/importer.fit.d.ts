import { EventInterface } from '../../../event.interface';
export declare class EventImporterFIT {
    static getFromArrayBuffer(arrayBuffer: ArrayBuffer, name?: string): Promise<EventInterface>;
    private static getPointFromSessionLapObjectRecord(sessionLapObjectRecord);
    private static getLapFromSessionLapObject(sessionLapObject);
    private static getActivityFromSessionObject(sessionObject, fitDataObject);
    private static getActivityTypeFromSessionObject(session);
    private static getStatsFromObject(object);
    private static getCreatorFromFitDataObject(fitDataObject);
}
