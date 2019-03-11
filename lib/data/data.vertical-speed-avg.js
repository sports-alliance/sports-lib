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
var data_vertical_speed_1 = require("./data.vertical-speed");
var DataVerticalSpeedAvg = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvg, _super);
    function DataVerticalSpeedAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvg.type = 'Average Vertical Speed';
    return DataVerticalSpeedAvg;
}(data_vertical_speed_1.DataVerticalSpeed));
exports.DataVerticalSpeedAvg = DataVerticalSpeedAvg;
var DataVerticalSpeedAvgFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgFeetPerSecond, _super);
    function DataVerticalSpeedAvgFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgFeetPerSecond.type = 'Average vertical speed in feet per second';
    DataVerticalSpeedAvgFeetPerSecond.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgFeetPerSecond;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerSecond));
exports.DataVerticalSpeedAvgFeetPerSecond = DataVerticalSpeedAvgFeetPerSecond;
var DataVerticalSpeedAvgMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgMetersPerMinute, _super);
    function DataVerticalSpeedAvgMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgMetersPerMinute.type = 'Average vertical speed in meters per minute';
    DataVerticalSpeedAvgMetersPerMinute.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgMetersPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerMinute));
exports.DataVerticalSpeedAvgMetersPerMinute = DataVerticalSpeedAvgMetersPerMinute;
var DataVerticalSpeedAvgFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgFeetPerMinute, _super);
    function DataVerticalSpeedAvgFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgFeetPerMinute.type = 'Average vertical speed in feet per minute';
    DataVerticalSpeedAvgFeetPerMinute.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgFeetPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerMinute));
exports.DataVerticalSpeedAvgFeetPerMinute = DataVerticalSpeedAvgFeetPerMinute;
var DataVerticalSpeedAvgMetersPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgMetersPerHour, _super);
    function DataVerticalSpeedAvgMetersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgMetersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgMetersPerHour.type = 'Average vertical speed in meters per hour';
    DataVerticalSpeedAvgMetersPerHour.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgMetersPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerHour));
exports.DataVerticalSpeedAvgMetersPerHour = DataVerticalSpeedAvgMetersPerHour;
var DataVerticalSpeedAvgFeetPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgFeetPerHour, _super);
    function DataVerticalSpeedAvgFeetPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgFeetPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgFeetPerHour.type = 'Average vertical speed in feet per hour';
    DataVerticalSpeedAvgFeetPerHour.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgFeetPerHour;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerHour));
exports.DataVerticalSpeedAvgFeetPerHour = DataVerticalSpeedAvgFeetPerHour;
var DataVerticalSpeedAvgKilometerPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgKilometerPerHour, _super);
    function DataVerticalSpeedAvgKilometerPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgKilometerPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgKilometerPerHour.type = 'Average vertical speed in kilometers per hour';
    DataVerticalSpeedAvgKilometerPerHour.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgKilometerPerHour;
}(data_vertical_speed_1.DataVerticalSpeedKilometerPerHour));
exports.DataVerticalSpeedAvgKilometerPerHour = DataVerticalSpeedAvgKilometerPerHour;
var DataVerticalSpeedAvgMilesPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedAvgMilesPerHour, _super);
    function DataVerticalSpeedAvgMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedAvgMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedAvgMilesPerHour.type = 'Average vertical speed in miles per hour';
    DataVerticalSpeedAvgMilesPerHour.displayType = DataVerticalSpeedAvg.type;
    return DataVerticalSpeedAvgMilesPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMilesPerHour));
exports.DataVerticalSpeedAvgMilesPerHour = DataVerticalSpeedAvgMilesPerHour;
