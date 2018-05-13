"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../../event");
var activity_1 = require("../../../../activities/activity");
var creator_1 = require("../../../../creators/creator");
var lap_1 = require("../../../../laps/lap");
var point_1 = require("../../../../points/point");
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
var intensity_zone_1 = require("../../../../intensity-zones/intensity-zone");
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
var event_utilities_1 = require("../../../utilities/event.utilities");
var lap_types_1 = require("../../../../laps/lap.types");
var EventImporterSuuntoJSON = /** @class */ (function () {
    function EventImporterSuuntoJSON() {
    }
    EventImporterSuuntoJSON.getFromJSONString = function (jsonString) {
        var _this = this;
        var eventJSONObject = JSON.parse(jsonString);
        // Create an event
        var event = new event_1.Event('');
        // Populate the event stats from the Header Object
        this.getStats(eventJSONObject.DeviceLog.Header).forEach(function (stat) {
            event.addStat(stat);
        });
        // Create a creator and pass it to all activities (later)
        var a = eventJSONObject.DeviceLog.Device.Name;
        var b = importer_suunto_device_names_1.ImporterSuuntoDeviceNames[eventJSONObject.DeviceLog.Device.Name];
        debugger;
        var creator = new creator_1.Creator(importer_suunto_device_names_1.ImporterSuuntoDeviceNames[eventJSONObject.DeviceLog.Device.Name] || eventJSONObject.DeviceLog.Device.Name);
        creator.serialNumber = eventJSONObject.DeviceLog.Device.SerialNumber;
        creator.hwInfo = eventJSONObject.DeviceLog.Device.Info.HW;
        creator.swInfo = eventJSONObject.DeviceLog.Device.Info.SW;
        // Go over the samples and get the ones with activity start times
        var activityStartEventSamples = eventJSONObject.DeviceLog.Samples.filter(function (sample) {
            return sample.Events && sample.Events[0].Activity;
        });
        // Get the lap start events
        var lapEventSamples = eventJSONObject.DeviceLog.Samples.filter(function (sample) {
            return sample.Events && sample.Events[0].Lap && sample.Events[0].Lap.Type !== 'Start' && sample.Events[0].Lap.Type !== 'Stop';
        });
        // Get the stop event
        var stopEventSample = eventJSONObject.DeviceLog.Samples.find(function (sample) {
            return sample.Events && sample.Events[0].Lap && sample.Events[0].Lap.Type === 'Stop';
        });
        // Add the stop event to the laps since it's also a lap stop event
        lapEventSamples.push(stopEventSample);
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
                new Date(stopEventSample.TimeISO8601) :
                new Date(activityStartEventSamples[index + 1].TimeISO8601), activity_types_1.ActivityTypes[importer_suunto_activity_ids_1.ImporterSuuntoActivityIds[activityStartEventSample.Events[0].Activity.ActivityType]], creator);
            // Set the end date to the stop event time if the activity is the last or the only one else set it on the next itery time
            // Create the stats these are a 1:1 ref arrays
            _this.getStats(activityWindows[index]).forEach(function (stat) {
                activity.addStat(stat);
            });
            // Add the pause from end date minurs start date and removing the duration as widows do not contain the pause time
            activity.setPause(new data_pause_1.DataPause((activity.endDate.getTime() - activity.startDate.getTime()) / 1000 - activity.getDuration().getValue()));
            // Set the zones for the activity @todo fix
            _this.setIntensityZones(activity, eventJSONObject.DeviceLog.Header);
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
            // @todo here is the real info LapTypes[lapEventSample.Events[0].Lap.Type
            var lap = new lap_1.Lap(lapStartDatesByType[lapEventSample.Events[0].Lap.Type], lapEndDate, lap_types_1.LapTypes[lapWindows[index].Type]);
            lapStartDatesByType[lapEventSample.Events[0].Lap.Type] = lapEndDate;
            _this.getStats(lapWindows[index]).forEach(function (stat) {
                lap.addStat(stat);
            });
            // Add the pause from end date minurs start date and removing the duration as widows do not contain the pause time
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
            activity.addStat(new data_fused_location_1.DataFusedLocation(false));
            eventJSONObject.DeviceLog.Samples.filter(function (sample) { return !sample.Debug && !sample.Events; }).forEach(function (sample) {
                var point = _this.getPointFromSample(sample);
                if (point && (point.getDate() >= activity.startDate) && (point.getDate() <= activity.endDate)) {
                    // add the point
                    activity.addPoint(point);
                    // if the point has fusedLocation data mark the activity by adding a stat
                    var activityFusedData = activity.getStat(data_fused_location_1.DataFusedLocation.className);
                    if (_this.hasFusedLocData(sample) && !activityFusedData) {
                        activity.addStat(new data_fused_location_1.DataFusedLocation(true));
                    }
                }
            });
            activity.sortPointsByDate();
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
                _this.setIBIData(activity, ibiData);
            });
        }
        // Add the activities to the event
        activities.forEach(function (activity) {
            event.addActivity(activity);
        });
        return event;
    };
    EventImporterSuuntoJSON.hasFusedLocData = function (sample) {
        return !!sample.Inertial || !!sample.GpsRef;
    };
    EventImporterSuuntoJSON.setIntensityZones = function (activity, object) {
        // Create intensity zones from the header
        if (object.HrZones) {
            activity.intensityZones.set(data_heart_rate_1.DataHeartRate.type, this.getZones(object.HrZones));
        }
        if (object.PowerZones) {
            activity.intensityZones.set(data_power_1.DataPower.type, this.getZones(object.PowerZones));
        }
        if (object.SpeedZones) {
            activity.intensityZones.set(data_speed_1.DataSpeed.type, this.getZones(object.SpeedZones));
        }
    };
    EventImporterSuuntoJSON.setIBIData = function (activity, ibiData) {
        activity.ibiData = new data_ibi_1.IBIData(ibiData);
        // @todo optimize
        // Create a second IBIData so we can have filtering on those with keeping the original
        (new data_ibi_1.IBIData(ibiData))
            .lowLimitBPMFilter()
            .highLimitBPMFilter()
            .lowPassFilter()
            .movingMedianFilter()
            .getAsBPM().forEach(function (value, key, map) {
            var point = new point_1.Point(new Date(activity.startDate.getTime() + key));
            point.addData(new data_heart_rate_1.DataHeartRate(value));
            // If it belongs to the activity add it
            if (point.getDate() >= activity.startDate && point.getDate() <= activity.endDate) {
                activity.addPoint(point);
            }
            else {
                debugger;
            }
        });
    };
    EventImporterSuuntoJSON.getPointFromSample = function (sample) {
        var point = new point_1.Point(new Date(sample.TimeISO8601));
        if (event_utilities_1.isNumberOrString(sample.HR)) {
            point.addData(new data_heart_rate_1.DataHeartRate(sample.HR * 60));
        }
        if (event_utilities_1.isNumberOrString(sample.GPSAltitude)) {
            point.addData(new data_altitude_gps_1.DataGPSAltitude(sample.GPSAltitude));
        }
        if (event_utilities_1.isNumberOrString(sample.Latitude)) {
            point.addData(new data_latitude_degrees_1.DataLatitudeDegrees(sample.Latitude * (180 / Math.PI)));
        }
        if (event_utilities_1.isNumberOrString(sample.Longitude)) {
            point.addData(new data_longitude_degrees_1.DataLongitudeDegrees(sample.Longitude * (180 / Math.PI)));
        }
        if (event_utilities_1.isNumberOrString(sample.AbsPressure)) {
            point.addData(new data_absolute_pressure_1.DataAbsolutePressure(sample.AbsPressure / 100));
        }
        if (event_utilities_1.isNumberOrString(sample.SeaLevelPressure)) {
            point.addData(new data_sea_level_pressure_1.DataSeaLevelPressure(sample.SeaLevelPressure / 100));
        }
        if (event_utilities_1.isNumberOrString(sample.Altitude)) {
            point.addData(new data_altitude_1.DataAltitude(sample.Altitude));
        }
        if (event_utilities_1.isNumberOrString(sample.Cadence)) {
            point.addData(new data_cadence_1.DataCadence(sample.Cadence * 60));
        }
        if (event_utilities_1.isNumberOrString(sample.Power)) {
            point.addData(new data_power_1.DataPower(sample.Power));
        }
        if (event_utilities_1.isNumberOrString(sample.Speed)) {
            point.addData(new data_speed_1.DataSpeed(sample.Speed));
        }
        if (event_utilities_1.isNumberOrString(sample.Temperature)) {
            point.addData(new data_temperature_1.DataTemperature(sample.Temperature - 273.15));
        }
        if (event_utilities_1.isNumberOrString(sample.VerticalSpeed)) {
            point.addData(new data_vertical_speed_1.DataVerticalSpeed(sample.VerticalSpeed));
        }
        if (event_utilities_1.isNumberOrString(sample.EHPE)) {
            point.addData(new data_ehpe_1.DataEHPE(sample.EHPE));
        }
        if (event_utilities_1.isNumberOrString(sample.EVPE)) {
            point.addData(new data_evpe_1.DataEVPE(sample.EVPE));
        }
        if (event_utilities_1.isNumberOrString(sample.NumberOfSatellites)) {
            point.addData(new data_number_of_satellites_1.DataNumberOfSatellites(sample.NumberOfSatellites));
        }
        if (event_utilities_1.isNumberOrString(sample.Satellite5BestSNR)) {
            point.addData(new data_satellite_5_best_snr_1.DataSatellite5BestSNR(sample.Satellite5BestSNR));
        }
        return point;
    };
    EventImporterSuuntoJSON.getZones = function (zonesObj) {
        // @todo fix for HR
        var zones = new intensity_zone_1.IntensityZones;
        zones.zone1Duration = zonesObj.Zone1Duration;
        zones.zone2Duration = zonesObj.Zone2Duration;
        zones.zone2LowerLimit = zonesObj.Zone2LowerLimit;
        zones.zone3Duration = zonesObj.Zone3Duration;
        zones.zone3LowerLimit = zonesObj.Zone3LowerLimit;
        zones.zone4Duration = zonesObj.Zone4Duration;
        zones.zone4LowerLimit = zonesObj.Zone4LowerLimit;
        zones.zone5Duration = zonesObj.Zone5Duration;
        zones.zone5LowerLimit = zonesObj.Zone5LowerLimit;
        return zones;
    };
    EventImporterSuuntoJSON.getStats = function (object) {
        var stats = [];
        if (event_utilities_1.isNumberOrString(object.Distance)) {
            stats.push(new data_distance_1.DataDistance(object.Distance));
        }
        if (event_utilities_1.isNumberOrString(object.AscentTime)) {
            stats.push(new data_ascent_time_1.DataAscentTime(object.AscentTime));
        }
        if (event_utilities_1.isNumberOrString(object.DescentTime)) {
            stats.push(new data_descent_time_1.DataDescentTime(object.DescentTime));
        }
        if (event_utilities_1.isNumberOrString(object.Ascent)) {
            stats.push(new data_ascent_1.DataAscent(object.Ascent));
        }
        if (event_utilities_1.isNumberOrString(object.Descent)) {
            stats.push(new data_descent_1.DataDescent(object.Descent));
        }
        if (event_utilities_1.isNumberOrString(object.EPOC)) {
            stats.push(new data_epoc_1.DataEPOC(object.EPOC));
        }
        if (event_utilities_1.isNumberOrString(object.Energy)) {
            stats.push(new data_energy_1.DataEnergy(object.Energy * 0.239 / 1000));
        }
        if (event_utilities_1.isNumberOrString(object.Feeling)) {
            stats.push(new data_feeling_1.DataFeeling(object.Feeling));
        }
        if (event_utilities_1.isNumberOrString(object.PeakTrainingEffect)) {
            stats.push(new data_peak_training_effect_1.DataPeakTrainingEffect(object.PeakTrainingEffect));
        }
        if (event_utilities_1.isNumberOrString(object.RecoveryTime)) {
            stats.push(new data_recovery_1.DataRecovery(object.RecoveryTime));
        }
        if (event_utilities_1.isNumberOrString(object.MAXVO2)) {
            stats.push(new data_vo2_max_1.DataVO2Max(object.MAXVO2));
        }
        var pauseDuration = 0;
        if (event_utilities_1.isNumberOrString(object.PauseDuration)) {
            pauseDuration = object.PauseDuration;
        }
        stats.push(new data_pause_1.DataPause(pauseDuration));
        stats.push(new data_duration_1.DataDuration(object.Duration - pauseDuration));
        // double case
        if (Array.isArray(object.Altitude)) {
            if (object.Altitude[0].Avg !== null) {
                stats.push(new data_altitude_avg_1.DataAltitudeAvg(object.Altitude[0].Avg));
            }
            if (object.Altitude[0].Max !== null) {
                stats.push(new data_altitude_max_1.DataAltitudeMax(object.Altitude[0].Max));
            }
            if (object.Altitude[0].Min !== null) {
                stats.push(new data_altitude_min_1.DataAltitudeMin(object.Altitude[0].Min));
            }
        }
        else if (object.Altitude) {
            if (object.Altitude.Max !== null) {
                stats.push(new data_altitude_max_1.DataAltitudeMax(object.Altitude.Max));
            }
            if (object.Altitude.Min !== null) {
                stats.push(new data_altitude_min_1.DataAltitudeMin(object.Altitude.Min));
            }
        }
        if (object.HR) {
            if (object.HR[0].Avg !== null) {
                stats.push(new data_heart_rate_avg_1.DataHeartRateAvg(object.HR[0].Avg * 60));
            }
            if (object.HR[0].Max !== null) {
                stats.push(new data_heart_rate_max_1.DataHeartRateMax(object.HR[0].Max * 60));
            }
            if (object.HR[0].Min !== null) {
                stats.push(new data_heart_rate_min_1.DataHeartRateMin(object.HR[0].Min * 60));
            }
        }
        if (object.Cadence) {
            if (object.Cadence[0].Avg !== null) {
                stats.push(new data_cadence_avg_1.DataCadenceAvg(object.Cadence[0].Avg * 60));
            }
            if (object.Cadence[0].Max !== null) {
                stats.push(new data_cadence_max_1.DataCadenceMax(object.Cadence[0].Max * 60));
            }
            if (object.Cadence[0].Min !== null) {
                stats.push(new data_cadence_min_1.DataCadenceMin(object.Cadence[0].Min * 60));
            }
        }
        if (object.Power) {
            if (object.Power[0].Avg !== null) {
                stats.push(new data_power_avg_1.DataPowerAvg(object.Power[0].Avg));
            }
            if (object.Power[0].Max !== null) {
                stats.push(new data_power_max_1.DataPowerMax(object.Power[0].Max));
            }
            if (object.Power[0].Min !== null) {
                stats.push(new data_power_min_1.DataPowerMin(object.Power[0].Min));
            }
        }
        if (object.Speed) {
            if (object.Speed[0].Avg !== null) {
                stats.push(new data_speed_avg_1.DataSpeedAvg(object.Speed[0].Avg));
            }
            if (object.Speed[0].Max !== null) {
                stats.push(new data_speed_max_1.DataSpeedMax(object.Speed[0].Max));
            }
            if (object.Speed[0].Min !== null) {
                stats.push(new data_speed_min_1.DataSpeedMin(object.Speed[0].Min));
            }
        }
        if (object.Temperature) {
            if (object.Temperature[0].Avg !== null) {
                stats.push(new data_temperature_avg_1.DataTemperatureAvg(object.Temperature[0].Avg - 273.15));
            }
            if (object.Temperature[0].Max !== null) {
                stats.push(new data_temperature_max_1.DataTemperatureMax(object.Temperature[0].Max - 273.15));
            }
            if (object.Temperature[0].Min !== null) {
                stats.push(new data_temperature_min_1.DataTemperatureMin(object.Temperature[0].Min - 273.15));
            }
        }
        if (object.hasOwnProperty('VerticalSpeed')) {
            // Double action here
            if (Array.isArray(object.VerticalSpeed)) {
                if (object.VerticalSpeed[0].Avg !== null) {
                    stats.push(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(object.VerticalSpeed[0].Avg));
                }
                if (object.VerticalSpeed[0].Max !== null) {
                    stats.push(new data_vertical_speed_max_1.DataVerticalSpeedMax(object.VerticalSpeed[0].Max));
                }
                if (object.VerticalSpeed[0].Min !== null) {
                    stats.push(new data_vertical_speed_min_1.DataVerticalSpeedMin(object.VerticalSpeed[0].Min));
                }
            }
            else {
                if (object.VerticalSpeed !== null) {
                    stats.push(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(object.VerticalSpeed));
                }
            }
        }
        return stats;
    };
    return EventImporterSuuntoJSON;
}());
exports.EventImporterSuuntoJSON = EventImporterSuuntoJSON;
