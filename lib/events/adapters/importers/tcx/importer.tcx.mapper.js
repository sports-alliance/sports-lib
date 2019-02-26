"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_latitude_degrees_1 = require("../../../../data/data.latitude-degrees");
var data_altitude_1 = require("../../../../data/data.altitude");
var data_heart_rate_1 = require("../../../../data/data.heart-rate");
var data_cadence_1 = require("../../../../data/data.cadence");
var data_distance_1 = require("../../../../data/data.distance");
var data_speed_1 = require("../../../../data/data.speed");
var data_pace_1 = require("../../../../data/data.pace");
var data_power_1 = require("../../../../data/data.power");
var data_longitude_degrees_1 = require("../../../../data/data.longitude-degrees");
var helpers_1 = require("../../../utilities/helpers");
exports.TCXSampleMapper = [
    {
        dataType: data_latitude_degrees_1.DataLatitudeDegrees.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Position';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.getElementsByTagName('LatitudeDegrees')[0].textContent);
        },
    },
    {
        dataType: data_longitude_degrees_1.DataLongitudeDegrees.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Position';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.getElementsByTagName('LongitudeDegrees')[0].textContent);
        },
    },
    {
        dataType: data_distance_1.DataDistance.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'DistanceMeters';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.textContent);
        },
    },
    {
        dataType: data_altitude_1.DataAltitude.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'AltitudeMeters';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.textContent);
        },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Cadence';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.textContent);
        },
    },
    {
        dataType: data_heart_rate_1.DataHeartRate.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'HeartRateBpm';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            return Number(trackPointsElementChild.textContent);
        },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Extensions';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            var returnValue = null;
            for (var _i = 0, _a = trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children; _i < _a.length; _i++) {
                var dataExtensionElement = _a[_i];
                if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'RunCadence') {
                    returnValue = Number(dataExtensionElement.textContent);
                    break;
                }
            }
            return returnValue;
        },
    },
    {
        dataType: data_speed_1.DataSpeed.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Extensions';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            var returnValue = null;
            for (var _i = 0, _a = trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children; _i < _a.length; _i++) {
                var dataExtensionElement = _a[_i];
                if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Speed') {
                    returnValue = Number(dataExtensionElement.textContent);
                    break;
                }
            }
            return returnValue;
        },
    },
    {
        dataType: data_pace_1.DataPace.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Extensions';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            var returnValue = null;
            for (var _i = 0, _a = trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children; _i < _a.length; _i++) {
                var dataExtensionElement = _a[_i];
                if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Speed') {
                    returnValue = helpers_1.convertSpeedToPace(Number(dataExtensionElement.textContent));
                    break;
                }
            }
            return returnValue;
        },
    },
    {
        dataType: data_power_1.DataPower.type,
        getSampleValue: function (trackPointsElement) {
            var trackPointsElementChild = Array.from(trackPointsElement.children).find(function (trackPointsElementChild) {
                return trackPointsElementChild.tagName === 'Extensions';
            });
            if (!trackPointsElementChild) {
                return null;
            }
            var returnValue = null;
            for (var _i = 0, _a = trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children; _i < _a.length; _i++) {
                var dataExtensionElement = _a[_i];
                if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Watts') {
                    returnValue = Number(dataExtensionElement.textContent);
                    break;
                }
            }
            return returnValue;
        },
    },
];
