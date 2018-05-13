import { EventInterface } from '../../../event.interface';
export declare class EventImporterJSON {
    static getFromJSONString(jsonString: string): EventInterface;
    private static getGeoLocationInfo(object);
    private static getWeather(object);
}
