"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_latitude_degrees_1 = require("../../../../data/data.latitude-degrees");
var data_altitude_1 = require("../../../../data/data.altitude");
var data_heart_rate_1 = require("../../../../data/data.heart-rate");
var data_cadence_1 = require("../../../../data/data.cadence");
var data_temperature_1 = require("../../../../data/data.temperature");
var data_distance_1 = require("../../../../data/data.distance");
var data_sea_level_pressure_1 = require("../../../../data/data.sea-level-pressure");
var data_speed_1 = require("../../../../data/data.speed");
var data_pace_1 = require("../../../../data/data.pace");
var data_vertical_speed_1 = require("../../../../data/data.vertical-speed");
var data_power_1 = require("../../../../data/data.power");
var data_longitude_degrees_1 = require("../../../../data/data.longitude-degrees");
var helpers_1 = require("../../../utilities/helpers");
exports.GPXSampleMapper = [
    {
        dataType: data_latitude_degrees_1.DataLatitudeDegrees.type,
        getSampleValue: function (sample) { return Number(sample.lat); },
    },
    {
        dataType: data_longitude_degrees_1.DataLongitudeDegrees.type,
        getSampleValue: function (sample) { return Number(sample.lon); },
    },
    {
        dataType: data_altitude_1.DataAltitude.type,
        getSampleValue: function (sample) { return sample.ele ? Number(sample.ele[0]) : null; },
    },
    {
        dataType: data_heart_rate_1.DataHeartRate.type,
        getSampleValue: function (sample) {
            // debugger;
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].heartrate && helpers_1.isNumberOrString(sample.extensions[0].heartrate[0])) {
                return Number(sample.extensions[0].heartrate[0]);
            }
            if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].hr) {
                return Number(sample.extensions[0].TrackPointExtension[0].hr[0]);
            }
            return null;
        },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        getSampleValue: function (sample) {
            // debugger;
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].cadence && helpers_1.isNumberOrString(sample.extensions[0].cadence[0])) {
                return Number(sample.extensions[0].cadence[0]);
            }
            if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].cad) {
                return Number(sample.extensions[0].TrackPointExtension[0].cad[0]);
            }
            return null;
        },
    },
    {
        dataType: data_temperature_1.DataTemperature.type,
        getSampleValue: function (sample) {
            // debugger;
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].temp && helpers_1.isNumberOrString(sample.extensions[0].temp[0])) {
                return Number(sample.extensions[0].temp[0]);
            }
            if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].atemp) {
                return Number(sample.extensions[0].TrackPointExtension[0].atemp[0]);
            }
            return null;
        },
    },
    {
        dataType: data_distance_1.DataDistance.type,
        getSampleValue: function (sample) {
            // debugger;
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].distance && helpers_1.isNumberOrString(sample.extensions[0].distance[0])) {
                return Number(sample.extensions[0].distance[0]);
            }
            return null;
        },
    },
    {
        dataType: data_sea_level_pressure_1.DataSeaLevelPressure.type,
        getSampleValue: function (sample) {
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].seaLevelPressure && helpers_1.isNumberOrString(sample.extensions[0].seaLevelPressure[0])) {
                return Number(sample.extensions[0].seaLevelPressure[0]);
            }
            return null;
        },
    },
    {
        dataType: data_speed_1.DataSpeed.type,
        getSampleValue: function (sample) {
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].speed && helpers_1.isNumberOrString(sample.extensions[0].speed[0])) {
                return Number(sample.extensions[0].speed[0]);
            }
            return null;
        },
    },
    {
        dataType: data_pace_1.DataPace.type,
        getSampleValue: function (sample) {
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].speed && helpers_1.isNumberOrString(sample.extensions[0].speed[0])) {
                return Number(helpers_1.convertSpeedToPace(sample.extensions[0].speed[0]));
            }
            return null;
        },
    },
    {
        dataType: data_vertical_speed_1.DataVerticalSpeed.type,
        getSampleValue: function (sample) {
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].verticalSpeed && helpers_1.isNumberOrString(sample.extensions[0].verticalSpeed[0])) {
                return Number(sample.extensions[0].verticalSpeed[0]);
            }
            return null;
        },
    },
    {
        dataType: data_power_1.DataPower.type,
        getSampleValue: function (sample) {
            if (!sample.extensions || !sample.extensions.length) {
                return null;
            }
            if (sample.extensions[0].power && helpers_1.isNumberOrString(sample.extensions[0].power[0])) {
                return Number(sample.extensions[0].power[0]);
            }
            return null;
        },
    },
];
