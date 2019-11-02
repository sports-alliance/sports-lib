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
var DataFeeling = /** @class */ (function (_super) {
    __extends(DataFeeling, _super);
    function DataFeeling() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataFeeling.prototype.getDisplayValue = function () {
        return Feelings[Math.ceil(this.getValue())] ? Feelings[Math.ceil(this.getValue())] : "";
    };
    DataFeeling.type = 'Feeling';
    return DataFeeling;
}(data_number_1.DataNumber));
exports.DataFeeling = DataFeeling;
var Feelings;
(function (Feelings) {
    Feelings[Feelings["Poor"] = 1] = "Poor";
    Feelings[Feelings["Average"] = 2] = "Average";
    Feelings[Feelings["Good"] = 3] = "Good";
    Feelings[Feelings["Very Good"] = 4] = "Very Good";
    Feelings[Feelings["Excellent"] = 5] = "Excellent";
})(Feelings = exports.Feelings || (exports.Feelings = {}));
