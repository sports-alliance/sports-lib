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
var DataSwimPaceMax = /** @class */ (function (_super) {
    __extends(DataSwimPaceMax, _super);
    function DataSwimPaceMax() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceMax.type = 'Maximum Swim Pace';
    return DataSwimPaceMax;
}(data_swim_pace_1.DataSwimPace));
exports.DataSwimPaceMax = DataSwimPaceMax;
var DataSwimPaceMaxMinutesPer100Yard = /** @class */ (function (_super) {
    __extends(DataSwimPaceMaxMinutesPer100Yard, _super);
    function DataSwimPaceMaxMinutesPer100Yard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSwimPaceMaxMinutesPer100Yard.type = 'Maximum swim pace in minutes per 100 yard';
    DataSwimPaceMaxMinutesPer100Yard.displayType = DataSwimPaceMax.type;
    return DataSwimPaceMaxMinutesPer100Yard;
}(data_swim_pace_1.DataSwimPaceMinutesPer100Yard));
exports.DataSwimPaceMaxMinutesPer100Yard = DataSwimPaceMaxMinutesPer100Yard;
