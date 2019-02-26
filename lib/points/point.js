"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var data_latitude_degrees_1 = require("../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../data/data.longitude-degrees");
var id_abstract_class_1 = require("../id/id.abstract.class");
var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point(date) {
        var _this = _super.call(this) || this;
        _this.data = new Map();
        _this.date = date;
        return _this;
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
}(id_abstract_class_1.IDClass));
exports.Point = Point;
