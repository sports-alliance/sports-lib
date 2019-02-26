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
var data_duration_1 = require("./data.duration");
var DataPace = /** @class */ (function (_super) {
    __extends(DataPace, _super);
    function DataPace() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPace.prototype.getDisplayValue = function () {
        var d = this.getValue();
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
    DataPace.type = 'Pace';
    DataPace.unit = 'min/km';
    return DataPace;
}(data_duration_1.DataDuration));
exports.DataPace = DataPace;
var DataPaceMinutesPerMile = /** @class */ (function (_super) {
    __extends(DataPaceMinutesPerMile, _super);
    function DataPaceMinutesPerMile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceMinutesPerMile.type = 'Pace in minutes per mile';
    DataPaceMinutesPerMile.displayType = DataPace.type;
    DataPaceMinutesPerMile.unit = 'min/m';
    return DataPaceMinutesPerMile;
}(DataPace));
exports.DataPaceMinutesPerMile = DataPaceMinutesPerMile;
