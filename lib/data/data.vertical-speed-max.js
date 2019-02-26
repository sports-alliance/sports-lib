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
var DataVerticalSpeedMax = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMax, _super);
    function DataVerticalSpeedMax() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMax.type = 'Maximum Vertical Speed';
    return DataVerticalSpeedMax;
}(data_vertical_speed_1.DataVerticalSpeed));
exports.DataVerticalSpeedMax = DataVerticalSpeedMax;
var DataVerticalSpeedMaxFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxFeetPerSecond, _super);
    function DataVerticalSpeedMaxFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxFeetPerSecond.type = 'Maximum vertical speed in feet per second';
    DataVerticalSpeedMaxFeetPerSecond.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxFeetPerSecond;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerSecond));
exports.DataVerticalSpeedMaxFeetPerSecond = DataVerticalSpeedMaxFeetPerSecond;
var DataVerticalSpeedMaxMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxMetersPerMinute, _super);
    function DataVerticalSpeedMaxMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxMetersPerMinute.type = 'Maximum vertical speed in meters per minute';
    DataVerticalSpeedMaxMetersPerMinute.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxMetersPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerMinute));
exports.DataVerticalSpeedMaxMetersPerMinute = DataVerticalSpeedMaxMetersPerMinute;
var DataVerticalSpeedMaxFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxFeetPerMinute, _super);
    function DataVerticalSpeedMaxFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxFeetPerMinute.type = 'Maximum vertical speed in feet per minute';
    DataVerticalSpeedMaxFeetPerMinute.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxFeetPerMinute;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerMinute));
exports.DataVerticalSpeedMaxFeetPerMinute = DataVerticalSpeedMaxFeetPerMinute;
var DataVerticalSpeedMaxMetersPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxMetersPerHour, _super);
    function DataVerticalSpeedMaxMetersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxMetersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxMetersPerHour.type = 'Maximum vertical speed in meters per hour';
    DataVerticalSpeedMaxMetersPerHour.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxMetersPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMetersPerHour));
exports.DataVerticalSpeedMaxMetersPerHour = DataVerticalSpeedMaxMetersPerHour;
var DataVerticalSpeedMaxFeetPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxFeetPerHour, _super);
    function DataVerticalSpeedMaxFeetPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxFeetPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxFeetPerHour.type = 'Maximum vertical speed in feet per hour';
    DataVerticalSpeedMaxFeetPerHour.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxFeetPerHour;
}(data_vertical_speed_1.DataVerticalSpeedFeetPerHour));
exports.DataVerticalSpeedMaxFeetPerHour = DataVerticalSpeedMaxFeetPerHour;
var DataVerticalSpeedMaxKilometerPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxKilometerPerHour, _super);
    function DataVerticalSpeedMaxKilometerPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxKilometerPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxKilometerPerHour.type = 'Maximum vertical speed in kilometers per hour';
    DataVerticalSpeedMaxKilometerPerHour.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxKilometerPerHour;
}(data_vertical_speed_1.DataVerticalSpeedKilometerPerHour));
exports.DataVerticalSpeedMaxKilometerPerHour = DataVerticalSpeedMaxKilometerPerHour;
var DataVerticalSpeedMaxMilesPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMaxMilesPerHour, _super);
    function DataVerticalSpeedMaxMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMaxMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMaxMilesPerHour.type = 'Maximum vertical speed in miles per hour';
    DataVerticalSpeedMaxMilesPerHour.displayType = DataVerticalSpeedMax.type;
    return DataVerticalSpeedMaxMilesPerHour;
}(data_vertical_speed_1.DataVerticalSpeedMilesPerHour));
exports.DataVerticalSpeedMaxMilesPerHour = DataVerticalSpeedMaxMilesPerHour;
