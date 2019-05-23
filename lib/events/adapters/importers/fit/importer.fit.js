"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../../event");
var activity_1 = require("../../../../activities/activity");
var lap_1 = require("../../../../laps/lap");
var creator_1 = require("../../../../creators/creator");
var activity_types_1 = require("../../../../activities/activity.types");
var data_duration_1 = require("../../../../data/data.duration");
var data_energy_1 = require("../../../../data/data.energy");
var data_distance_1 = require("../../../../data/data.distance");
var importer_fit_garmin_device_names_1 = require("./importer.fit.garmin.device.names");
var importer_fit_suunto_device_names_1 = require("./importer.fit.suunto.device.names");
var importer_fit_swift_device_names_1 = require("./importer.fit.swift.device.names");
var data_pause_1 = require("../../../../data/data.pause");
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
var lap_types_1 = require("../../../../laps/lap.types");
var data_pace_avg_1 = require("../../../../data/data.pace-avg");
var data_pace_max_1 = require("../../../../data/data.pace-max");
var data_heart_rate_min_1 = require("../../../../data/data.heart-rate-min");
var data_power_min_1 = require("../../../../data/data.power-min");
var data_pace_min_1 = require("../../../../data/data.pace-min");
var data_total_training_effect_1 = require("../../../../data/data.total-training-effect");
var importer_fit_mapper_1 = require("./importer.fit.mapper");
var helpers_1 = require("../../../utilities/helpers");
var event_utilities_1 = require("../../../utilities/event.utilities");
var ibi_stream_1 = require("../../../../streams/ibi-stream");
var device_1 = require("../../../../activities/devices/device");
var importer_fit_ant_plus_device_names_1 = require("./importer.fit.ant-plus.device.names");
var FitFileParser = require('fit-file-parser').default;
var EventImporterFIT = /** @class */ (function () {
    function EventImporterFIT() {
    }
    EventImporterFIT.getFromArrayBuffer = function (arrayBuffer, name) {
        var _this = this;
        if (name === void 0) { name = 'New Event'; }
        return new Promise(function (resolve, reject) {
            var fitFileParser = new FitFileParser({
                force: false,
                speedUnit: 'm/s',
                lengthUnit: 'm',
                temperatureUnit: 'celsius',
                elapsedRecordField: false,
                mode: 'both',
            });
            fitFileParser.parse(arrayBuffer, function (error, fitDataObject) {
                debugger;
                // Iterate over the sessions and create their activities
                var activities = fitDataObject.activity.sessions.map(function (sessionObject) {
                    // Get the activity from the sessionObject
                    var activity = _this.getActivityFromSessionObject(sessionObject, fitDataObject);
                    // Go over the laps
                    sessionObject.laps.forEach(function (sessionLapObject) {
                        activity.addLap(_this.getLapFromSessionLapObject(sessionLapObject));
                    });
                    var samples = sessionObject.laps.reduce(function (lapSamplesArray, sessionLapObject) {
                        lapSamplesArray.push.apply(lapSamplesArray, sessionLapObject.records);
                        return lapSamplesArray;
                    }, []);
                    samples = samples.length ? samples : fitDataObject.records;
                    importer_fit_mapper_1.FITSampleMapper.forEach(function (sampleMapping) {
                        var subjectSamples = samples.filter(function (sample) { return helpers_1.isNumber(sampleMapping.getSampleValue(sample)); });
                        if (subjectSamples.length) {
                            activity.addStream(activity.createStream(sampleMapping.dataType));
                            subjectSamples.forEach(function (subjectSample) {
                                activity.addDataToStream(sampleMapping.dataType, (new Date(subjectSample.timestamp)), sampleMapping.getSampleValue(subjectSample));
                            });
                        }
                    });
                    return activity;
                });
                // If there are no activities to parse ....
                if (!activities.length) {
                    var activity_2 = new activity_1.Activity(new Date(fitDataObject.records[0].timestamp), new Date(fitDataObject.records[fitDataObject.records.length - 1].timestamp), activity_types_1.ActivityTypes.unknown, _this.getCreatorFromFitDataObject(fitDataObject));
                    importer_fit_mapper_1.FITSampleMapper.forEach(function (sampleMapping) {
                        var subjectSamples = fitDataObject.records.filter(function (sample) { return helpers_1.isNumber(sampleMapping.getSampleValue(sample)); });
                        if (subjectSamples.length) {
                            activity_2.addStream(activity_2.createStream(sampleMapping.dataType));
                            subjectSamples.forEach(function (subjectSample) {
                                activity_2.addDataToStream(sampleMapping.dataType, (new Date(subjectSample.timestamp)), sampleMapping.getSampleValue(subjectSample));
                            });
                        }
                    });
                    activities.push(activity_2);
                }
                // Get the HRV to IBI if exist
                if (fitDataObject.hrv && fitDataObject.hrv.length) {
                    activities.forEach(function (activity) {
                        var timeSum = 0;
                        var ibiData = fitDataObject.hrv
                            .reduce(function (ibiArray, hrvRecord) { return ibiArray.concat(hrvRecord.time); }, [])
                            .map(function (ibi) { return ibi * 1000; })
                            .filter(function (ibi) {
                            // debugger;
                            // Some Garmin devices return a record of 65.535 (65535) for some reason so exlcude those
                            if (ibi === 65535) {
                                // timeSum += ibi;
                                return false;
                            }
                            timeSum += ibi;
                            var ibiDataDate = new Date(activities[0].startDate.getTime() + timeSum);
                            return ibiDataDate >= activity.startDate && ibiDataDate <= activity.endDate;
                        });
                        // set the IBI
                        activity.addStream(new ibi_stream_1.IBIStream(ibiData));
                    });
                }
                // Parse the device infos
                if (fitDataObject.device_infos && fitDataObject.device_infos.length) {
                    activities.forEach(function (activity) {
                        activity.creator.devices = _this.getDeviceInfos(fitDataObject.device_infos);
                    });
                }
                // Create an event
                // @todo check if the start and end date can derive from the file
                var event = new event_1.Event(name, activities[0].startDate, activities[activities.length - 1].endDate);
                activities.forEach(function (activity) { return event.addActivity(activity); });
                // debugger;
                event_utilities_1.EventUtilities.generateStatsForAll(event);
                resolve(event);
            });
        });
    };
    EventImporterFIT.getDeviceInfos = function (deviceInfos) {
        return deviceInfos.map(function (deviceInfo) {
            var device = new device_1.Device(deviceInfo.device_type);
            device.index = deviceInfo.device_index;
            device.name = importer_fit_ant_plus_device_names_1.ImporterFitAntPlusDeviceNames[deviceInfo.ant_device_number] || deviceInfo.ant_device_number;
            device.batteryStatus = deviceInfo.battery_status;
            device.batteryVoltage = deviceInfo.battery_voltage;
            device.manufacturer = deviceInfo.manufacturer;
            device.serialNumber = deviceInfo.serial_number;
            device.product = deviceInfo.product;
            device.swInfo = deviceInfo.software_version;
            device.hwInfo = deviceInfo.hardware_version;
            device.antDeviceNumber = deviceInfo.ant_device_number;
            device.antTransmissionType = deviceInfo.ant_transmission_type;
            device.antNetwork = deviceInfo.ant_network;
            device.sourceType = deviceInfo.source_type;
            device.cumOperatingTime = deviceInfo.cum_operating_time;
            return device;
        });
    };
    EventImporterFIT.getLapFromSessionLapObject = function (sessionLapObject) {
        var lap = new lap_1.Lap(sessionLapObject.start_time, sessionLapObject.timestamp || new Date(sessionLapObject.start_time.getTime() + sessionLapObject.total_elapsed_time * 1000), // Some dont have a timestamp
        lap_types_1.LapTypes[sessionLapObject.lap_trigger] || lap_types_1.LapTypes.unknown);
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
        if (session.sub_sport && session.sub_sport !== 'generic') {
            return activity_types_1.ActivityTypes[session.sub_sport] || activity_types_1.ActivityTypes[session.sport] || activity_types_1.ActivityTypes.unknown;
        }
        return activity_types_1.ActivityTypes[session.sport] || activity_types_1.ActivityTypes.unknown;
    };
    EventImporterFIT.getStatsFromObject = function (object) {
        var stats = [];
        // Set the duration which is the moving time
        var totalTimerTime = object.total_timer_time ? object.total_timer_time : (object.timestamp - object.start_time) / 1000;
        stats.push(new data_duration_1.DataDuration(totalTimerTime));
        // Set the pause which is elapsed time - moving time (timer_time)
        // There is although an exception for Zwift devices that have these fields vise versa
        var pause = (object.total_elapsed_time > totalTimerTime ?
            object.total_elapsed_time - totalTimerTime :
            totalTimerTime - object.total_elapsed_time) || 0;
        stats.push(new data_pause_1.DataPause(pause));
        // Set the distance @todo check on other importers for this logic
        if (helpers_1.isNumberOrString(object.total_distance)) {
            stats.push(new data_distance_1.DataDistance(object.total_distance));
        }
        else {
            stats.push(new data_distance_1.DataDistance(0));
        }
        if (helpers_1.isNumberOrString(object.avg_heart_rate)) {
            stats.push(new data_heart_rate_avg_1.DataHeartRateAvg(object.avg_heart_rate));
        }
        if (helpers_1.isNumberOrString(object.min_heart_rate)) {
            stats.push(new data_heart_rate_min_1.DataHeartRateMin(object.min_heart_rate));
        }
        if (helpers_1.isNumberOrString(object.max_heart_rate)) {
            stats.push(new data_heart_rate_max_1.DataHeartRateMax(object.max_heart_rate));
        }
        if (helpers_1.isNumberOrString(object.avg_cadence)) {
            stats.push(new data_cadence_avg_1.DataCadenceAvg(object.avg_cadence));
        }
        if (helpers_1.isNumberOrString(object.min_cadence)) {
            stats.push(new data_cadence_avg_1.DataCadenceAvg(object.avg_cadence));
        }
        if (helpers_1.isNumberOrString(object.max_cadence)) {
            stats.push(new data_cadence_max_1.DataCadenceMax(object.max_cadence));
        }
        if (helpers_1.isNumberOrString(object.avg_power)) {
            stats.push(new data_power_avg_1.DataPowerAvg(object.avg_power));
        }
        if (helpers_1.isNumberOrString(object.min_power)) {
            stats.push(new data_power_min_1.DataPowerMin(object.min_power));
        }
        if (helpers_1.isNumberOrString(object.max_power)) {
            stats.push(new data_power_max_1.DataPowerMax(object.max_power));
        }
        if (helpers_1.isNumberOrString(object.avg_speed)) {
            stats.push(new data_speed_avg_1.DataSpeedAvg(object.avg_speed));
            stats.push(new data_pace_avg_1.DataPaceAvg(helpers_1.convertSpeedToPace(object.avg_speed)));
        }
        if (helpers_1.isNumberOrString(object.min_speed)) {
            stats.push(new data_speed_avg_1.DataSpeedAvg(object.min_speed));
            stats.push(new data_pace_min_1.DataPaceMin(helpers_1.convertSpeedToPace(object.min_speed)));
        }
        if (helpers_1.isNumberOrString(object.max_speed)) {
            stats.push(new data_speed_max_1.DataSpeedMax(object.max_speed));
            stats.push(new data_pace_max_1.DataPaceMax(helpers_1.convertSpeedToPace(object.max_speed)));
        }
        if (helpers_1.isNumberOrString(object.total_ascent)) {
            stats.push(new data_ascent_1.DataAscent(object.total_ascent));
        }
        if (helpers_1.isNumberOrString(object.total_descent)) {
            stats.push(new data_descent_1.DataDescent(object.total_descent));
        }
        if (helpers_1.isNumberOrString(object.total_calories)) {
            stats.push(new data_energy_1.DataEnergy(object.total_calories));
        }
        if (helpers_1.isNumberOrString(object.total_training_effect)) {
            stats.push(new data_total_training_effect_1.DataTotalTrainingEffect(object.total_training_effect));
        }
        return stats;
    };
    EventImporterFIT.getCreatorFromFitDataObject = function (fitDataObject) {
        var creator;
        switch (fitDataObject.file_id.manufacturer) {
            case 'suunto': {
                creator = new creator_1.Creator(importer_fit_suunto_device_names_1.ImporterFitSuuntoDeviceNames[fitDataObject.file_id.product] || fitDataObject.file_id.product_name || 'Suunto Unknown');
                break;
            }
            case 'garmin': {
                creator = new creator_1.Creator(importer_fit_garmin_device_names_1.ImporterFitGarminDeviceNames[fitDataObject.file_id.product] || fitDataObject.file_id.product_name || 'Garmin Unknown');
                break;
            }
            case 'zwift': {
                creator = new creator_1.Creator(importer_fit_swift_device_names_1.ImporterZwiftDeviceNames[fitDataObject.file_id.product] || fitDataObject.file_id.product_name || 'Zwift Unknown');
                break;
            }
            default: {
                creator = new creator_1.Creator(fitDataObject.file_id.product_name || fitDataObject.file_id.product || 'Unknown');
            }
        }
        // debugger;
        if (fitDataObject.file_creator && helpers_1.isNumberOrString(fitDataObject.file_creator.hardware_version)) {
            creator.hwInfo = String(fitDataObject.file_creator.hardware_version);
        }
        if (fitDataObject.file_creator && helpers_1.isNumberOrString(fitDataObject.file_creator.software_version)) {
            creator.swInfo = String(fitDataObject.file_creator.software_version);
        }
        else if (fitDataObject.device_info && helpers_1.isNumberOrString(fitDataObject.device_info.software_version)) {
            creator.swInfo = String(fitDataObject.device_info.software_version);
        }
        if (fitDataObject.file_id && helpers_1.isNumberOrString(fitDataObject.file_id.serial_number)) {
            creator.serialNumber = fitDataObject.file_id.serial_number;
        }
        else if (fitDataObject.device_info && helpers_1.isNumberOrString(fitDataObject.device_info.serial_number)) {
            creator.serialNumber = fitDataObject.device_info.serial_number;
        }
        return creator;
    };
    return EventImporterFIT;
}());
exports.EventImporterFIT = EventImporterFIT;
