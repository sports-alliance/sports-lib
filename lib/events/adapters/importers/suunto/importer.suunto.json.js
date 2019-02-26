"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../../event");
var activity_1 = require("../../../../activities/activity");
var creator_1 = require("../../../../creators/creator");
var lap_1 = require("../../../../laps/lap");
var data_altitude_1 = require("../../../../data/data.altitude");
var data_cadence_1 = require("../../../../data/data.cadence");
var data_heart_rate_1 = require("../../../../data/data.heart-rate");
var data_speed_1 = require("../../../../data/data.speed");
var data_vertical_speed_1 = require("../../../../data/data.vertical-speed");
var data_temperature_1 = require("../../../../data/data.temperature");
var data_sea_level_pressure_1 = require("../../../../data/data.sea-level-pressure");
var data_latitude_degrees_1 = require("../../../../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../../../../data/data.longitude-degrees");
var data_power_1 = require("../../../../data/data.power");
var data_altitude_gps_1 = require("../../../../data/data.altitude-gps");
var data_absolute_pressure_1 = require("../../../../data/data.absolute-pressure");
var data_ehpe_1 = require("../../../../data/data.ehpe");
var data_evpe_1 = require("../../../../data/data.evpe");
var data_number_of_satellites_1 = require("../../../../data/data.number-of-satellites");
var data_satellite_5_best_snr_1 = require("../../../../data/data.satellite-5-best-snr");
var intensity_zones_1 = require("../../../../intensity-zones/intensity-zones");
var data_ibi_1 = require("../../../../data/ibi/data.ibi");
var importer_suunto_activity_ids_1 = require("./importer.suunto.activity.ids");
var importer_suunto_device_names_1 = require("./importer.suunto.device.names");
var data_duration_1 = require("../../../../data/data.duration");
var data_altitude_max_1 = require("../../../../data/data.altitude-max");
var data_distance_1 = require("../../../../data/data.distance");
var data_ascent_time_1 = require("../../../../data/data.ascent-time");
var data_descent_time_1 = require("../../../../data/data.descent-time");
var data_descent_1 = require("../../../../data/data.descent");
var data_ascent_1 = require("../../../../data/data.ascent");
var data_epoc_1 = require("../../../../data/data.epoc");
var data_energy_1 = require("../../../../data/data.energy");
var data_feeling_1 = require("../../../../data/data.feeling");
var data_peak_training_effect_1 = require("../../../../data/data.peak-training-effect");
var data_recovery_1 = require("../../../../data/data.recovery");
var data_vo2_max_1 = require("../../../../data/data.vo2-max");
var data_pause_1 = require("../../../../data/data.pause");
var data_heart_rate_avg_1 = require("../../../../data/data.heart-rate-avg");
var data_heart_rate_max_1 = require("../../../../data/data.heart-rate-max");
var data_heart_rate_min_1 = require("../../../../data/data.heart-rate-min");
var data_cadence_avg_1 = require("../../../../data/data.cadence-avg");
var data_cadence_max_1 = require("../../../../data/data.cadence-max");
var data_cadence_min_1 = require("../../../../data/data.cadence-min");
var data_power_avg_1 = require("../../../../data/data.power-avg");
var data_power_max_1 = require("../../../../data/data.power-max");
var data_power_min_1 = require("../../../../data/data.power-min");
var data_speed_avg_1 = require("../../../../data/data.speed-avg");
var data_speed_max_1 = require("../../../../data/data.speed-max");
var data_speed_min_1 = require("../../../../data/data.speed-min");
var data_temperature_avg_1 = require("../../../../data/data.temperature-avg");
var data_temperature_max_1 = require("../../../../data/data.temperature-max");
var data_temperature_min_1 = require("../../../../data/data.temperature-min");
var data_vertical_speed_avg_1 = require("../../../../data/data.vertical-speed-avg");
var data_vertical_speed_max_1 = require("../../../../data/data.vertical-speed-max");
var data_vertical_speed_min_1 = require("../../../../data/data.vertical-speed-min");
var data_altitude_avg_1 = require("../../../../data/data.altitude-avg");
var data_altitude_min_1 = require("../../../../data/data.altitude-min");
var data_fused_location_1 = require("../../../../data/data.fused-location");
var activity_types_1 = require("../../../../activities/activity.types");
var lap_types_1 = require("../../../../laps/lap.types");
var data_pace_avg_1 = require("../../../../data/data.pace-avg");
var data_pace_max_1 = require("../../../../data/data.pace-max");
var data_pace_min_1 = require("../../../../data/data.pace-min");
var data_fused_altitude_1 = require("../../../../data/data.fused-altitude");
var data_battery_charge_1 = require("../../../../data/data.battery-charge");
var data_battery_current_1 = require("../../../../data/data.battery-current");
var data_battery_voltage_1 = require("../../../../data/data.battery-voltage");
var helpers_1 = require("../../../utilities/helpers");
var event_utilities_1 = require("../../../utilities/event.utilities");
var data_alti_baro_profile_1 = require("../../../../data/data.alti-baro-profile");
var data_auto_lap_distance_1 = require("../../../../data/data.auto-lap-distance");
var data_auto_lap_duration_1 = require("../../../../data/data.auto-lap-duration");
var data_auto_pause_used_1 = require("../../../../data/data.auto-pause-used");
var data_bike_pod_used_1 = require("../../../../data/data.bike-pod-used");
var data_enabled_navigation_systems_1 = require("../../../../data/data.enabled-navigation-systems");
var data_foot_pod_used_1 = require("../../../../data/data.foot-pod-used");
var data_heart_rate_used_1 = require("../../../../data/data.heart-rate-used");
var data_power_pod_used_1 = require("../../../../data/data.power-pod-used");
var data_store_1 = require("../../../../data/data.store");
var ibi_stream_1 = require("../../../../streams/ibi-stream");
var EventImporterSuuntoJSON = /** @class */ (function () {
    function EventImporterSuuntoJSON() {
    }
    EventImporterSuuntoJSON.getFromJSONString = function (jsonString) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var eventJSONObject = JSON.parse(jsonString);
            debugger;
            // Create a creator and pass it to all activities (later)
            var creator = new creator_1.Creator(importer_suunto_device_names_1.ImporterSuuntoDeviceNames[eventJSONObject.DeviceLog.Device.Name] // Try to get a listed name
                || eventJSONObject.DeviceLog.Device.Name);
            creator.serialNumber = eventJSONObject.DeviceLog.Device.SerialNumber;
            creator.hwInfo = eventJSONObject.DeviceLog.Device.Info.HW;
            creator.swInfo = eventJSONObject.DeviceLog.Device.Info.SW;
            // Go over the samples and get the ones with activity start times
            var activityStartEventSamples = eventJSONObject.DeviceLog.Samples.filter(function (sample) {
                return sample.Events && sample.Events[0] && sample.Events[0].Activity;
            });
            // Check if there is a Fused Altitude event
            var fusedAltitudeEventSamples = eventJSONObject.DeviceLog.Samples.filter(function (sample) {
                return sample.Events && sample.Events[0] && sample.Events[0].Altitude;
            });
            // Get the lap start events
            var lapEventSamples = eventJSONObject.DeviceLog.Samples.filter(function (sample) {
                return sample.Events && sample.Events[0] && sample.Events[0].Lap && sample.Events[0].Lap.Type !== 'Start' && sample.Events[0].Lap.Type !== 'Stop';
            });
            // Get the stop event
            var stopEventSample = eventJSONObject.DeviceLog.Samples.find(function (sample) {
                return sample.Events && sample.Events[0] && sample.Events[0].Lap && sample.Events[0].Lap.Type === 'Stop';
            });
            // Add the stop event to the laps since it's also a lap stop event
            if (stopEventSample) {
                lapEventSamples.push(stopEventSample);
            }
            // Get the activity windows
            var activityWindows = eventJSONObject.DeviceLog.Windows.filter(function (windowObj) {
                return windowObj.Window.Type === 'Activity';
            }).map(function (activityWindow) { return activityWindow.Window; });
            // Get the lap windows
            var lapWindows = eventJSONObject.DeviceLog.Windows.filter(function (windowObj) {
                return windowObj.Window.Type === 'Lap' || windowObj.Window.Type === 'Autolap';
            }).map(function (lapWindow) { return lapWindow.Window; });
            // Create the activities
            var activities = activityStartEventSamples.map(function (activityStartEventSample, index) {
                var activity = new activity_1.Activity(new Date(activityStartEventSample.TimeISO8601), activityStartEventSamples.length - 1 === index ?
                    new Date(stopEventSample ? stopEventSample.TimeISO8601 : eventJSONObject.DeviceLog.Header.TimeISO8601) :
                    new Date(activityStartEventSamples[index + 1].TimeISO8601), activity_types_1.ActivityTypes[importer_suunto_activity_ids_1.ImporterSuuntoActivityIds[activityStartEventSample.Events[0].Activity.ActivityType]], creator);
                // Set the end date to the stop event time if the activity is the last or the only one else set it on the next itery time
                // Create the stats these are a 1:1 ref arrays
                if (activityWindows[index]) {
                    _this.getStats(activityWindows[index]).forEach(function (stat) {
                        activity.addStat(stat);
                    });
                }
                // Add the pause from end date minurs start date and removing the duration as widows do not contain the pause time
                if (!activity.getDuration()) {
                    activity.setDuration(new data_duration_1.DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000));
                }
                activity.setPause(new data_pause_1.DataPause((activity.endDate.getTime() - activity.startDate.getTime()) / 1000 - activity.getDuration().getValue()));
                // Set the zones for the activity @todo fix
                _this.setIntensityZones(activity, eventJSONObject.DeviceLog.Header);
                // Add the fused altitude event
                if (fusedAltitudeEventSamples.length) {
                    activity.addStat(new data_fused_altitude_1.DataFusedAltitude(true));
                }
                return activity;
            });
            // set the start dates of all lap types to the start of the first activity
            var lapStartDatesByType = lapEventSamples.reduce(function (lapStartDatesByTypeObject, lapEventSample, index) {
                // If its a stop event then set the start date to the previous
                if (lapEventSample.Events[0].Lap.Type === 'Stop' && lapEventSamples.length > 1) {
                    lapStartDatesByTypeObject[lapEventSample.Events[0].Lap.Type] = new Date(lapEventSamples[index - 1].TimeISO8601);
                    return lapStartDatesByTypeObject;
                }
                lapStartDatesByTypeObject[lapEventSample.Events[0].Lap.Type] = activities[0].startDate;
                return lapStartDatesByTypeObject;
            }, {});
            var laps = lapEventSamples.reduce(function (lapArray, lapEventSample, index) {
                // if there is only one lap then skip it's the whole activity
                if (lapEventSamples.length === 1) {
                    return lapArray;
                }
                // Set the end date
                var lapEndDate = new Date(lapEventSample.TimeISO8601);
                // Set the start date.
                // Set it for the next run
                var lap = new lap_1.Lap(lapStartDatesByType[lapEventSample.Events[0].Lap.Type], lapEndDate, lap_types_1.LapTypes[lapEventSample.Events[0].Lap.Type]);
                lapStartDatesByType[lapEventSample.Events[0].Lap.Type] = lapEndDate;
                if (lapWindows[index]) {
                    _this.getStats(lapWindows[index]).forEach(function (stat) {
                        lap.addStat(stat);
                    });
                }
                // Add the pause from end date minurs start date and removing the duration as widows do not contain the pause time
                if (!lap.getDuration()) {
                    lap.setDuration(new data_duration_1.DataDuration((lap.endDate.getTime() - lap.startDate.getTime()) / 1000));
                }
                lap.setPause(new data_pause_1.DataPause((lap.endDate.getTime() - lap.startDate.getTime()) / 1000 - lap.getDuration().getValue()));
                lapArray.push(lap);
                return lapArray;
            }, []);
            // Add the laps to the belonging activity. If a lap starts or stops at the activity date delta then it belong to the acitvity
            // @todo move laps to event so we don't have cross border laps to acivities and decouple them
            activities.forEach(function (activity) {
                laps.filter(function (lap) {
                    // If the lap start belongs to the activity
                    if (lap.startDate <= activity.endDate && lap.startDate >= activity.startDate) {
                        return true;
                    }
                    // if the lap end belongs also...
                    if (lap.endDate >= activity.startDate && lap.endDate <= activity.endDate) {
                        return true;
                    }
                    return false;
                }).forEach(function (activityLap) {
                    activity.addLap(activityLap);
                });
            });
            // Add the samples that belong to the activity and the ibi data.
            activities.forEach(function (activity) {
                // Get the samples that belong to this activity
                var activitySamples = eventJSONObject
                    .DeviceLog
                    .Samples
                    .filter(function (sample) { return ((new Date(sample.TimeISO8601) >= activity.startDate) && (new Date(sample.TimeISO8601) <= activity.endDate)); });
                // debugger;
                // Check if there is fused Location
                activity.addStat(new data_fused_location_1.DataFusedLocation(false));
                activity.addStat(new data_fused_location_1.DataFusedLocation(activitySamples.filter(function (sample) { return _this.hasFusedLocData(sample); }).length > 0));
                // Should filter on type and create the samples
                _this.setStreamsForActivity(activity, activitySamples);
            });
            // Add the ibiData
            if (eventJSONObject.DeviceLog['R-R'] && eventJSONObject.DeviceLog['R-R'].Data) {
                // prepare the data array per activity removing the offset
                activities.forEach(function (activity) {
                    var timeSum = 0;
                    var ibiData = eventJSONObject.DeviceLog['R-R'].Data.filter(function (ibi) {
                        timeSum += ibi;
                        var ibiDataDate = new Date(activities[0].startDate.getTime() + timeSum);
                        return ibiDataDate >= activity.startDate && ibiDataDate <= activity.endDate;
                    });
                    // set the HR
                    // @todo perhaps create new 'types'
                    var existingHRStream = activity.getAllStreams().find(function (stream) { return stream.type === data_heart_rate_1.DataHeartRate.type; });
                    if (existingHRStream) {
                        activity.removeStream(existingHRStream);
                    }
                    _this.setStreamsForActivity(activity, _this.getHRSamplesFromIBIData(activity, ibiData));
                    debugger;
                    activity.addStream(new ibi_stream_1.IBIStream(ibiData));
                });
            }
            // Create an event
            // @todo check if start and end date can derive from the json
            var event = new event_1.Event('', activities[0].startDate, activities[activities.length - 1].endDate);
            activities.forEach(function (activity) { return event.addActivity(activity); });
            // Populate the event stats from the Header Object // @todo maybe remove
            _this.getStats(eventJSONObject.DeviceLog.Header).forEach(function (stat) {
                event.addStat(stat);
            });
            // Get the settings and add it to all activities as it's logical
            if (eventJSONObject.DeviceLog.Header.Settings) {
                _this.getSettings(eventJSONObject.DeviceLog.Header.Settings).forEach(function (stat) {
                    event.getActivities().forEach(function (activity) { return activity.addStat(stat); });
                });
            }
            // @todo see how we can have those event stats persisted as the below generation wipes those off.
            // Generate stats
            event_utilities_1.EventUtilities.generateStatsForAll(event);
            resolve(event);
        });
    };
    EventImporterSuuntoJSON.hasFusedLocData = function (sample) {
        return !!sample.Inertial || !!sample.GpsRef;
    };
    EventImporterSuuntoJSON.setIntensityZones = function (activity, object) {
        exports.SuuntoIntensityZonesMapper.forEach(function (intensityZonesMap) {
            if (!object[intensityZonesMap.sampleField]) {
                return;
            }
            var zones = new intensity_zones_1.IntensityZones(intensityZonesMap.dataType);
            zones.zone1Duration = object[intensityZonesMap.sampleField].Zone1Duration;
            zones.zone2Duration = object[intensityZonesMap.sampleField].Zone2Duration;
            zones.zone2LowerLimit = intensityZonesMap.convertSampleValue(object[intensityZonesMap.sampleField].Zone2LowerLimit);
            zones.zone3Duration = object[intensityZonesMap.sampleField].Zone3Duration;
            zones.zone3LowerLimit = intensityZonesMap.convertSampleValue(object[intensityZonesMap.sampleField].Zone3LowerLimit);
            zones.zone4Duration = object[intensityZonesMap.sampleField].Zone4Duration;
            zones.zone4LowerLimit = intensityZonesMap.convertSampleValue(object[intensityZonesMap.sampleField].Zone4LowerLimit);
            zones.zone5Duration = object[intensityZonesMap.sampleField].Zone5Duration;
            zones.zone5LowerLimit = intensityZonesMap.convertSampleValue(object[intensityZonesMap.sampleField].Zone5LowerLimit);
            activity.intensityZones.push(zones);
        });
    };
    EventImporterSuuntoJSON.getHRSamplesFromIBIData = function (activity, ibiData) {
        // activity.ibiData = new IBIData(ibiData);
        // @todo optimize
        // Create a second IBIData so we can have filtering on those with keeping the original
        var samples = [];
        (new data_ibi_1.IBIData(ibiData))
            .lowLimitBPMFilter()
            .highLimitBPMFilter()
            .movingMedianFilter()
            .lowPassFilter()
            .getAsBPM().forEach(function (value, key, map) {
            // const point = new Point(new Date(activity.startDate.getTime() + key));
            // point.addData(new DataHeartRate(value));
            samples.push({
                TimeISO8601: (new Date(activity.startDate.getTime() + key)).toISOString(),
                HR: value / 60,
            });
        });
        return samples;
    };
    EventImporterSuuntoJSON.setStreamsForActivity = function (activity, samples) {
        exports.SuuntoSampleMapper.forEach(function (sampleMapping) {
            var subjectSamples = samples.filter(function (sample) { return helpers_1.isNumberOrString(sample[sampleMapping.sampleField]); });
            if (subjectSamples.length) {
                activity.addStream(activity.createStream(sampleMapping.dataType));
                subjectSamples.forEach(function (subjectSample) {
                    activity.addDataToStream(sampleMapping.dataType, (new Date(subjectSample.TimeISO8601)), sampleMapping.convertSampleValue(subjectSample[sampleMapping.sampleField]));
                });
            }
        });
    };
    EventImporterSuuntoJSON.getSettings = function (settings) {
        var stats = [];
        exports.SuuntoSettingsMapper.forEach(function (settingsMapping) {
            if (settingsMapping.getValue(settings) !== null && settingsMapping.getValue(settings) !== undefined) {
                stats.push(data_store_1.DynamicDataLoader.getDataInstanceFromDataType(settingsMapping.dataType, settingsMapping.getValue(settings)));
            }
        });
        return stats;
    };
    // @todo convert this to a mapping as well
    EventImporterSuuntoJSON.getStats = function (object) {
        var stats = [];
        if (helpers_1.isNumber(object.Distance)) {
            stats.push(new data_distance_1.DataDistance(object.Distance));
        }
        if (helpers_1.isNumberOrString(object.AscentTime)) {
            stats.push(new data_ascent_time_1.DataAscentTime(object.AscentTime));
        }
        if (helpers_1.isNumberOrString(object.DescentTime)) {
            stats.push(new data_descent_time_1.DataDescentTime(object.DescentTime));
        }
        if (helpers_1.isNumberOrString(object.Ascent)) {
            stats.push(new data_ascent_1.DataAscent(object.Ascent));
        }
        if (helpers_1.isNumberOrString(object.Descent)) {
            stats.push(new data_descent_1.DataDescent(object.Descent));
        }
        if (helpers_1.isNumberOrString(object.EPOC)) {
            stats.push(new data_epoc_1.DataEPOC(object.EPOC));
        }
        if (helpers_1.isNumberOrString(object.Energy)) {
            stats.push(new data_energy_1.DataEnergy(object.Energy * 0.239 / 1000));
        }
        if (helpers_1.isNumberOrString(object.Feeling)) {
            stats.push(new data_feeling_1.DataFeeling(object.Feeling));
        }
        if (helpers_1.isNumberOrString(object.PeakTrainingEffect)) {
            stats.push(new data_peak_training_effect_1.DataPeakTrainingEffect(object.PeakTrainingEffect));
        }
        if (helpers_1.isNumberOrString(object.RecoveryTime)) {
            stats.push(new data_recovery_1.DataRecovery(object.RecoveryTime));
        }
        if (helpers_1.isNumberOrString(object.MAXVO2)) {
            stats.push(new data_vo2_max_1.DataVO2Max(object.MAXVO2));
        }
        var pauseDuration = 0;
        if (helpers_1.isNumberOrString(object.PauseDuration)) {
            pauseDuration = object.PauseDuration;
        }
        stats.push(new data_pause_1.DataPause(pauseDuration));
        stats.push(new data_duration_1.DataDuration(object.Duration - pauseDuration));
        // double case
        if (Array.isArray(object.Altitude)) {
            if (helpers_1.isNumber(object.Altitude[0].Avg)) {
                stats.push(new data_altitude_avg_1.DataAltitudeAvg(object.Altitude[0].Avg));
            }
            if (helpers_1.isNumber(object.Altitude[0].Max)) {
                stats.push(new data_altitude_max_1.DataAltitudeMax(object.Altitude[0].Max));
            }
            if (helpers_1.isNumber(object.Altitude[0].Min)) {
                stats.push(new data_altitude_min_1.DataAltitudeMin(object.Altitude[0].Min));
            }
        }
        else if (object.Altitude) {
            if (helpers_1.isNumber(object.Altitude.Max)) {
                stats.push(new data_altitude_max_1.DataAltitudeMax(object.Altitude.Max));
            }
            if (helpers_1.isNumber(object.Altitude.Min)) {
                stats.push(new data_altitude_min_1.DataAltitudeMin(object.Altitude.Min));
            }
        }
        if (object.HR) {
            if (helpers_1.isNumber(object.HR[0].Avg)) {
                stats.push(new data_heart_rate_avg_1.DataHeartRateAvg(object.HR[0].Avg * 60));
            }
            if (helpers_1.isNumber(object.HR[0].Max)) {
                stats.push(new data_heart_rate_max_1.DataHeartRateMax(object.HR[0].Max * 60));
            }
            if (helpers_1.isNumber(object.HR[0].Min)) {
                stats.push(new data_heart_rate_min_1.DataHeartRateMin(object.HR[0].Min * 60));
            }
        }
        if (object.Cadence) {
            if (helpers_1.isNumber(object.Cadence[0].Avg)) {
                stats.push(new data_cadence_avg_1.DataCadenceAvg(object.Cadence[0].Avg * 60));
            }
            if (helpers_1.isNumber(object.Cadence[0].Max)) {
                stats.push(new data_cadence_max_1.DataCadenceMax(object.Cadence[0].Max * 60));
            }
            if (helpers_1.isNumber(object.Cadence[0].Min)) {
                stats.push(new data_cadence_min_1.DataCadenceMin(object.Cadence[0].Min * 60));
            }
        }
        if (object.Power) {
            debugger;
            if (helpers_1.isNumber(object.Power[0].Avg)) {
                stats.push(new data_power_avg_1.DataPowerAvg(object.Power[0].Avg));
            }
            if (helpers_1.isNumber(object.Power[0].Max)) {
                stats.push(new data_power_max_1.DataPowerMax(object.Power[0].Max));
            }
            if (helpers_1.isNumber(object.Power[0].Min)) {
                stats.push(new data_power_min_1.DataPowerMin(object.Power[0].Min));
            }
        }
        if (object.Speed) {
            if (helpers_1.isNumber(object.Speed[0].Avg)) {
                stats.push(new data_speed_avg_1.DataSpeedAvg(object.Speed[0].Avg));
                stats.push(new data_pace_avg_1.DataPaceAvg(helpers_1.convertSpeedToPace(object.Speed[0].Avg)));
            }
            if (helpers_1.isNumber(object.Speed[0].Max)) {
                stats.push(new data_speed_max_1.DataSpeedMax(object.Speed[0].Max));
                stats.push(new data_pace_max_1.DataPaceMax(helpers_1.convertSpeedToPace(object.Speed[0].Max)));
            }
            if (helpers_1.isNumber(object.Speed[0].Min)) {
                stats.push(new data_speed_min_1.DataSpeedMin(object.Speed[0].Min));
                stats.push(new data_pace_min_1.DataPaceMin(helpers_1.convertSpeedToPace(object.Speed[0].Min)));
            }
        }
        if (object.Temperature) {
            if (helpers_1.isNumber(object.Temperature[0].Avg)) {
                stats.push(new data_temperature_avg_1.DataTemperatureAvg(object.Temperature[0].Avg - 273.15));
            }
            if (helpers_1.isNumber(object.Temperature[0].Max)) {
                stats.push(new data_temperature_max_1.DataTemperatureMax(object.Temperature[0].Max - 273.15));
            }
            if (object.Temperature[0].Min !== null) {
                stats.push(new data_temperature_min_1.DataTemperatureMin(object.Temperature[0].Min - 273.15));
            }
        }
        if (object.hasOwnProperty('VerticalSpeed')) {
            // Double action here
            if (Array.isArray(object.VerticalSpeed)) {
                if (helpers_1.isNumber(object.VerticalSpeed[0].Avg)) {
                    stats.push(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(object.VerticalSpeed[0].Avg));
                }
                if (helpers_1.isNumber(object.VerticalSpeed[0].Max)) {
                    stats.push(new data_vertical_speed_max_1.DataVerticalSpeedMax(object.VerticalSpeed[0].Max));
                }
                if (helpers_1.isNumber(object.VerticalSpeed[0].Min)) {
                    stats.push(new data_vertical_speed_min_1.DataVerticalSpeedMin(object.VerticalSpeed[0].Min));
                }
            }
            else {
                if (helpers_1.isNumber(object.VerticalSpeed)) {
                    stats.push(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(object.VerticalSpeed));
                }
            }
        }
        return stats;
    };
    return EventImporterSuuntoJSON;
}());
exports.EventImporterSuuntoJSON = EventImporterSuuntoJSON;
exports.SuuntoSettingsMapper = [
    {
        dataType: data_alti_baro_profile_1.DataAltiBaroProfile.type,
        getValue: function (settings) {
            return settings['AltiBaroProfile'];
        },
    },
    {
        dataType: data_auto_lap_distance_1.DataAutoLapDistance.type,
        getValue: function (settings) {
            if (!settings['AutoLap']) {
                return null;
            }
            return settings['AutoLap']['Distance'];
        },
    },
    {
        dataType: data_auto_lap_duration_1.DataAutoLapDuration.type,
        getValue: function (settings) {
            if (!settings['AutoLap']) {
                return null;
            }
            return settings['AutoLap']['Duration'];
        },
    },
    {
        dataType: data_auto_pause_used_1.DataAutoPauseUsed.type,
        getValue: function (settings) {
            if (!settings['AutoPause']) {
                return null;
            }
            return settings['AutoPause']['Enabled'];
        },
    },
    {
        dataType: data_bike_pod_used_1.DataBikePodUsed.type,
        getValue: function (settings) {
            return settings['BikePodUsed'];
        },
    },
    {
        dataType: data_enabled_navigation_systems_1.DataEnabledNavigationSystems.type,
        getValue: function (settings) {
            return settings['EnabledNavigationSystems'];
        },
    },
    {
        dataType: data_foot_pod_used_1.DataFootPodUsed.type,
        getValue: function (settings) {
            return settings['FootPodUsed'];
        },
    },
    // {
    //   dataType: DataFusedAltitude.type,
    //   getValue: (settings: any) => {
    //     return settings['FusedAltiUsed'];
    //   },
    // },
    {
        dataType: data_heart_rate_used_1.DataHeartRateUsed.type,
        getValue: function (settings) {
            return settings['HrUsed'];
        },
    },
    {
        dataType: data_power_pod_used_1.DataPowerPodUsed.type,
        getValue: function (settings) {
            return settings['PowerPodUsed'];
        },
    },
];
exports.SuuntoIntensityZonesMapper = [
    {
        dataType: data_heart_rate_1.DataHeartRate.type,
        sampleField: 'HrZones',
        convertSampleValue: function (value) { return Number(value * 60); },
    },
    {
        dataType: data_power_1.DataPower.type,
        sampleField: 'PowerZones',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_speed_1.DataSpeed.type,
        sampleField: 'SpeedZones',
        convertSampleValue: function (value) { return Number(value); },
    },
];
exports.SuuntoSampleMapper = [
    {
        dataType: data_latitude_degrees_1.DataLatitudeDegrees.type,
        sampleField: 'Latitude',
        convertSampleValue: function (value) { return Number(value * (180 / Math.PI)); },
    },
    {
        dataType: data_longitude_degrees_1.DataLongitudeDegrees.type,
        sampleField: 'Longitude',
        convertSampleValue: function (value) { return Number(value * (180 / Math.PI)); },
    },
    {
        dataType: data_heart_rate_1.DataHeartRate.type,
        sampleField: 'HR',
        convertSampleValue: function (value) { return Number(value * 60); },
    },
    {
        dataType: data_distance_1.DataDistance.type,
        sampleField: 'Distance',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_absolute_pressure_1.DataAbsolutePressure.type,
        sampleField: 'AbsPressure',
        convertSampleValue: function (value) { return Number(value / 100); },
    },
    {
        dataType: data_sea_level_pressure_1.DataSeaLevelPressure.type,
        sampleField: 'SeaLevelPressure',
        convertSampleValue: function (value) { return Number(value / 100); },
    },
    {
        dataType: data_altitude_gps_1.DataGPSAltitude.type,
        sampleField: 'GPSAltitude',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_altitude_1.DataAltitude.type,
        sampleField: 'Altitude',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_cadence_1.DataCadence.type,
        sampleField: 'Cadence',
        convertSampleValue: function (value) { return Number(value * 60); },
    },
    {
        dataType: data_power_1.DataPower.type,
        sampleField: 'Power',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_speed_1.DataSpeed.type,
        sampleField: 'Speed',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_temperature_1.DataTemperature.type,
        sampleField: 'Temperature',
        convertSampleValue: function (value) { return Number(value - 273.15); },
    },
    {
        dataType: data_vertical_speed_1.DataVerticalSpeed.type,
        sampleField: 'VerticalSpeed',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_ehpe_1.DataEHPE.type,
        sampleField: 'EHPE',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_evpe_1.DataEVPE.type,
        sampleField: 'EVPE',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_number_of_satellites_1.DataNumberOfSatellites.type,
        sampleField: 'NumberOfSatellites',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_satellite_5_best_snr_1.DataSatellite5BestSNR.type,
        sampleField: 'Satellite5BestSNR',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_battery_charge_1.DataBatteryCharge.type,
        sampleField: 'BatteryCharge',
        convertSampleValue: function (value) { return Number(value * 100); },
    },
    {
        dataType: data_battery_current_1.DataBatteryCurrent.type,
        sampleField: 'BatteryCurrent',
        convertSampleValue: function (value) { return Number(value); },
    },
    {
        dataType: data_battery_voltage_1.DataBatteryVoltage.type,
        sampleField: 'BatteryVoltage',
        convertSampleValue: function (value) { return Number(value); },
    },
];
