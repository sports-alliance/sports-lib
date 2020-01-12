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
var findChildNode = function (fromNodeList, childNodeName) {
    var childNodeFound = Array.from(fromNodeList).find(function (childNode) {
        return (childNode.nodeName === childNodeName) || (childNode.nodeName.match(childNodeName) !== null);
    });
    return childNodeFound ? childNodeFound : null;
};
var findChildNodeValue = function (fromNodeList, childNodeName) {
    var _a, _b;
    var predicate = function (childNode) { return (childNode.nodeName === childNodeName)
        || (childNode.nodeName.match(childNodeName) !== null); };
    var value = (_b = (_a = Array.from(fromNodeList).find(predicate)) === null || _a === void 0 ? void 0 : _a.firstChild) === null || _b === void 0 ? void 0 : _b.nodeValue;
    value = value !== undefined ? value : null;
    return (value === null) ? value : Number(value);
};
var findTrackPointExtensionValue = function (childNodes, extensionName) {
    var trackPointsChild = findChildNode(childNodes, 'Extensions');
    if (!trackPointsChild) {
        return null;
    }
    var tpxChildNode = findChildNode(trackPointsChild.childNodes, new RegExp(/TPX$/));
    if (tpxChildNode) {
        var value = findChildNodeValue(tpxChildNode.childNodes, new RegExp(extensionName + '$'));
        return value !== null ? Number(value) : null;
    }
    return null;
};
exports.TCXSampleMapper = [
    {
        dataType: data_latitude_degrees_1.DataLatitudeDegrees.type,
        getSampleValue: function (trackPointsElement) {
            var positionChildNode = findChildNode(trackPointsElement.childNodes, 'Position');
            if (!positionChildNode) {
                return null;
            }
            return findChildNodeValue(positionChildNode.childNodes, 'LatitudeDegrees');
        },
    },
    {
        dataType: data_longitude_degrees_1.DataLongitudeDegrees.type,
        getSampleValue: function (trackPointsElement) {
            var positionChildNode = findChildNode(trackPointsElement.childNodes, 'Position');
            if (!positionChildNode) {
                return null;
            }
            return findChildNodeValue(positionChildNode.childNodes, 'LongitudeDegrees');
        },
    },
    {
        dataType: data_distance_1.DataDistance.type,
        getSampleValue: function (trackPointsElement) {
            return findChildNodeValue(trackPointsElement.childNodes, 'DistanceMeters');
        },
    },
    {
        dataType: data_altitude_1.DataAltitude.type,
        getSampleValue: function (trackPointsElement) {
            return findChildNodeValue(trackPointsElement.childNodes, 'AltitudeMeters');
        },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        getSampleValue: function (trackPointsElement) {
            return findChildNodeValue(trackPointsElement.childNodes, 'Cadence');
        },
    },
    {
        dataType: data_heart_rate_1.DataHeartRate.type,
        getSampleValue: function (trackPointsElement) {
            var heartRateChildNode = findChildNode(trackPointsElement.childNodes, 'HeartRateBpm');
            if (!heartRateChildNode) {
                return null;
            }
            return findChildNodeValue(heartRateChildNode.childNodes, 'Value');
        },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        getSampleValue: function (trackPointsElement) {
            return findTrackPointExtensionValue(trackPointsElement.childNodes, 'RunCadence');
        },
    },
    {
        dataType: data_speed_1.DataSpeed.type,
        getSampleValue: function (trackPointsElement) {
            return findTrackPointExtensionValue(trackPointsElement.childNodes, 'Speed');
        },
    },
    {
        dataType: data_pace_1.DataPace.type,
        getSampleValue: function (trackPointsElement) {
            var speed = findTrackPointExtensionValue(trackPointsElement.childNodes, 'Speed');
            return (speed !== null) ? helpers_1.convertSpeedToPace(speed) : null;
        },
    },
    {
        dataType: data_power_1.DataPower.type,
        getSampleValue: function (trackPointsElement) {
            return findTrackPointExtensionValue(trackPointsElement.childNodes, 'Watts');
        },
    },
];
