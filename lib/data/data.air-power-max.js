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
var data_air_power_1 = require("./data.air-power");
var DataAirPowerMax = /** @class */ (function (_super) {
    __extends(DataAirPowerMax, _super);
    function DataAirPowerMax() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataAirPowerMax.type = 'Maximum Air Power';
    return DataAirPowerMax;
}(data_air_power_1.DataAirPower));
exports.DataAirPowerMax = DataAirPowerMax;
