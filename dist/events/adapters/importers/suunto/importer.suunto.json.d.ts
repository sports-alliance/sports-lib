import { EventInterface } from '../../../event.interface';
export declare class EventImporterSuuntoJSON {
    static getFromJSONString(jsonString: string): EventInterface;
    private static hasFusedLocData(sample);
    private static setIntensityZones(activity, object);
    private static setIBIData(activity, ibiData);
    private static getPointFromSample(sample);
    private static getZones(zonesObj);
    private static getStats(object);
}
