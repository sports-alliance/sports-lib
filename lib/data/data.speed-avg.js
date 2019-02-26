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
var data_speed_1 = require("./data.speed");
var DataSpeedAvg = /** @class */ (function (_super) {
    __extends(DataSpeedAvg, _super);
    function DataSpeedAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvg.type = 'Average Speed';
    return DataSpeedAvg;
}(data_speed_1.DataSpeed));
exports.DataSpeedAvg = DataSpeedAvg;
var DataSpeedAvgKilometersPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedAvgKilometersPerHour, _super);
    function DataSpeedAvgKilometersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvgKilometersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedAvgKilometersPerHour.type = 'Average speed in kilometers per hour';
    DataSpeedAvgKilometersPerHour.displayType = DataSpeedAvg.type;
    return DataSpeedAvgKilometersPerHour;
}(data_speed_1.DataSpeedKilometersPerHour));
exports.DataSpeedAvgKilometersPerHour = DataSpeedAvgKilometersPerHour;
var DataSpeedAvgMilesPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedAvgMilesPerHour, _super);
    function DataSpeedAvgMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvgMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedAvgMilesPerHour.type = 'Average speed in miles per hour';
    DataSpeedAvgMilesPerHour.displayType = DataSpeedAvg.type;
    return DataSpeedAvgMilesPerHour;
}(data_speed_1.DataSpeedMilesPerHour));
exports.DataSpeedAvgMilesPerHour = DataSpeedAvgMilesPerHour;
var DataSpeedAvgFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataSpeedAvgFeetPerSecond, _super);
    function DataSpeedAvgFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvgFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedAvgFeetPerSecond.type = 'Average speed in feet per second';
    DataSpeedAvgFeetPerSecond.displayType = DataSpeedAvg.type;
    return DataSpeedAvgFeetPerSecond;
}(data_speed_1.DataSpeedFeetPerSecond));
exports.DataSpeedAvgFeetPerSecond = DataSpeedAvgFeetPerSecond;
var DataSpeedAvgMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedAvgMetersPerMinute, _super);
    function DataSpeedAvgMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvgMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedAvgMetersPerMinute.type = 'Average speed in meters per minute';
    DataSpeedAvgMetersPerMinute.displayType = DataSpeedAvg.type;
    return DataSpeedAvgMetersPerMinute;
}(data_speed_1.DataSpeedMetersPerMinute));
exports.DataSpeedAvgMetersPerMinute = DataSpeedAvgMetersPerMinute;
var DataSpeedAvgFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedAvgFeetPerMinute, _super);
    function DataSpeedAvgFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvgFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedAvgFeetPerMinute.type = 'Average speed in feet per minute';
    DataSpeedAvgFeetPerMinute.displayType = DataSpeedAvg.type;
    return DataSpeedAvgFeetPerMinute;
}(data_speed_1.DataSpeedFeetPerMinute));
exports.DataSpeedAvgFeetPerMinute = DataSpeedAvgFeetPerMinute;
