"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_vertical_speed_1 = require("./data.vertical-speed");
var data_temperature_1 = require("./data.temperature");
var data_speed_1 = require("./data.speed");
var data_sea_level_pressure_1 = require("./data.sea-level-pressure");
var data_satellite_5_best_snr_1 = require("./data.satellite-5-best-snr");
var data_absolute_pressure_1 = require("./data.absolute-pressure");
var data_altitude_1 = require("./data.altitude");
var data_cadence_1 = require("./data.cadence");
var data_distance_1 = require("./data.distance");
var data_duration_1 = require("./data.duration");
var data_ehpe_1 = require("./data.ehpe");
var data_evpe_1 = require("./data.evpe");
var data_heart_rate_1 = require("./data.heart-rate");
var data_latitude_degrees_1 = require("./data.latitude-degrees");
var data_longitude_degrees_1 = require("./data.longitude-degrees");
var data_number_of_satellites_1 = require("./data.number-of-satellites");
var data_power_1 = require("./data.power");
var data_altitude_gps_1 = require("./data.altitude-gps");
var data_altitude_min_1 = require("./data.altitude-min");
var data_altitude_max_1 = require("./data.altitude-max");
var data_vo2_max_1 = require("./data.vo2-max");
var data_vertical_speed_min_1 = require("./data.vertical-speed-min");
var data_vertical_speed_max_1 = require("./data.vertical-speed-max");
var data_vertical_speed_avg_1 = require("./data.vertical-speed-avg");
var data_temperature_min_1 = require("./data.temperature-min");
var data_temperature_max_1 = require("./data.temperature-max");
var data_temperature_avg_1 = require("./data.temperature-avg");
var data_speed_min_1 = require("./data.speed-min");
var data_speed_max_1 = require("./data.speed-max");
var data_speed_avg_1 = require("./data.speed-avg");
var data_recovery_1 = require("./data.recovery");
var data_power_min_1 = require("./data.power-min");
var data_power_max_1 = require("./data.power-max");
var data_power_avg_1 = require("./data.power-avg");
var data_peak_training_effect_1 = require("./data.peak-training-effect");
var data_pause_1 = require("./data.pause");
var data_heart_rate_min_1 = require("./data.heart-rate-min");
var data_heart_rate_max_1 = require("./data.heart-rate-max");
var data_heart_rate_avg_1 = require("./data.heart-rate-avg");
var data_feeling_1 = require("./data.feeling");
var data_epoc_1 = require("./data.epoc");
var data_energy_1 = require("./data.energy");
var data_descent_time_1 = require("./data.descent-time");
var data_descent_1 = require("./data.descent");
var data_cadence_min_1 = require("./data.cadence-min");
var data_cadence_max_1 = require("./data.cadence-max");
var data_cadence_avg_1 = require("./data.cadence-avg");
var data_ascent_time_1 = require("./data.ascent-time");
var data_ascent_1 = require("./data.ascent");
var data_altitude_avg_1 = require("./data.altitude-avg");
var data_fused_location_1 = require("./data.fused-location");
/**
 * Only concrete classes no abstracts
 */
exports.DataStore = {
    DataVerticalSpeed: data_vertical_speed_1.DataVerticalSpeed,
    DataTemperature: data_temperature_1.DataTemperature,
    DataSpeed: data_speed_1.DataSpeed,
    DataSeaLevelPressure: data_sea_level_pressure_1.DataSeaLevelPressure,
    DataSatellite5BestSNR: data_satellite_5_best_snr_1.DataSatellite5BestSNR,
    DataPower: data_power_1.DataPower,
    DataNumberOfSatellites: data_number_of_satellites_1.DataNumberOfSatellites,
    DataLongitudeDegrees: data_longitude_degrees_1.DataLongitudeDegrees,
    DataLatitudeDegrees: data_latitude_degrees_1.DataLatitudeDegrees,
    DataHeartRate: data_heart_rate_1.DataHeartRate,
    DataEVPE: data_evpe_1.DataEVPE,
    DataEHPE: data_ehpe_1.DataEHPE,
    DataDuration: data_duration_1.DataDuration,
    DataDistance: data_distance_1.DataDistance,
    DataCadence: data_cadence_1.DataCadence,
    DataGPSAltitude: data_altitude_gps_1.DataGPSAltitude,
    DataAltitude: data_altitude_1.DataAltitude,
    DataAbsolutePressure: data_absolute_pressure_1.DataAbsolutePressure,
    DataVO2Max: data_vo2_max_1.DataVO2Max,
    DataVerticalSpeedMin: data_vertical_speed_min_1.DataVerticalSpeedMin,
    DataVerticalSpeedMax: data_vertical_speed_max_1.DataVerticalSpeedMax,
    DataVerticalSpeedAvg: data_vertical_speed_avg_1.DataVerticalSpeedAvg,
    DataTemperatureMin: data_temperature_min_1.DataTemperatureMin,
    DataTemperatureMax: data_temperature_max_1.DataTemperatureMax,
    DataTemperatureAvg: data_temperature_avg_1.DataTemperatureAvg,
    DataSpeedMin: data_speed_min_1.DataSpeedMin,
    DataSpeedMax: data_speed_max_1.DataSpeedMax,
    DataSpeedAvg: data_speed_avg_1.DataSpeedAvg,
    DataRecovery: data_recovery_1.DataRecovery,
    DataPowerMin: data_power_min_1.DataPowerMin,
    DataPowerMax: data_power_max_1.DataPowerMax,
    DataPowerAvg: data_power_avg_1.DataPowerAvg,
    DataPeakTrainingEffect: data_peak_training_effect_1.DataPeakTrainingEffect,
    DataPause: data_pause_1.DataPause,
    DataHeartRateMin: data_heart_rate_min_1.DataHeartRateMin,
    DataHeartRateMax: data_heart_rate_max_1.DataHeartRateMax,
    DataHeartRateAvg: data_heart_rate_avg_1.DataHeartRateAvg,
    DataFeeling: data_feeling_1.DataFeeling,
    DataEPOC: data_epoc_1.DataEPOC,
    DataEnergy: data_energy_1.DataEnergy,
    DataDescentTime: data_descent_time_1.DataDescentTime,
    DataDescent: data_descent_1.DataDescent,
    DataCadenceMin: data_cadence_min_1.DataCadenceMin,
    DataCadenceMax: data_cadence_max_1.DataCadenceMax,
    DataCadenceAvg: data_cadence_avg_1.DataCadenceAvg,
    DataAscentTime: data_ascent_time_1.DataAscentTime,
    DataAscent: data_ascent_1.DataAscent,
    DataAltitudeMin: data_altitude_min_1.DataAltitudeMin,
    DataAltitudeMax: data_altitude_max_1.DataAltitudeMax,
    DataAltitudeAvg: data_altitude_avg_1.DataAltitudeAvg,
    DataFusedLocation: data_fused_location_1.DataFusedLocation,
};
var DynamicDataLoader = /** @class */ (function () {
    function DynamicDataLoader() {
    }
    DynamicDataLoader.getDataInstance = function (className, opts) {
        if (exports.DataStore[className] === undefined || exports.DataStore[className] === null) {
            throw new Error("Class type of '" + className + "' is not in the store");
        }
        return new exports.DataStore[className](opts);
    };
    DynamicDataLoader.getDataClassFromClassName = function (className) {
        if (exports.DataStore[className] === undefined || exports.DataStore[className] === null) {
            throw new Error("Class type of '" + className + "' is not in the store");
        }
        return exports.DataStore[className];
    };
    return DynamicDataLoader;
}());
exports.DynamicDataLoader = DynamicDataLoader;
