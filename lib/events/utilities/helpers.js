"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNumberOrString(property) {
    return (typeof property === 'number' || typeof property === 'string');
}
exports.isNumberOrString = isNumberOrString;
function isNumber(property) {
    return (typeof property === 'number');
}
exports.isNumber = isNumber;
/**
 * Converts speed from m/s to pace as of seconds per km
 * @param {number} number
 * @return {number}
 */
function convertSpeedToPace(number) {
    return number === 0 ? number : (1000 / number);
}
exports.convertSpeedToPace = convertSpeedToPace;
/**
 * Converts m/s to seconds per 100m
 * @param number
 */
function convertSpeedToSwimPace(number) {
    return number === 0 ? number : (100 / number);
}
exports.convertSpeedToSwimPace = convertSpeedToSwimPace;
function convertSpeedToSpeedInKilometersPerHour(number) {
    return number * 3.6;
}
exports.convertSpeedToSpeedInKilometersPerHour = convertSpeedToSpeedInKilometersPerHour;
function convertSpeedToSpeedInMilesPerHour(number) {
    return number * 2.237;
}
exports.convertSpeedToSpeedInMilesPerHour = convertSpeedToSpeedInMilesPerHour;
function convertSpeedToSpeedInFeetPerSecond(number) {
    return number * 3.28084;
}
exports.convertSpeedToSpeedInFeetPerSecond = convertSpeedToSpeedInFeetPerSecond;
function convertSpeedToSpeedInMetersPerMinute(number) {
    return number * 60;
}
exports.convertSpeedToSpeedInMetersPerMinute = convertSpeedToSpeedInMetersPerMinute;
function convertSpeedToSpeedInFeetPerMinute(number) {
    return number * 196.85;
}
exports.convertSpeedToSpeedInFeetPerMinute = convertSpeedToSpeedInFeetPerMinute;
function convertSpeedToSpeedInFeetPerHour(number) {
    return number * 11811.024;
}
exports.convertSpeedToSpeedInFeetPerHour = convertSpeedToSpeedInFeetPerHour;
function convertSpeedToSpeedInMetersPerHour(number) {
    return number * 3600;
}
exports.convertSpeedToSpeedInMetersPerHour = convertSpeedToSpeedInMetersPerHour;
function convertPaceToPaceInMinutesPerMile(number) {
    return number * 1.60934;
}
exports.convertPaceToPaceInMinutesPerMile = convertPaceToPaceInMinutesPerMile;
/**
 * Converts m/s to seconds per 100m
 * @param number
 */
function convertSwimPaceToSwimPacePer100Yard(number) {
    return number * 10.93613298;
}
exports.convertSwimPaceToSwimPacePer100Yard = convertSwimPaceToSwimPacePer100Yard;
function getSize(obj) {
    var bytes = 0;
    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (var key in obj) {
                            if (!obj.hasOwnProperty(key))
                                continue;
                            sizeOf(obj[key]);
                        }
                    }
                    else
                        bytes += obj.toString().length * 2;
                    break;
            }
        }
        return bytes;
    }
    function formatByteSize(bytes) {
        if (bytes < 1024)
            return bytes + " bytes";
        else if (bytes < 1048576)
            return (bytes / 1024).toFixed(3) + " KiB";
        else if (bytes < 1073741824)
            return (bytes / 1048576).toFixed(3) + " MiB";
        else
            return (bytes / 1073741824).toFixed(3) + " GiB";
    }
    return formatByteSize(sizeOf(obj));
}
exports.getSize = getSize;
