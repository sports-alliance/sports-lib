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
var data_boolean_1 = require("./data.boolean");
var DataFusedAltitude = /** @class */ (function (_super) {
    __extends(DataFusedAltitude, _super);
    function DataFusedAltitude() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataFusedAltitude.prototype.getDisplayValue = function () {
        return this.getValue() ? 'Yes' : 'No';
    };
    DataFusedAltitude.className = 'DataFusedAltitude';
    DataFusedAltitude.type = 'Fused Altitude';
    DataFusedAltitude.unit = '';
    return DataFusedAltitude;
}(data_boolean_1.DataBoolean));
exports.DataFusedAltitude = DataFusedAltitude;
