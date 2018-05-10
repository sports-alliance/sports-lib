"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This enum works like a all matchers for normalized lap types between different naming across services
 */
var LapTypes;
(function (LapTypes) {
    LapTypes["Start"] = "Start";
    LapTypes["Stop"] = "Start";
    LapTypes["Manual"] = "Manual";
    LapTypes["manual"] = "Manual";
    LapTypes["Autolap"] = "Auto lap";
    LapTypes["AutoLap"] = "Auto lap";
    LapTypes["autolap"] = "Auto lap";
    LapTypes["Distance"] = "Distance";
    LapTypes["distance"] = "Distance";
    LapTypes["Location"] = "Location";
    LapTypes["location"] = "Location";
    LapTypes["Time"] = "Time";
    LapTypes["time"] = "Time";
    LapTypes["HeartRate"] = "Heart Rate";
    LapTypes["position_start"] = "Position start";
    LapTypes["position_lap"] = "Position lap";
    LapTypes["position_waypoint"] = "Position waypoint";
    LapTypes["position_marked"] = "Position marked";
    LapTypes["session_end"] = "Session end";
    LapTypes["fitness_equipment"] = "Fitness equipment";
})(LapTypes = exports.LapTypes || (exports.LapTypes = {}));
