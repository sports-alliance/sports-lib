"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../event");
var activity_1 = require("../../../activities/activity");
var lap_1 = require("../../../laps/lap");
var point_1 = require("../../../points/point");
var creator_1 = require("../../../creators/creator");
var app_weather_item_1 = require("../../../weather/app.weather.item");
var app_weather_1 = require("../../../weather/app.weather");
var geo_location_info_1 = require("../../../geo-location-info/geo-location-info");
var intensity_zone_1 = require("../../../intensity-zones/intensity-zone");
var data_ibi_1 = require("../../../data/ibi/data.ibi");
var data_store_1 = require("../../../data/data.store");
var EventImporterJSON = /** @class */ (function () {
    function EventImporterJSON() {
    }
    EventImporterJSON.getFromJSONString = function (jsonString) {
        var eventJSONObject = JSON.parse(jsonString);
        var event = new event_1.Event(eventJSONObject.name);
        event.setID(eventJSONObject.id);
        eventJSONObject.stats.forEach(function (stat) {
            event.addStat(data_store_1.DynamicDataLoader.getDataInstance(stat.className, stat.value));
        });
        var _loop_1 = function (activityObject) {
            var creator = new creator_1.Creator(activityObject.creator.name);
            creator.hwInfo = activityObject.creator.hwInfo;
            creator.swInfo = activityObject.creator.swInfo;
            creator.serialNumber = activityObject.creator.serialNumber;
            var activity = new activity_1.Activity(new Date(activityObject.startDate), new Date(activityObject.endDate), activityObject.type, creator);
            activity.setID(activityObject.id);
            activity.ibiData = new data_ibi_1.IBIData(activityObject.ibiData);
            if (activityObject.weather) {
                activity.weather = this_1.getWeather(activityObject);
            }
            if (activityObject.geoLocationInfo) {
                activity.geoLocationInfo = this_1.getGeoLocationInfo(activityObject);
            }
            activityObject.stats.forEach(function (stat) {
                activity.addStat(data_store_1.DynamicDataLoader.getDataInstance(stat.className, stat.value));
            });
            var _loop_2 = function (lapObject) {
                var lap = new lap_1.Lap(new Date(lapObject.startDate), new Date(lapObject.endDate), lapObject.type);
                lap.setID(lapObject.id);
                lapObject.stats.forEach(function (stat) {
                    lap.addStat(data_store_1.DynamicDataLoader.getDataInstance(stat.className, stat.value));
                });
                activity.addLap(lap);
            };
            for (var _i = 0, _a = activityObject.laps; _i < _a.length; _i++) {
                var lapObject = _a[_i];
                _loop_2(lapObject);
            }
            event.addActivity(activity);
            if (activityObject.intensityZones) {
                for (var key in activityObject.intensityZones) {
                    var zones = new intensity_zone_1.IntensityZones();
                    zones.zone1Duration = activityObject.intensityZones[key].zone1Duration;
                    zones.zone2Duration = activityObject.intensityZones[key].zone2Duration;
                    zones.zone2LowerLimit = activityObject.intensityZones[key].zone2LowerLimit;
                    zones.zone3Duration = activityObject.intensityZones[key].zone3Duration;
                    zones.zone3LowerLimit = activityObject.intensityZones[key].zone3LowerLimit;
                    zones.zone4Duration = activityObject.intensityZones[key].zone4Duration;
                    zones.zone4LowerLimit = activityObject.intensityZones[key].zone4LowerLimit;
                    zones.zone5Duration = activityObject.intensityZones[key].zone5Duration;
                    zones.zone5LowerLimit = activityObject.intensityZones[key].zone5LowerLimit;
                    activity.intensityZones.set(key, zones);
                }
            }
            for (var _b = 0, _c = activityObject.points; _b < _c.length; _b++) {
                var pointObject = _c[_b];
                var point = new point_1.Point(new Date(pointObject.date));
                activity.addPoint(point);
                for (var _d = 0, _e = pointObject.data; _d < _e.length; _d++) {
                    var dataObject = _e[_d];
                    point.addData(data_store_1.DynamicDataLoader.getDataInstance(dataObject.className, dataObject.value));
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = eventJSONObject.activities; _i < _a.length; _i++) {
            var activityObject = _a[_i];
            _loop_1(activityObject);
        }
        return event;
    };
    EventImporterJSON.getGeoLocationInfo = function (object) {
        var geoLocationInfo = new geo_location_info_1.GeoLocationInfo(object.geoLocationInfo.latitude, object.geoLocationInfo.longitude);
        geoLocationInfo.city = object.geoLocationInfo.city;
        geoLocationInfo.country = object.geoLocationInfo.country;
        geoLocationInfo.province = object.geoLocationInfo.province;
        return geoLocationInfo;
    };
    EventImporterJSON.getWeather = function (object) {
        var weatherItems = [];
        for (var _i = 0, _a = object.weather.weatherItems; _i < _a.length; _i++) {
            var weatherItemObject = _a[_i];
            weatherItems.push(new app_weather_item_1.WeatherItem(new Date(weatherItemObject.date), weatherItemObject.conditions, weatherItemObject.temperatureInCelsius));
        }
        return new app_weather_1.Weather(weatherItems);
    };
    return EventImporterJSON;
}());
exports.EventImporterJSON = EventImporterJSON;
