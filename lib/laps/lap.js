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
var duration_class_abstract_1 = require("../duration/duration.class.abstract");
var Lap = /** @class */ (function (_super) {
    __extends(Lap, _super);
    function Lap(startDate, endDate, type) {
        var _this = _super.call(this, startDate, endDate) || this;
        _this.type = type;
        return _this;
    }
    Lap.prototype.toJSON = function () {
        var stats = {};
        this.stats.forEach(function (value, key) {
            Object.assign(stats, value.toJSON());
        });
        return {
            startDate: this.startDate.toJSON(),
            endDate: this.endDate.toJSON(),
            type: this.type,
            stats: stats
        };
    };
    return Lap;
}(duration_class_abstract_1.DurationClassAbstract));
exports.Lap = Lap;
