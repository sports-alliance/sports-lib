"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LapTypesHelper = /** @class */ (function () {
    function LapTypesHelper() {
    }
    LapTypesHelper.getLapTypesAsUniqueArray = function () {
        return Array.from(new Set(Object.keys(LapTypes).reduce(function (array, key) {
            array.push(LapTypes[key]); // Important get the key via the enum else it will be chaos
            return array;
        }, [])));
    };
    return LapTypesHelper;
}());
exports.LapTypesHelper = LapTypesHelper;
/**
 * This enum works like a all matchers for normalized lap types between different naming across services
 */
var LapTypes;
(function (LapTypes) {
    LapTypes["unknown"] = "Unknown";
    LapTypes["Unknown"] = "Unknown";
    LapTypes["Start"] = "Start";
    LapTypes["start"] = "Start";
    LapTypes["Stop"] = "Stop";
    LapTypes["stop"] = "Stop";
    LapTypes["Manual"] = "Manual";
    LapTypes["manual"] = "Manual";
    LapTypes["Autolap"] = "Autolap";
    LapTypes["AutoLap"] = "Autolap";
    LapTypes["autolap"] = "Autolap";
    LapTypes["Auto lap"] = "Autolap";
    LapTypes["Distance"] = "Distance";
    LapTypes["distance"] = "Distance";
    LapTypes["Location"] = "Location";
    LapTypes["location"] = "Location";
    LapTypes["interval"] = "Interval";
    LapTypes["Interval"] = "Interval";
    LapTypes["Low Interval"] = "Low Interval";
    LapTypes["High Interval"] = "High Interval";
    LapTypes["Time"] = "Time";
    LapTypes["time"] = "Time";
    LapTypes["HeartRate"] = "Heart Rate";
    LapTypes["Heart Rate"] = "Heart Rate";
    LapTypes["position_start"] = "Position start";
    LapTypes["Position start"] = "Position start";
    LapTypes["position_lap"] = "Position lap";
    LapTypes["Position lap"] = "Position lap";
    LapTypes["position_waypoint"] = "Position waypoint";
    LapTypes["Position waypoint"] = "Position waypoint";
    LapTypes["position_marked"] = "Position marked";
    LapTypes["Position marked"] = "Position marked";
    LapTypes["session_end"] = "Session end";
    LapTypes["Session end"] = "Session end";
    LapTypes["fitness_equipment"] = "Fitness equipment";
    LapTypes["fitness equipment"] = "Fitness equipment";
    LapTypes["Fitness equipment"] = "Fitness equipment";
    LapTypes["FitnessEquipment"] = "Fitness equipment";
})(LapTypes = exports.LapTypes || (exports.LapTypes = {}));
