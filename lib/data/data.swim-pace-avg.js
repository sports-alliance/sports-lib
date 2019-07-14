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
var data_swim_pace_1 = require("./data.swim-pace");
var DataSwimPaceAvg = /** @class */ (function (_super) {
    __extends(DataSwimPaceAvg, _super);
    function DataSwimPaceAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceAvg.type = 'Average Swim Pace';
    return DataSwimPaceAvg;
}(data_swim_pace_1.DataSwimPace));
exports.DataSwimPaceAvg = DataSwimPaceAvg;
var DataSwimPaceAvgMinutesPer100Yard = /** @class */ (function (_super) {
    __extends(DataSwimPaceAvgMinutesPer100Yard, _super);
    function DataSwimPaceAvgMinutesPer100Yard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceAvgMinutesPer100Yard.type = 'Average swim pace in minutes per 100 yard';
    DataSwimPaceAvgMinutesPer100Yard.displayType = DataSwimPaceAvg.type;
    return DataSwimPaceAvgMinutesPer100Yard;
}(data_swim_pace_1.DataSwimPaceMinutesPer100Yard));
exports.DataSwimPaceAvgMinutesPer100Yard = DataSwimPaceAvgMinutesPer100Yard;
