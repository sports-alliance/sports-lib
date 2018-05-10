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
var data_duration_1 = require("./data.duration");
var DataDescentTime = /** @class */ (function (_super) {
    __extends(DataDescentTime, _super);
    function DataDescentTime() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDescentTime.className = 'DataDescentTime';
    DataDescentTime.type = 'Descent Time';
    return DataDescentTime;
}(data_duration_1.DataDuration));
exports.DataDescentTime = DataDescentTime;
