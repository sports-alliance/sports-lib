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
var data_power_1 = require("./data.power");
var DataFormPower = /** @class */ (function (_super) {
    __extends(DataFormPower, _super);
    function DataFormPower() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataFormPower.type = 'Form Power';
    return DataFormPower;
}(data_power_1.DataPower));
exports.DataFormPower = DataFormPower;
