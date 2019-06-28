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
var DataEndAltitude = /** @class */ (function (_super) {
    __extends(DataEndAltitude, _super);
    function DataEndAltitude() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataEndAltitude.type = 'End Altitude';
    return DataEndAltitude;
}(data_altitude_1.DataAltitude));
exports.DataEndAltitude = DataEndAltitude;
