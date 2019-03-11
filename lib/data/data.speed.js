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
var data_number_1 = require("./data.number");
var DataSpeed = /** @class */ (function (_super) {
    __extends(DataSpeed, _super);
    function DataSpeed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeed.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(2);
    };
    DataSpeed.type = 'Speed';
    DataSpeed.unit = 'm/s';
    return DataSpeed;
}(data_number_1.DataNumber));
exports.DataSpeed = DataSpeed;
var DataSpeedKilometersPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedKilometersPerHour, _super);
    function DataSpeedKilometersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedKilometersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedKilometersPerHour.type = 'Speed in kilometers per hour';
    DataSpeedKilometersPerHour.displayType = DataSpeed.type;
    DataSpeedKilometersPerHour.unit = 'km/h';
    return DataSpeedKilometersPerHour;
}(DataSpeed));
exports.DataSpeedKilometersPerHour = DataSpeedKilometersPerHour;
var DataSpeedMilesPerHour = /** @class */ (function (_super) {
    __extends(DataSpeedMilesPerHour, _super);
    function DataSpeedMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMilesPerHour.type = 'Speed in miles per hour';
    DataSpeedMilesPerHour.displayType = DataSpeed.type;
    DataSpeedMilesPerHour.unit = 'mph';
    return DataSpeedMilesPerHour;
}(DataSpeed));
exports.DataSpeedMilesPerHour = DataSpeedMilesPerHour;
var DataSpeedFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataSpeedFeetPerSecond, _super);
    function DataSpeedFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedFeetPerSecond.type = 'Speed in feet per second';
    DataSpeedFeetPerSecond.displayType = DataSpeed.type;
    DataSpeedFeetPerSecond.unit = 'ft/s';
    return DataSpeedFeetPerSecond;
}(DataSpeed));
exports.DataSpeedFeetPerSecond = DataSpeedFeetPerSecond;
var DataSpeedMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedMetersPerMinute, _super);
    function DataSpeedMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedMetersPerMinute.type = 'Speed in meters per minute';
    DataSpeedMetersPerMinute.displayType = DataSpeed.type;
    DataSpeedMetersPerMinute.unit = 'm/min';
    return DataSpeedMetersPerMinute;
}(DataSpeed));
exports.DataSpeedMetersPerMinute = DataSpeedMetersPerMinute;
var DataSpeedFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataSpeedFeetPerMinute, _super);
    function DataSpeedFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataSpeedFeetPerMinute.type = 'Speed in feet per minute';
    DataSpeedFeetPerMinute.displayType = DataSpeed.type;
    DataSpeedFeetPerMinute.unit = 'ft/min';
    return DataSpeedFeetPerMinute;
}(DataSpeed));
exports.DataSpeedFeetPerMinute = DataSpeedFeetPerMinute;
