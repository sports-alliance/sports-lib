"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Weather = /** @class */ (function () {
    function Weather(weatherItems) {
        this.weatherItems = weatherItems;
    }
    Weather.prototype.getMinTemperatureInCelsius = function () {
        return this.weatherItems.reduce(function (previous, weatherItem) {
            return previous.temperatureInCelsius < weatherItem.temperatureInCelsius ? previous : weatherItem;
        }).temperatureInCelsius;
    };
    Weather.prototype.getMaxTemperatureInCelsius = function () {
        return this.weatherItems.reduce(function (previous, weatherItem) {
            return previous.temperatureInCelsius > weatherItem.temperatureInCelsius ? previous : weatherItem;
        }).temperatureInCelsius;
    };
    Weather.prototype.getAverageTemperatureInCelsius = function () {
        var _this = this;
        return this.weatherItems.reduce(function (average, weatherItem) {
            return average + weatherItem.temperatureInCelsius / _this.weatherItems.length;
        }, 0);
    };
    Weather.prototype.toJSON = function () {
        return {
            weatherItems: this.weatherItems.reduce(function (weatherItemArray, weatherItem) {
                weatherItemArray.push(weatherItem.toJSON());
                return weatherItemArray;
            }, [])
        };
    };
    return Weather;
}());
exports.Weather = Weather;
