"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WeatherItem = /** @class */ (function () {
    function WeatherItem(date, conditions, temperatureInCelsius) {
        this.date = date;
        this.conditions = conditions;
        this.temperatureInCelsius = temperatureInCelsius;
    }
    WeatherItem.prototype.toJSON = function () {
        return {
            date: this.date.toISOString(),
            conditions: this.conditions,
            temperatureInCelsius: this.temperatureInCelsius
        };
    };
    return WeatherItem;
}());
exports.WeatherItem = WeatherItem;
