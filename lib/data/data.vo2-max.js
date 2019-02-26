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
var data_number_1 = require("./data.number");
var DataVO2Max = /** @class */ (function (_super) {
    __extends(DataVO2Max, _super);
    function DataVO2Max() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataVO2Max.type = 'VO2 Max';
    return DataVO2Max;
}(data_number_1.DataNumber));
exports.DataVO2Max = DataVO2Max;
