"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_latitude_degrees_1 = require("../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../data/data.longitude-degrees");
var Point = /** @class */ (function () {
    function Point(date) {
        this.data = new Map();
        this.date = date;
    }
    Point.prototype.getDate = function () {
        return this.date;
    };
    Point.prototype.addData = function (data) {
        this.data.set(data.getType(), data);
    };
    Point.prototype.removeDataByType = function (dataType) {
        this.data.delete(dataType);
    };
    Point.prototype.getData = function () {
        return this.data;
    };
    Point.prototype.getDataByType = function (dataType) {
        return this.data.get(dataType);
    };
    Point.prototype.getPosition = function () {
        var dataLatitudeDegrees = this.getData().get(data_latitude_degrees_1.DataLatitudeDegrees.type);
        var dataLongitudeDegrees = this.getData().get(data_longitude_degrees_1.DataLongitudeDegrees.type);
        if (!dataLongitudeDegrees || !dataLatitudeDegrees) {
            return;
        }
        return {
            latitudeDegrees: Number(dataLatitudeDegrees.getValue()),
            longitudeDegrees: Number(dataLongitudeDegrees.getValue()),
        };
    };
    Point.prototype.toJSON = function () {
        var dataArray = [];
        this.getData().forEach(function (value, key, map) {
            dataArray = dataArray.concat(value);
        });
        return {
            date: this.getDate().toJSON(),
            data: dataArray.reduce(function (jsonDataArray, data) {
                jsonDataArray.push(data.toJSON());
                return jsonDataArray;
            }, []),
        };
    };
    return Point;
}());
exports.Point = Point;
