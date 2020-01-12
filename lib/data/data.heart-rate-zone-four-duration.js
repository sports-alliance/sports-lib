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
var data_duration_1 = require("./data.duration");
var DataHeartRateZoneFourDuration = /** @class */ (function (_super) {
    __extends(DataHeartRateZoneFourDuration, _super);
    function DataHeartRateZoneFourDuration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataHeartRateZoneFourDuration.type = 'Heart Rate Zone Four Duration';
    return DataHeartRateZoneFourDuration;
}(data_duration_1.DataDuration));
exports.DataHeartRateZoneFourDuration = DataHeartRateZoneFourDuration;
