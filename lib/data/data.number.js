"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var data_bare_1 = require("./data.bare");
var DataNumber = /** @class */ (function (_super) {
    __extends(DataNumber, _super);
    function DataNumber(value) {
        var _this = this;
        if (typeof value !== 'number') {
            throw new Error('Only numbers are allowed for numeric data');
        }
        _this = _super.call(this, value) || this;
        _this.value = value;
        return _this;
    }
    DataNumber.prototype.getValue = function () {
        return this.value;
    };
    return DataNumber;
}(data_bare_1.DataBare));
exports.DataNumber = DataNumber;
