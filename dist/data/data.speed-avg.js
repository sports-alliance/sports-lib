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
var data_speed_1 = require("./data.speed");
var DataSpeedAvg = /** @class */ (function (_super) {
    __extends(DataSpeedAvg, _super);
    function DataSpeedAvg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSpeedAvg.className = 'DataSpeedAvg';
    DataSpeedAvg.type = 'Avg Speed';
    return DataSpeedAvg;
}(data_speed_1.DataSpeed));
exports.DataSpeedAvg = DataSpeedAvg;
