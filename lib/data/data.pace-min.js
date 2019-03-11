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
var data_pace_1 = require("./data.pace");
var DataPaceMin = /** @class */ (function (_super) {
    __extends(DataPaceMin, _super);
    function DataPaceMin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceMin.type = 'Minimum Pace';
    return DataPaceMin;
}(data_pace_1.DataPace));
exports.DataPaceMin = DataPaceMin;
var DataPaceMinMinutesPerMile = /** @class */ (function (_super) {
    __extends(DataPaceMinMinutesPerMile, _super);
    function DataPaceMinMinutesPerMile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceMinMinutesPerMile.type = 'Minimum pace in minutes per mile';
    DataPaceMinMinutesPerMile.displayType = DataPaceMin.type;
    return DataPaceMinMinutesPerMile;
}(data_pace_1.DataPaceMinutesPerMile));
exports.DataPaceMinMinutesPerMile = DataPaceMinMinutesPerMile;
