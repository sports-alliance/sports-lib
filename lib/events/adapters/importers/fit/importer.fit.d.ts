import { EventInterface } from '../../../event.interface';
export declare class EventImporterFIT {
    static getFromArrayBuffer(arrayBuffer: ArrayBuffer, name?: string): Promise<EventInterface>;
    private static getDeviceInfos;
    private static getLapFromSessionLapObject;
    private static getActivityFromSessionObject;
    private static getActivityTypeFromSessionObject;
    private static getStatsFromObject;
    private static getCreatorFromFitDataObject;
}
