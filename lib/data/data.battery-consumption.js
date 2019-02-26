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
var data_number_1 = require("./data.number");
var DataBatteryConsumption = /** @class */ (function (_super) {
    __extends(DataBatteryConsumption, _super);
    function DataBatteryConsumption() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataBatteryConsumption.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(2);
    };
    DataBatteryConsumption.type = 'Battery Consumption';
    DataBatteryConsumption.unit = '%';
    return DataBatteryConsumption;
}(data_number_1.DataNumber));
exports.DataBatteryConsumption = DataBatteryConsumption;
