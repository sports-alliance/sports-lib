import { WeatherItem } from './app.weather.item';
import { SerializableClassInterface } from '../serializable/serializable.class.interface';
export declare class Weather implements SerializableClassInterface {
    weatherItems: WeatherItem[];
    constructor(weatherItems: WeatherItem[]);
    getMinTemperatureInCelsius(): number;
    getMaxTemperatureInCelsius(): number;
    getAverageTemperatureInCelsius(): number;
    toJSON(): any;
}
