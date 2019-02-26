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
var data_vertical_speed_1 = require("./data.vertical-speed");
var DataVerticalSpeedMin = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMin, _super);
    function DataVerticalSpeedMin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMin.type = 'Minimum Vertical Speed';
    return DataVerticalSpeedMin;
}(data_vertical_speed_1.DataVerticalSpeed));
exports.DataVerticalSpeedMin = DataVerticalSpeedMin;
var DataVerticalSpeedMinFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinFeetPerSecond, _super);
    function DataVerticalSpeedMinFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinFeetPerSecond.type = 'Minimum vertical speed in feet per second';
    DataVerticalSpeedMinFeetPerSecond.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinFeetPerSecond;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerSecond));
exports.DataVerticalSpeedMinFeetPerSecond = DataVerticalSpeedMinFeetPerSecond;
var DataVerticalSpeedMinMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinMetersPerMinute, _super);
    function DataVerticalSpeedMinMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinMetersPerMinute.type = 'Minimum vertical speed in meters per minute';
    DataVerticalSpeedMinMetersPerMinute.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinMetersPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerMinute));
exports.DataVerticalSpeedMinMetersPerMinute = DataVerticalSpeedMinMetersPerMinute;
var DataVerticalSpeedMinFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinFeetPerMinute, _super);
    function DataVerticalSpeedMinFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinFeetPerMinute.type = 'Minimum vertical speed in feet per minute';
    DataVerticalSpeedMinFeetPerMinute.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinFeetPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerMinute));
exports.DataVerticalSpeedMinFeetPerMinute = DataVerticalSpeedMinFeetPerMinute;
var DataVerticalSpeedMinMetersPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinMetersPerHour, _super);
    function DataVerticalSpeedMinMetersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinMetersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinMetersPerHour.type = 'Minimum vertical speed in meters per hour';
    DataVerticalSpeedMinMetersPerHour.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinMetersPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerHour));
exports.DataVerticalSpeedMinMetersPerHour = DataVerticalSpeedMinMetersPerHour;
var DataVerticalSpeedMinFeetPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinFeetPerHour, _super);
    function DataVerticalSpeedMinFeetPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinFeetPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinFeetPerHour.type = 'Minimum vertical speed in feet per hour';
    DataVerticalSpeedMinFeetPerHour.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinFeetPerHour;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerHour));
exports.DataVerticalSpeedMinFeetPerHour = DataVerticalSpeedMinFeetPerHour;
var DataVerticalSpeedMinKilometerPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinKilometerPerHour, _super);
    function DataVerticalSpeedMinKilometerPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinKilometerPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinKilometerPerHour.type = 'Minimum vertical speed in kilometers per hour';
    DataVerticalSpeedMinKilometerPerHour.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinKilometerPerHour;
}(data_vertical_speed_1.DataVerticalSpeedKilometerPerHour));
exports.DataVerticalSpeedMinKilometerPerHour = DataVerticalSpeedMinKilometerPerHour;
var DataVerticalSpeedMinMilesPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMinMilesPerHour, _super);
    function DataVerticalSpeedMinMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMinMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMinMilesPerHour.type = 'Minimum vertical speed in miles per hour';
    DataVerticalSpeedMinMilesPerHour.displayType = DataVerticalSpeedMin.type;
    return DataVerticalSpeedMinMilesPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMilesPerHour));
exports.DataVerticalSpeedMinMilesPerHour = DataVerticalSpeedMinMilesPerHour;
