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
var data_altitude_1 = require("./data.altitude");
var DataElevation = /** @class */ (function (_super) {
    __extends(DataElevation, _super);
    function DataElevation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataElevation.type = 'Elevation';
    DataElevation.unit = 'm';
    return DataElevation;
}(data_altitude_1.DataAltitude));
exports.DataElevation = DataElevation;
