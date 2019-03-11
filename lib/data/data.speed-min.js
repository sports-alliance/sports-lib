"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var data_speed_1 = require("./data.speed");
var DataSpeedMin = /** @class */ (function (_super) {
    __extends(DataSpeedMin, _super);
    function DataSpeedMin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMin.type = 'Minimum Speed';
    return DataSpeedMin;
}(data_speed_1.DataSpeed));
exports.DataSpeedMin = DataSpeedMin;
var DataSpeedMinKilometersPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedMinKilometersPerHour, _super);
    function DataSpeedMinKilometersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMinKilometersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMinKilometersPerHour.type = 'Minimum speed in kilometers per hour';
    DataSpeedMinKilometersPerHour.displayType = DataSpeedMin.type;
    return DataSpeedMinKilometersPerHour;
}(data_speed_1.DataSpeedKilometersPerHour));
exports.DataSpeedMinKilometersPerHour = DataSpeedMinKilometersPerHour;
var DataSpeedMinMilesPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedMinMilesPerHour, _super);
    function DataSpeedMinMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMinMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMinMilesPerHour.type = 'Minimum speed in miles per hour';
    DataSpeedMinMilesPerHour.displayType = DataSpeedMin.type;
    return DataSpeedMinMilesPerHour;
}(data_speed_1.DataSpeedMilesPerHour));
exports.DataSpeedMinMilesPerHour = DataSpeedMinMilesPerHour;
var DataSpeedMinFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataSpeedMinFeetPerSecond, _super);
    function DataSpeedMinFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMinFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMinFeetPerSecond.type = 'Minimum speed in feet per second';
    DataSpeedMinFeetPerSecond.displayType = DataSpeedMin.type;
    return DataSpeedMinFeetPerSecond;
}(data_speed_1.DataSpeedFeetPerSecond));
exports.DataSpeedMinFeetPerSecond = DataSpeedMinFeetPerSecond;
var DataSpeedMinMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedMinMetersPerMinute, _super);
    function DataSpeedMinMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMinMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMinMetersPerMinute.type = 'Minimum speed in meters per minute';
    DataSpeedMinMetersPerMinute.displayType = DataSpeedMin.type;
    return DataSpeedMinMetersPerMinute;
}(data_speed_1.DataSpeedMetersPerMinute));
exports.DataSpeedMinMetersPerMinute = DataSpeedMinMetersPerMinute;
var DataSpeedMinFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedMinFeetPerMinute, _super);
    function DataSpeedMinFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMinFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMinFeetPerMinute.type = 'Minimum speed in feet per minute';
    DataSpeedMinFeetPerMinute.displayType = DataSpeedMin.type;
    return DataSpeedMinFeetPerMinute;
}(data_speed_1.DataSpeedFeetPerMinute));
exports.DataSpeedMinFeetPerMinute = DataSpeedMinFeetPerMinute;
