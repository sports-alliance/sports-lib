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
var DataSpeedMax = /** @class */ (function (_super) {
    __extends(DataSpeedMax, _super);
    function DataSpeedMax() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMax.type = 'Maximum Speed';
    return DataSpeedMax;
}(data_speed_1.DataSpeed));
exports.DataSpeedMax = DataSpeedMax;
var DataSpeedMaxKilometersPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedMaxKilometersPerHour, _super);
    function DataSpeedMaxKilometersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMaxKilometersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMaxKilometersPerHour.type = 'Maximum speed in kilometers per hour';
    DataSpeedMaxKilometersPerHour.displayType = DataSpeedMax.type;
    return DataSpeedMaxKilometersPerHour;
}(data_speed_1.DataSpeedKilometersPerHour));
exports.DataSpeedMaxKilometersPerHour = DataSpeedMaxKilometersPerHour;
var DataSpeedMaxMilesPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedMaxMilesPerHour, _super);
    function DataSpeedMaxMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMaxMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMaxMilesPerHour.type = 'Maximum speed in miles per hour';
    DataSpeedMaxMilesPerHour.displayType = DataSpeedMax.type;
    return DataSpeedMaxMilesPerHour;
}(data_speed_1.DataSpeedMilesPerHour));
exports.DataSpeedMaxMilesPerHour = DataSpeedMaxMilesPerHour;
var DataSpeedMaxFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataSpeedMaxFeetPerSecond, _super);
    function DataSpeedMaxFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMaxFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMaxFeetPerSecond.type = 'Maximum speed in feet per second';
    DataSpeedMaxFeetPerSecond.displayType = DataSpeedMax.type;
    return DataSpeedMaxFeetPerSecond;
}(data_speed_1.DataSpeedFeetPerSecond));
exports.DataSpeedMaxFeetPerSecond = DataSpeedMaxFeetPerSecond;
var DataSpeedMaxMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedMaxMetersPerMinute, _super);
    function DataSpeedMaxMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMaxMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMaxMetersPerMinute.type = 'Maximum speed in meters per minute';
    DataSpeedMaxMetersPerMinute.displayType = DataSpeedMax.type;
    return DataSpeedMaxMetersPerMinute;
}(data_speed_1.DataSpeedMetersPerMinute));
exports.DataSpeedMaxMetersPerMinute = DataSpeedMaxMetersPerMinute;
var DataSpeedMaxFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedMaxFeetPerMinute, _super);
    function DataSpeedMaxFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMaxFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMaxFeetPerMinute.type = 'Maximum speed in feet per minute';
    DataSpeedMaxFeetPerMinute.displayType = DataSpeedMax.type;
    return DataSpeedMaxFeetPerMinute;
}(data_speed_1.DataSpeedFeetPerMinute));
exports.DataSpeedMaxFeetPerMinute = DataSpeedMaxFeetPerMinute;
