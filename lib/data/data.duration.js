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
var DataDuration = /** @class */ (function (_super) {
    __extends(DataDuration, _super);
    function DataDuration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDuration.prototype.getDisplayValue = function () {
        var seconds = this.getValue();
        var h = Math.floor(seconds / 3600);
        var d = Math.floor(h / 24);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 3600 % 60);
        if (!m && !h) {
            return ('0' + s).slice(-2) + 's';
        }
        else if (!h) {
            return ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
        }
        else {
            if (d) {
                return ('0' + h).slice(-3) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
            }
            else {
                return ('0' + h).slice(-2) + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + s).slice(-2) + 's';
            }
        }
    };
    DataDuration.prototype.getDisplayUnit = function () {
        return '';
    };
    DataDuration.type = 'Duration';
    DataDuration.unit = 's';
    return DataDuration;
}(data_number_1.DataNumber));
exports.DataDuration = DataDuration;
