"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var data_ibi_1 = require("../data/ibi/data.ibi");
var point_1 = require("../points/point");
var creator_1 = require("../creators/creator");
var duration_class_abstract_1 = require("../duration/duration.class.abstract");
var Activity = /** @class */ (function (_super) {
    __extends(Activity, _super);
    function Activity(startDate, endDate) {
        var _this = _super.call(this, startDate, endDate) || this;
        _this.creator = new creator_1.Creator();
        _this.ibiData = new data_ibi_1.IBIData();
        _this.intensityZones = new Map();
        _this.points = new Map();
        _this.laps = [];
        return _this;
    }
    Activity.prototype.addPoint = function (point, overrideAllDataOnCollision) {
        if (overrideAllDataOnCollision === void 0) { overrideAllDataOnCollision = false; }
        // @todo should do dateguard check
        var existingPoint = this.points.get(point.getDate().getTime());
        // Keep last added value
        if (existingPoint && !overrideAllDataOnCollision) {
            existingPoint.getData().forEach(function (data, key, map) {
                if (!point.getDataByType(key)) {
                    point.addData(data);
                }
            });
        }
        this.points.set(point.getDate().getTime(), point);
    };
    Activity.prototype.removePoint = function (point) {
        this.points.delete(point.getDate().getTime());
    };
    Activity.prototype.getPoints = function (startDate, endDate) {
        var points = new Map();
        var index = -1;
        this.points.forEach(function (point, date, map) {
            index++;
            var canBeAdded = true;
            if (startDate && startDate > point.getDate()) {
                canBeAdded = false;
            }
            if (endDate && endDate < point.getDate()) {
                canBeAdded = false;
            }
            if (canBeAdded) {
                // Set the current loop point on the map
                points.set(point.getDate().getTime(), point);
            }
        });
        return Array.from(points.values());
    };
    Activity.prototype.getPointsInterpolated = function (startDate, endDate, step) {
        return Array.from(this.getPoints(startDate, endDate).reduce(function (pointsMap, point) {
            // copy the point and set it's date to 0 ms so 1s interpolation
            var interpolatedDateTimePoint = new point_1.Point(new Date(new Date(point.getDate().getTime()).setMilliseconds(0)));
            point.getData().forEach(function (data, key, map) {
                interpolatedDateTimePoint.addData(data);
            });
            // Check if we already have an existing point in our local map for that time
            var existingPoint = pointsMap.get(interpolatedDateTimePoint.getDate().getTime());
            if (existingPoint) {
                // If it exists go over it's data and add them to the current iteration point
                existingPoint.getData().forEach(function (data, dataType) {
                    if (!interpolatedDateTimePoint.getDataByType(dataType)) {
                        interpolatedDateTimePoint.addData(data);
                    }
                });
            }
            pointsMap.set(interpolatedDateTimePoint.getDate().getTime(), interpolatedDateTimePoint);
            return pointsMap;
        }, new Map()).values());
    };
    Activity.prototype.getStartPoint = function () {
        return this.getPoints()[0];
    };
    Activity.prototype.getEndPoint = function () {
        return this.getPoints()[this.getPoints().length - 1];
    };
    Activity.prototype.addLap = function (lap) {
        this.laps.push(lap);
    };
    Activity.prototype.getLaps = function (activity) {
        return this.laps;
    };
    Activity.prototype.sortPointsByDate = function () {
        var _this = this;
        var pointsArray = this.getPoints().sort(function (pointA, pointB) {
            return pointA.getDate().getTime() - pointB.getDate().getTime();
        });
        this.points.clear();
        pointsArray.forEach(function (point) {
            _this.addPoint(point);
        });
    };
    Activity.prototype.toJSON = function () {
        var intensityZones = {};
        this.intensityZones.forEach(function (value, key, map) {
            intensityZones[key] = value.toJSON();
        });
        var stats = [];
        this.stats.forEach(function (value, key) {
            stats.push(value.toJSON());
        });
        return {
            id: this.getID(),
            startDate: this.startDate,
            endDate: this.endDate,
            type: this.type,
            creator: this.creator.toJSON(),
            points: Array.from(this.points.values()).reduce(function (jsonPointsArray, point) {
                jsonPointsArray.push(point.toJSON());
                return jsonPointsArray;
            }, []),
            ibiData: this.ibiData.toJSON(),
            intensityZones: intensityZones,
            stats: stats,
            geoLocationInfo: this.geoLocationInfo ? this.geoLocationInfo.toJSON() : null,
            weather: this.weather ? this.weather.toJSON() : null,
            laps: this.getLaps().reduce(function (jsonLapsArray, lap) {
                jsonLapsArray.push(lap.toJSON());
                return jsonLapsArray;
            }, []),
        };
    };
    return Activity;
}(duration_class_abstract_1.DurationClassAbstract));
exports.Activity = Activity;
