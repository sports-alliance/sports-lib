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
var data_epoc_1 = require("./data.epoc");
var DataPeakEPOC = /** @class */ (function (_super) {
    __extends(DataPeakEPOC, _super);
    function DataPeakEPOC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPeakEPOC.prototype.getDisplayValue = function () {
        return this.value.toFixed(1);
    };
    DataPeakEPOC.type = 'Peak EPOC';
    return DataPeakEPOC;
}(data_epoc_1.DataEPOC));
exports.DataPeakEPOC = DataPeakEPOC;
