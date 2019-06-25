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
var stats_class_abstract_1 = require("../stats/stats.class.abstract");
var data_pause_1 = require("../data/data.pause");
var data_duration_1 = require("../data/data.duration");
var DurationClassAbstract = /** @class */ (function (_super) {
    __extends(DurationClassAbstract, _super);
    function DurationClassAbstract(startDate, endDate) {
        var _this = this;
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }
        if ((endDate - startDate) > 30 * 24 * 60 * 60 * 1000) {
            throw new Error('Activity duration is over 1 month and that is not supported');
        }
        if (endDate < startDate) {
            throw new Error('Activity end date is before the start date and that is not acceptable');
        }
        _this = _super.call(this) || this;
        _this.startDate = startDate;
        _this.endDate = endDate;
        return _this;
    }
    DurationClassAbstract.prototype.getDuration = function () {
        return this.stats.get(data_duration_1.DataDuration.type);
    };
    DurationClassAbstract.prototype.getPause = function () {
        return this.stats.get(data_pause_1.DataPause.type);
    };
    DurationClassAbstract.prototype.setDuration = function (duration) {
        this.stats.set(data_duration_1.DataDuration.type, duration);
    };
    DurationClassAbstract.prototype.setPause = function (pause) {
        this.stats.set(data_pause_1.DataPause.type, pause);
    };
    return DurationClassAbstract;
}(stats_class_abstract_1.StatsClassAbstract));
exports.DurationClassAbstract = DurationClassAbstract;
