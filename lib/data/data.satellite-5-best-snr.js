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
var DataSatellite5BestSNR = /** @class */ (function (_super) {
    __extends(DataSatellite5BestSNR, _super);
    function DataSatellite5BestSNR() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSatellite5BestSNR.type = 'Satellite 5 Best SNR';
    return DataSatellite5BestSNR;
}(data_number_1.DataNumber));
exports.DataSatellite5BestSNR = DataSatellite5BestSNR;
