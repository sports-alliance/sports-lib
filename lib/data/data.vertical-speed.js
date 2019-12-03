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
var helpers_1 = require("../events/utilities/helpers");
var DataVerticalSpeed = /** @class */ (function (_super) {
    __extends(DataVerticalSpeed, _super);
    function DataVerticalSpeed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeed.prototype.getValue = function (formatForDataType) {
        switch (formatForDataType) {
            case DataVerticalSpeedKilometerPerHour.type:
                return helpers_1.convertSpeedToSpeedInKilometersPerHour(this.value);
            case DataVerticalSpeedMilesPerHour.type:
                return helpers_1.convertSpeedToSpeedInMilesPerHour(this.value);
            case DataVerticalSpeedFeetPerSecond.type:
                return helpers_1.convertSpeedToSpeedInFeetPerSecond(this.value);
            case DataVerticalSpeedMetersPerMinute.type:
                return helpers_1.convertSpeedToSpeedInMetersPerMinute(this.value);
            case DataVerticalSpeedFeetPerMinute.type:
                return helpers_1.convertSpeedToSpeedInFeetPerMinute(this.value);
            case DataVerticalSpeedFeetPerHour.type:
                return helpers_1.convertSpeedToSpeedInFeetPerHour(this.value);
            case DataVerticalSpeedMetersPerHour.type:
                return helpers_1.convertSpeedToSpeedInMetersPerHour(this.value);
            default:
                return _super.prototype.getValue.call(this, formatForDataType);
        }
    };
    DataVerticalSpeed.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(2);
    };
    DataVerticalSpeed.type = 'Vertical Speed';
    DataVerticalSpeed.unit = 'm/s';
    return DataVerticalSpeed;
}(data_number_1.DataNumber));
exports.DataVerticalSpeed = DataVerticalSpeed;
var DataVerticalSpeedFeetPerSecond = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedFeetPerSecond, _super);
    function DataVerticalSpeedFeetPerSecond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedFeetPerSecond.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedFeetPerSecond.type = 'Vertical speed in feet per second';
    DataVerticalSpeedFeetPerSecond.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedFeetPerSecond.unit = 'ft/s';
    return DataVerticalSpeedFeetPerSecond;
}(DataVerticalSpeed));
exports.DataVerticalSpeedFeetPerSecond = DataVerticalSpeedFeetPerSecond;
var DataVerticalSpeedMetersPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMetersPerMinute, _super);
    function DataVerticalSpeedMetersPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMetersPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMetersPerMinute.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(1);
    };
    DataVerticalSpeedMetersPerMinute.type = 'Vertical speed in meters per minute';
    DataVerticalSpeedMetersPerMinute.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedMetersPerMinute.unit = 'm/min';
    return DataVerticalSpeedMetersPerMinute;
}(DataVerticalSpeed));
exports.DataVerticalSpeedMetersPerMinute = DataVerticalSpeedMetersPerMinute;
var DataVerticalSpeedFeetPerMinute = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedFeetPerMinute, _super);
    function DataVerticalSpeedFeetPerMinute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedFeetPerMinute.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedFeetPerMinute.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(1);
    };
    DataVerticalSpeedFeetPerMinute.type = 'Vertical speed in feet per minute';
    DataVerticalSpeedFeetPerMinute.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedFeetPerMinute.unit = 'ft/min';
    return DataVerticalSpeedFeetPerMinute;
}(DataVerticalSpeed));
exports.DataVerticalSpeedFeetPerMinute = DataVerticalSpeedFeetPerMinute;
var DataVerticalSpeedMetersPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMetersPerHour, _super);
    function DataVerticalSpeedMetersPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMetersPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMetersPerHour.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(0);
    };
    DataVerticalSpeedMetersPerHour.type = 'Vertical speed in meters per hour';
    DataVerticalSpeedMetersPerHour.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedMetersPerHour.unit = 'm/h';
    return DataVerticalSpeedMetersPerHour;
}(DataVerticalSpeed));
exports.DataVerticalSpeedMetersPerHour = DataVerticalSpeedMetersPerHour;
var DataVerticalSpeedFeetPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedFeetPerHour, _super);
    function DataVerticalSpeedFeetPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedFeetPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedFeetPerHour.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(0);
    };
    DataVerticalSpeedFeetPerHour.type = 'Vertical speed in feet per hour';
    DataVerticalSpeedFeetPerHour.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedFeetPerHour.unit = 'ft/h';
    return DataVerticalSpeedFeetPerHour;
}(DataVerticalSpeed));
exports.DataVerticalSpeedFeetPerHour = DataVerticalSpeedFeetPerHour;
var DataVerticalSpeedKilometerPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedKilometerPerHour, _super);
    function DataVerticalSpeedKilometerPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedKilometerPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedKilometerPerHour.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(2);
    };
    DataVerticalSpeedKilometerPerHour.type = 'Vertical speed in kilometers per hour';
    DataVerticalSpeedKilometerPerHour.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedKilometerPerHour.unit = 'km/h';
    return DataVerticalSpeedKilometerPerHour;
}(DataVerticalSpeed));
exports.DataVerticalSpeedKilometerPerHour = DataVerticalSpeedKilometerPerHour;
var DataVerticalSpeedMilesPerHour = /** @class */ (function (_super) {
    __extends(DataVerticalSpeedMilesPerHour, _super);
    function DataVerticalSpeedMilesPerHour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeedMilesPerHour.prototype.getDisplayType = function () {
        return _super.prototype.getDisplayType.call(this);
    };
    DataVerticalSpeedMilesPerHour.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(2);
    };
    DataVerticalSpeedMilesPerHour.type = 'Vertical speed in miles per hour';
    DataVerticalSpeedMilesPerHour.displayType = DataVerticalSpeed.type;
    DataVerticalSpeedMilesPerHour.unit = 'mph';
    return DataVerticalSpeedMilesPerHour;
}(DataVerticalSpeed));
exports.DataVerticalSpeedMilesPerHour = DataVerticalSpeedMilesPerHour;
