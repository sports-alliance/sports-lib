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
var data_boolean_1 = require("./data.boolean");
var DataAutoPauseUsed = /** @class */ (function (_super) {
    __extends(DataAutoPauseUsed, _super);
    function DataAutoPauseUsed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataAutoPauseUsed.prototype.getDisplayValue = function () {
        return this.getValue() ? 'Yes' : 'No';
    };
    DataAutoPauseUsed.type = 'Auto Pause';
    return DataAutoPauseUsed;
}(data_boolean_1.DataBoolean));
exports.DataAutoPauseUsed = DataAutoPauseUsed;
