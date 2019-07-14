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
var DataSwimPaceMin = /** @class */ (function (_super) {
    __extends(DataSwimPaceMin, _super);
    function DataSwimPaceMin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceMin.type = 'Minimum Swim Pace';
    return DataSwimPaceMin;
}(data_swim_pace_1.DataSwimPace));
exports.DataSwimPaceMin = DataSwimPaceMin;
var DataSwimPaceMinMinutesPer100Yard = /** @class */ (function (_super) {
    __extends(DataSwimPaceMinMinutesPer100Yard, _super);
    function DataSwimPaceMinMinutesPer100Yard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceMinMinutesPer100Yard.type = 'Minimum swim pace in minutes per 100 yard';
    DataSwimPaceMinMinutesPer100Yard.displayType = DataSwimPaceMin.type;
    return DataSwimPaceMinMinutesPer100Yard;
}(data_swim_pace_1.DataSwimPaceMinutesPer100Yard));
exports.DataSwimPaceMinMinutesPer100Yard = DataSwimPaceMinMinutesPer100Yard;
