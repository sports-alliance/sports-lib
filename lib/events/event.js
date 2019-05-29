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
var privacy_class_interface_1 = require("../privacy/privacy.class.interface");
var Event = /** @class */ (function (_super) {
    __extends(Event, _super);
    function Event(name, startDate, endDate, privacy) {
        var _this = _super.call(this, startDate, endDate) || this;
        _this.privacy = privacy_class_interface_1.Privacy.Private;
        _this.activities = [];
        _this.name = name;
        if (privacy) {
            _this.privacy = privacy;
        }
        return _this;
    }
    Event.prototype.addActivity = function (activity) {
        this.activities.push(activity);
    };
    Event.prototype.addActivities = function (activities) {
        var _a;
        (_a = this.activities).push.apply(_a, activities);
    };
    Event.prototype.clearActivities = function () {
        this.activities = [];
    };
    Event.prototype.removeActivity = function (activityToRemove) {
        this.activities = this.activities.filter(function (activity) { return activityToRemove.getID() !== activity.getID(); });
    };
    Event.prototype.getActivities = function () {
        this.sortActivities(); // PErhaps move on adding ? Lets check performance
        // debugger
        return this.activities;
    };
    Event.prototype.getFirstActivity = function () {
        return this.getActivities().reduce(function (activityA, activityB) {
            return activityA.startDate < activityB.startDate ? activityA : activityB;
        });
    };
    Event.prototype.getLastActivity = function () {
        return this.getActivities().reduce(function (activityA, activityB) {
            return activityA.startDate < activityB.startDate ? activityB : activityA;
        });
    };
    Event.prototype.sortActivities = function () {
        this.activities.sort(function (activityA, activityB) {
            return +activityA.startDate - +activityB.startDate;
        });
    };
    Event.prototype.toJSON = function () {
        var stats = {};
        this.stats.forEach(function (value, key) {
            Object.assign(stats, value.toJSON());
        });
        return {
            name: this.name,
            privacy: this.privacy,
            startDate: this.startDate.getTime(),
            endDate: this.endDate.getTime(),
            stats: stats,
            metaData: this.metaData ? this.metaData.toJSON() : null,
        };
    };
    return Event;
}(duration_class_abstract_1.DurationClassAbstract));
exports.Event = Event;
