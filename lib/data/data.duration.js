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
var DataDuration = /** @class */ (function (_super) {
    __extends(DataDuration, _super);
    function DataDuration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDuration.prototype.getDisplayValue = function () {
        var d = this.getValue();
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        if (!m && !h) {
            return ('0' + s).slice(-2) + 's';
        }
        else if (!h) {
            return ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
        }
        else {
            return ('0' + h).slice(-2) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
        }
    };
    DataDuration.prototype.getDisplayUnit = function () {
        return '';
    };
    DataDuration.className = 'DataDuration';
    DataDuration.type = 'Duration';
    DataDuration.unit = 's';
    return DataDuration;
}(data_number_1.DataNumber));
exports.DataDuration = DataDuration;
