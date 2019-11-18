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
var helpers_1 = require("../events/utilities/helpers");
var data_duration_1 = require("./data.duration");
var DataSwimPace = /** @class */ (function (_super) {
    __extends(DataSwimPace, _super);
    function DataSwimPace() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPace.prototype.getDisplayValue = function () {
        var d = _super.prototype.getValue.call(this);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        if (!m && !h) {
            return '00:' + ('0' + s).slice(-2);
        }
        else if (!h) {
            return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        }
        else {
            return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        }
    };
    DataSwimPace.prototype.getDisplayUnit = function () {
        return this.getUnit();
    };
    DataSwimPace.prototype.getValue = function (formatForDataType) {
        switch (formatForDataType) {
            case DataSwimPaceMinutesPer100Yard.type:
                return helpers_1.convertSwimPaceToSwimPacePer100Yard(this.value);
            default:
                return _super.prototype.getValue.call(this, formatForDataType);
        }
    };
    DataSwimPace.type = 'Swim Pace';
    DataSwimPace.unit = 'min/100m';
    return DataSwimPace;
}(data_duration_1.DataDuration));
exports.DataSwimPace = DataSwimPace;
var DataSwimPaceMinutesPer100Yard = /** @class */ (function (_super) {
    __extends(DataSwimPaceMinutesPer100Yard, _super);
    function DataSwimPaceMinutesPer100Yard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceMinutesPer100Yard.type = 'Swim Pace in minutes per 100 yard';
    DataSwimPaceMinutesPer100Yard.displayType = DataSwimPace.type;
    DataSwimPaceMinutesPer100Yard.unit = 'min/100yrd';
    return DataSwimPaceMinutesPer100Yard;
}(DataSwimPace));
exports.DataSwimPaceMinutesPer100Yard = DataSwimPaceMinutesPer100Yard;
