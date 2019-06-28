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
var DataStartAltitude = /** @class */ (function (_super) {
    __extends(DataStartAltitude, _super);
    function DataStartAltitude() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataStartAltitude.type = 'Starting Altitude';
    return DataStartAltitude;
}(data_altitude_1.DataAltitude));
exports.DataStartAltitude = DataStartAltitude;
