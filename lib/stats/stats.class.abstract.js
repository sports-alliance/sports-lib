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
var id_abstract_class_1 = require("../id/id.abstract.class");
var data_duration_1 = require("../data/data.duration");
var data_distance_1 = require("../data/data.distance");
var data_pause_1 = require("../data/data.pause");
var StatsClassAbstract = /** @class */ (function (_super) {
    __extends(StatsClassAbstract, _super);
    function StatsClassAbstract() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stats = new Map();
        return _this;
    }
    StatsClassAbstract.prototype.getDistance = function () {
        return this.stats.get(data_distance_1.DataDistance.className);
    };
    StatsClassAbstract.prototype.getDuration = function () {
        return this.stats.get(data_duration_1.DataDuration.className);
    };
    StatsClassAbstract.prototype.getPause = function () {
        return this.stats.get(data_pause_1.DataPause.className);
    };
    StatsClassAbstract.prototype.getStat = function (statType) {
        return this.stats.get(statType);
    };
    StatsClassAbstract.prototype.getStats = function () {
        return this.stats;
    };
    StatsClassAbstract.prototype.removeStat = function (statType) {
        this.stats.delete(statType);
    };
    StatsClassAbstract.prototype.setDistance = function (distance) {
        this.stats.set(data_distance_1.DataDistance.className, distance);
    };
    StatsClassAbstract.prototype.setDuration = function (duration) {
        this.stats.set(data_duration_1.DataDuration.className, duration);
    };
    StatsClassAbstract.prototype.setPause = function (pause) {
        this.stats.set(data_pause_1.DataPause.className, pause);
    };
    StatsClassAbstract.prototype.addStat = function (stat) {
        this.stats.set(stat.getClassName(), stat);
    };
    return StatsClassAbstract;
}(id_abstract_class_1.IDClass));
exports.StatsClassAbstract = StatsClassAbstract;
