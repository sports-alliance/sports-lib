"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var data_power_1 = require("./data.power");
var DataPowerAvg = /** @class */ (function (_super) {
    __extends(DataPowerAvg, _super);
    function DataPowerAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPowerAvg.className = 'DataPowerAvg';
    DataPowerAvg.type = 'Avg Power';
    return DataPowerAvg;
}(data_power_1.DataPower));
exports.DataPowerAvg = DataPowerAvg;
