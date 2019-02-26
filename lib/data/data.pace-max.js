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
var DataPaceMax = /** @class */ (function (_super) {
    __extends(DataPaceMax, _super);
    function DataPaceMax() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceMax.type = 'Maximum Pace';
    return DataPaceMax;
}(data_pace_1.DataPace));
exports.DataPaceMax = DataPaceMax;
var DataPaceMaxMinutesPerMile = /** @class */ (function (_super) {
    __extends(DataPaceMaxMinutesPerMile, _super);
    function DataPaceMaxMinutesPerMile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPaceMaxMinutesPerMile.type = 'Maximum pace in minutes per mile';
    DataPaceMaxMinutesPerMile.displayType = DataPaceMax.type;
    return DataPaceMaxMinutesPerMile;
}(data_pace_1.DataPaceMinutesPerMile));
exports.DataPaceMaxMinutesPerMile = DataPaceMaxMinutesPerMile;
