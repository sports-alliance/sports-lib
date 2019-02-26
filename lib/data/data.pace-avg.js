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
var data_pace_1 = require("./data.pace");
var DataPaceAvg = /** @class */ (function (_super) {
    __extends(DataPaceAvg, _super);
    function DataPaceAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceAvg.type = 'Average Pace';
    return DataPaceAvg;
}(data_pace_1.DataPace));
exports.DataPaceAvg = DataPaceAvg;
var DataPaceAvgMinutesPerMile = /** @class */ (function (_super) {
    __extends(DataPaceAvgMinutesPerMile, _super);
    function DataPaceAvgMinutesPerMile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceAvgMinutesPerMile.type = 'Average pace in minutes per mile';
    DataPaceAvgMinutesPerMile.displayType = DataPaceAvg.type;
    return DataPaceAvgMinutesPerMile;
}(data_pace_1.DataPaceMinutesPerMile));
exports.DataPaceAvgMinutesPerMile = DataPaceAvgMinutesPerMile;
