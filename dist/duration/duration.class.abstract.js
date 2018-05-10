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
var stats_class_abstract_1 = require("../stats/stats.class.abstract");
var DurationClassAbstract = /** @class */ (function (_super) {
    __extends(DurationClassAbstract, _super);
    function DurationClassAbstract(statDate, endDate) {
        var _this = this;
        if (!statDate || !endDate) {
            throw new Error('Start and end dates are required');
        }
        _this = _super.call(this) || this;
        _this.startDate = statDate;
        _this.endDate = endDate;
        return _this;
    }
    return DurationClassAbstract;
}(stats_class_abstract_1.StatsClassAbstract));
exports.DurationClassAbstract = DurationClassAbstract;
