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
var data_number_1 = require("./data.number");
var DataTotalTrainingEffect = /** @class */ (function (_super) {
    __extends(DataTotalTrainingEffect, _super);
    function DataTotalTrainingEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataTotalTrainingEffect.prototype.getDisplayValue = function () {
        return this.value.toFixed(1);
    };
    DataTotalTrainingEffect.type = 'Total Training effect';
    DataTotalTrainingEffect.displayType = 'Total Training Effect';
    return DataTotalTrainingEffect;
}(data_number_1.DataNumber));
exports.DataTotalTrainingEffect = DataTotalTrainingEffect;
