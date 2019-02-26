import { SerializableClassInterface } from '../serializable/serializable.class.interface';
export declare class WeatherItem implements SerializableClassInterface {
    date: Date;
    conditions: string;
    temperatureInCelsius: number;
    constructor(date: Date, conditions: string, temperatureInCelsius: number);
    toJSON(): any;
}
