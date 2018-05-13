"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../../event");
var activity_1 = require("../../../../activities/activity");
var lap_1 = require("../../../../laps/lap");
var point_1 = require("../../../../points/point");
var data_altitude_1 = require("../../../../data/data.altitude");
var data_cadence_1 = require("../../../../data/data.cadence");
var data_heart_rate_1 = require("../../../../data/data.heart-rate");
var data_speed_1 = require("../../../../data/data.speed");
var data_latitude_degrees_1 = require("../../../../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../../../../data/data.longitude-degrees");
var data_temperature_1 = require("../../../../data/data.temperature");
var creator_1 = require("../../../../creators/creator");
var activity_types_1 = require("../../../../activities/activity.types");
var data_duration_1 = require("../../../../data/data.duration");
var data_energy_1 = require("../../../../data/data.energy");
var data_distance_1 = require("../../../../data/data.distance");
var data_vertical_speed_1 = require("../../../../data/data.vertical-speed");
var importer_fit_garmin_device_names_1 = require("./importer.fit.garmin.device.names");
var importer_fit_suunto_device_names_1 = require("./importer.fit.suunto.device.names");
var importer_fit_swift_device_names_1 = require("./importer.fit.swift.device.names");
var data_pause_1 = require("../../../../data/data.pause");
var event_utilities_1 = require("../../../utilities/event.utilities");
var data_cadence_avg_1 = require("../../../../data/data.cadence-avg");
var data_power_avg_1 = require("../../../../data/data.power-avg");
var data_speed_avg_1 = require("../../../../data/data.speed-avg");
var data_cadence_max_1 = require("../../../../data/data.cadence-max");
var data_power_max_1 = require("../../../../data/data.power-max");
var data_ascent_1 = require("../../../../data/data.ascent");
var data_descent_1 = require("../../../../data/data.descent");
var data_heart_rate_avg_1 = require("../../../../data/data.heart-rate-avg");
var data_heart_rate_max_1 = require("../../../../data/data.heart-rate-max");
var data_speed_max_1 = require("../../../../data/data.speed-max");
var data_power_1 = require("../../../../data/data.power");
var lap_types_1 = require("../../../../laps/lap.types");
var EasyFit = require('easy-fit');
var EventImporterFIT = /** @class */ (function () {
    function EventImporterFIT() {
    }
    EventImporterFIT.getFromArrayBuffer = function (arrayBuffer, name) {
        var _this = this;
        if (name === void 0) { name = 'New Event'; }
        return new Promise(function (resolve, reject) {
            debugger;
            var easyFitParser = new EasyFit({
                force: false,
                speedUnit: 'm/s',
                lengthUnit: 'm',
                temperatureUnit: 'celsius',
                elapsedRecordField: false,
                mode: 'cascade',
            });
            easyFitParser.parse(arrayBuffer, function (error, fitDataObject) {
                debugger;
                // Create an event
                var event = new event_1.Event(name);
                // Iterate over the sessions and create their activities
                fitDataObject.activity.sessions.forEach(function (sessionObject) {
                    // Get the activity from the sessionObject
                    var activity = _this.getActivityFromSessionObject(sessionObject, fitDataObject);
                    // Go over the laps
                    sessionObject.laps.forEach(function (sessionLapObject) {
                        // Get and add the lap to the activity
                        var lap = _this.getLapFromSessionLapObject(sessionLapObject);
                        // Go over the records and add the points to the activity
                        sessionLapObject.records.forEach(function (sessionLapObjectRecord) {
                            var point = _this.getPointFromSessionLapObjectRecord(sessionLapObjectRecord);
                            activity.addPoint(point);
                        });
                        // Add the lap to the activity
                        activity.addLap(lap);
                    });
                    event.addActivity(activity);
                });
                // Set the totals for the event
                event.setDuration(new data_duration_1.DataDuration(event.getActivities().reduce(function (duration, activity) { return activity.getDuration().getValue(); }, 0)));
                event.setDistance(new data_distance_1.DataDistance(event.getActivities().reduce(function (duration, activity) { return activity.getDistance() ? activity.getDistance().getValue() : 0; }, 0)));
                event.setPause(new data_pause_1.DataPause(event.getActivities().reduce(function (duration, activity) { return activity.getPause().getValue(); }, 0)));
                event_utilities_1.EventUtilities.generateStats(event);
                resolve(event);
            });
        });
    };
    EventImporterFIT.getPointFromSessionLapObjectRecord = function (sessionLapObjectRecord) {
        var point = new point_1.Point(sessionLapObjectRecord.timestamp);
        // Add Lat
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.position_lat)) {
            point.addData(new data_latitude_degrees_1.DataLatitudeDegrees(sessionLapObjectRecord.position_lat));
        }
        // Add long
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.position_long)) {
            point.addData(new data_longitude_degrees_1.DataLongitudeDegrees(sessionLapObjectRecord.position_long));
        }
        // Add HR
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.heart_rate)) {
            point.addData(new data_heart_rate_1.DataHeartRate(sessionLapObjectRecord.heart_rate));
        }
        // Add Altitude
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.altitude)) {
            point.addData(new data_altitude_1.DataAltitude(sessionLapObjectRecord.altitude));
        }
        // Add Cadence
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.cadence)) {
            var cadenceValue = sessionLapObjectRecord.cadence;
            // Add the fractional cadence if it's there
            if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.fractional_cadence)) {
                cadenceValue += sessionLapObjectRecord.fractional_cadence;
            }
            point.addData(new data_cadence_1.DataCadence(cadenceValue));
        }
        // Add Speed
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.speed)) {
            point.addData(new data_speed_1.DataSpeed(sessionLapObjectRecord.speed));
        }
        // Add Vertical Speed
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.vertical_speed)) {
            point.addData(new data_vertical_speed_1.DataVerticalSpeed(sessionLapObjectRecord.vertical_speed));
        }
        // Add Power
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.power)) {
            point.addData(new data_power_1.DataPower(sessionLapObjectRecord.power));
        }
        // Add Temperature
        if (event_utilities_1.isNumberOrString(sessionLapObjectRecord.temperature)) {
            point.addData(new data_temperature_1.DataTemperature(sessionLapObjectRecord.temperature));
        }
        return point;
    };
    EventImporterFIT.getLapFromSessionLapObject = function (sessionLapObject) {
        var lap = new lap_1.Lap(sessionLapObject.start_time, sessionLapObject.timestamp || new Date(sessionLapObject.start_time.getTime() + sessionLapObject.total_elapsed_time * 1000), // Some dont have a timestamp
        lap_types_1.LapTypes[sessionLapObject.lap_trigger]);
        // Set the calories
        if (sessionLapObject.total_calories) {
            lap.addStat(new data_energy_1.DataEnergy(sessionLapObject.total_calories));
        }
        // Add stats to the lap
        this.getStatsFromObject(sessionLapObject).forEach(function (stat) { return lap.addStat(stat); });
        return lap;
    };
    EventImporterFIT.getActivityFromSessionObject = function (sessionObject, fitDataObject) {
        // Create an activity
        var activity = new activity_1.Activity(sessionObject.start_time, sessionObject.timestamp || new Date(sessionObject.start_time.getTime() + sessionObject.total_elapsed_time * 1000), this.getActivityTypeFromSessionObject(sessionObject), this.getCreatorFromFitDataObject(fitDataObject));
        // Set the activity stats
        this.getStatsFromObject(sessionObject).forEach(function (stat) { return activity.addStat(stat); });
        return activity;
    };
    EventImporterFIT.getActivityTypeFromSessionObject = function (session) {
        if (session.sub_sport !== 'generic') {
            return activity_types_1.ActivityTypes[session.sub_sport] || activity_types_1.ActivityTypes[session.sport] || activity_types_1.ActivityTypes['unknown'];
        }
        return activity_types_1.ActivityTypes[session.sport] || activity_types_1.ActivityTypes['unknown'];
    };
    EventImporterFIT.getStatsFromObject = function (object) {
        var stats = [];
        // Set the duration which is the moving time
        stats.push(new data_duration_1.DataDuration(object.total_timer_time));
        // Set the pause which is elapsed time - moving time (timer_time)
        // There is although an exception for Zwift devices that have these fields vise versa
        var pause = object.total_elapsed_time > object.total_timer_time ?
            object.total_elapsed_time - object.total_timer_time :
            object.total_timer_time - object.total_elapsed_time;
        stats.push(new data_pause_1.DataPause(pause));
        // Set the distance @todo check on other importers for this logic
        if (event_utilities_1.isNumberOrString(object.total_distance)) {
            stats.push(new data_distance_1.DataDistance(object.total_distance));
        }
        else {
            stats.push(new data_distance_1.DataDistance(0));
        }
        if (event_utilities_1.isNumberOrString(object.avg_heart_rate)) {
            stats.push(new data_heart_rate_avg_1.DataHeartRateAvg(object.avg_heart_rate));
        }
        if (event_utilities_1.isNumberOrString(object.max_heart_rate)) {
            stats.push(new data_heart_rate_max_1.DataHeartRateMax(object.max_heart_rate));
        }
        if (event_utilities_1.isNumberOrString(object.avg_cadence)) {
            stats.push(new data_cadence_avg_1.DataCadenceAvg(object.avg_cadence));
        }
        if (event_utilities_1.isNumberOrString(object.max_cadence)) {
            stats.push(new data_cadence_max_1.DataCadenceMax(object.max_cadence));
        }
        if (event_utilities_1.isNumberOrString(object.avg_power)) {
            stats.push(new data_power_avg_1.DataPowerAvg(object.avg_power));
        }
        if (event_utilities_1.isNumberOrString(object.max_power)) {
            stats.push(new data_power_max_1.DataPowerMax(object.max_power));
        }
        if (event_utilities_1.isNumberOrString(object.avg_speed)) {
            stats.push(new data_speed_avg_1.DataSpeedAvg(object.avg_speed));
        }
        if (event_utilities_1.isNumberOrString(object.max_speed)) {
            stats.push(new data_speed_max_1.DataSpeedMax(object.max_speed));
        }
        if (event_utilities_1.isNumberOrString(object.total_ascent)) {
            stats.push(new data_ascent_1.DataAscent(object.total_ascent));
        }
        if (event_utilities_1.isNumberOrString(object.total_descent)) {
            stats.push(new data_descent_1.DataDescent(object.total_descent));
        }
        if (event_utilities_1.isNumberOrString(object.total_calories)) {
            stats.push(new data_energy_1.DataEnergy(object.total_calories));
        }
        return stats;
    };
    EventImporterFIT.getCreatorFromFitDataObject = function (fitDataObject) {
        var creator;
        switch (fitDataObject.file_id.manufacturer) {
            case 'suunto': {
                creator = new creator_1.Creator(importer_fit_suunto_device_names_1.ImporterFitSuuntoDeviceNames[fitDataObject.file_id.product]);
                break;
            }
            case 'garmin': {
                creator = new creator_1.Creator(importer_fit_garmin_device_names_1.ImporterFitGarminDeviceNames[fitDataObject.file_id.product]);
                break;
            }
            case 'zwift': {
                creator = new creator_1.Creator(importer_fit_swift_device_names_1.ImporterZwiftDeviceNames[fitDataObject.file_id.product]);
                break;
            }
            default: {
                creator = new creator_1.Creator((fitDataObject.file_id.manufacturer || 'Invalid Manufacturer')
                    + ' (' + (fitDataObject.file_id.product || 'no model') + ')');
            }
        }
        if (fitDataObject.file_creator && event_utilities_1.isNumberOrString(fitDataObject.file_creator.hardware_version)) {
            creator.hwInfo = String(fitDataObject.file_creator.hardware_version);
        }
        if (fitDataObject.file_creator && event_utilities_1.isNumberOrString(fitDataObject.file_creator.software_version)) {
            creator.swInfo = String(fitDataObject.file_creator.software_version);
        }
        else if (fitDataObject.device_info && event_utilities_1.isNumberOrString(fitDataObject.device_info.software_version)) {
            creator.swInfo = String(fitDataObject.device_info.software_version);
        }
        if (fitDataObject.file_id && event_utilities_1.isNumberOrString(fitDataObject.file_id.serial_number)) {
            creator.serialNumber = fitDataObject.file_id.serial_number;
        }
        else if (fitDataObject.device_info && event_utilities_1.isNumberOrString(fitDataObject.device_info.serial_number)) {
            creator.serialNumber = fitDataObject.device_info.serial_number;
        }
        return creator;
    };
    return EventImporterFIT;
}());
exports.EventImporterFIT = EventImporterFIT;
