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
var data_number_1 = require("./data.number");
var DataVerticalSpeed = /** @class */ (function (_super) {
    __extends(DataVerticalSpeed, _super);
    function DataVerticalSpeed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVerticalSpeed.prototype.getDisplayValue = function () {
        return this.getValue().toFixed(3);
    };
    DataVerticalSpeed.className = 'DataVerticalSpeed';
    DataVerticalSpeed.type = 'Vertical Speed';
    DataVerticalSpeed.unit = 'm/s';
    return DataVerticalSpeed;
}(data_number_1.DataNumber));
exports.DataVerticalSpeed = DataVerticalSpeed;
