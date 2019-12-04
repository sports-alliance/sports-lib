"use strict";
var _a;
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
var dataRecoveryTime_1 = require("./dataRecoveryTime");
var data_power_min_1 = require("./data.power-min");
var data_power_max_1 = require("./data.power-max");
var data_power_avg_1 = require("./data.power-avg");
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
var data_pace_min_1 = require("./data.pace-min");
var data_pace_max_1 = require("./data.pace-max");
var data_pace_avg_1 = require("./data.pace-avg");
var data_pace_1 = require("./data.pace");
var data_fused_altitude_1 = require("./data.fused-altitude");
var data_battery_charge_1 = require("./data.battery-charge");
var data_battery_current_1 = require("./data.battery-current");
var data_battery_voltage_1 = require("./data.battery-voltage");
var data_battery_consumption_1 = require("./data.battery-consumption");
var data_battery_life_estimation_1 = require("./data.battery-life-estimation");
var data_form_power_1 = require("./data.form-power");
var data_leg_stiffness_1 = require("./data.leg-stiffness");
var data_vertical_oscillation_1 = require("./data.vertical-oscillation");
var data_total_training_effect_1 = require("./data.total-training-effect");
var data_number_of_samples_1 = require("./data-number-of.samples");
var data_foot_pod_used_1 = require("./data.foot-pod-used");
var data_auto_pause_used_1 = require("./data.auto-pause-used");
var data_auto_lap_duration_1 = require("./data.auto-lap-duration");
var data_auto_lap_distance_1 = require("./data.auto-lap-distance");
var data_auto_lap_used_1 = require("./data.auto-lap-used");
var data_bike_pod_used_1 = require("./data.bike-pod-used");
var data_enabled_navigation_systems_1 = require("./data.enabled-navigation-systems");
var data_heart_rate_used_1 = require("./data.heart-rate-used");
var data_power_pod_used_1 = require("./data.power-pod-used");
var data_alti_baro_profile_1 = require("./data.alti-baro-profile");
var data_ibi_1 = require("./data.ibi");
var data_steps_1 = require("./data.steps");
var data_pool_length_1 = require("./data.pool-length");
var data_device_location_1 = require("./data.device-location");
var data_peak_epoc_1 = require("./data.peak-epoc");
var data_device_names_1 = require("./data.device-names");
var data_activity_types_1 = require("./data.activity-types");
var data_start_altitude_1 = require("./data.start-altitude");
var data_end_altitude_1 = require("./data.end-altitude");
var data_swim_pace_1 = require("./data.swim-pace");
var data_swim_pace_avg_1 = require("./data.swim-pace-avg");
var data_swim_pace_max_1 = require("./data.swim-pace-max");
var data_swim_pace_min_1 = require("./data.swim-pace-min");
var data_swolf_avg_1 = require("./data.swolf-avg");
var data_accumulated_power_1 = require("./data.accumulated-power");
var data_stryd_distance_1 = require("./data.stryd-distance");
var data_stryd_speed_1 = require("./data.stryd-speed");
var data_stryd_altitude_1 = require("./data.stryd-altitude");
var data_left_balance_1 = require("./data.left-balance");
var data_right_balance_1 = require("./data.right-balance");
var data_rpe_1 = require("./data.rpe");
var data_power_right_1 = require("./data.power-right");
var data_power_left_1 = require("./data.power-left");
var data_stance_time_1 = require("./data.stance-time");
var data_stance_time_balance_1 = require("./data.stance-time-balance");
var data_step_length_1 = require("./data.step-length");
var data_vertical_ratio_1 = require("./data.vertical-ratio");
var data_description_1 = require("./data.description");
var data_air_power_1 = require("./data.air-power");
var data_ground_time_1 = require("./data.ground-time");
var data_air_power_max_1 = require("./data.air-power-max");
var data_air_power_min_1 = require("./data.air-power-min");
var data__air_power_avg_1 = require("./data.-air-power-avg");
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
    DataRecovery: dataRecoveryTime_1.DataRecoveryTime,
    DataPowerMin: data_power_min_1.DataPowerMin,
    DataPowerMax: data_power_max_1.DataPowerMax,
    DataPowerAvg: data_power_avg_1.DataPowerAvg,
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
    DataFusedAltitude: data_fused_altitude_1.DataFusedAltitude,
    DataPace: data_pace_1.DataPace,
    DataPaceMin: data_pace_min_1.DataPaceMin,
    DataPaceMax: data_pace_max_1.DataPaceMax,
    DataPaceAvg: data_pace_avg_1.DataPaceAvg,
    DataSwimPace: data_swim_pace_1.DataSwimPace,
    DataSwimPaceMin: data_swim_pace_min_1.DataSwimPaceMin,
    DataSwimPaceMax: data_swim_pace_max_1.DataSwimPaceMax,
    DataSwimPaceAvg: data_swim_pace_avg_1.DataSwimPaceAvg,
    DataNumberOfSamples: data_number_of_samples_1.DataNumberOfSamples,
    DataBatteryCharge: data_battery_charge_1.DataBatteryCharge,
    DataBatteryCurrent: data_battery_current_1.DataBatteryCurrent,
    DataBatteryVoltage: data_battery_voltage_1.DataBatteryVoltage,
    DataBatteryConsumption: data_battery_consumption_1.DataBatteryConsumption,
    DataBatteryLifeEstimation: data_battery_life_estimation_1.DataBatteryLifeEstimation,
    DataFormPower: data_form_power_1.DataFormPower,
    DataLegStiffness: data_leg_stiffness_1.DataLegStiffness,
    DataVerticalOscillation: data_vertical_oscillation_1.DataVerticalOscillation,
    DataTotalTrainingEffect: data_total_training_effect_1.DataTotalTrainingEffect,
    DataFootPodUsed: data_foot_pod_used_1.DataFootPodUsed,
    DataAltiBaroProfile: data_alti_baro_profile_1.DataAltiBaroProfile,
    DataAutoPauseUsed: data_auto_pause_used_1.DataAutoPauseUsed,
    DataAutoLapDuration: data_auto_lap_duration_1.DataAutoLapDuration,
    DataAutoLapDistance: data_auto_lap_distance_1.DataAutoLapDistance,
    DataAutoLapUsed: data_auto_lap_used_1.DataAutoLapUsed,
    DataBikePodUsed: data_bike_pod_used_1.DataBikePodUsed,
    DataEnabledNavigationSystems: data_enabled_navigation_systems_1.DataEnabledNavigationSystems,
    DataHeartRateUsed: data_heart_rate_used_1.DataHeartRateUsed,
    DataPowerPodUsed: data_power_pod_used_1.DataPowerPodUsed,
    DataSpeedKilometersPerHour: data_speed_1.DataSpeedKilometersPerHour,
    DataSpeedMilesPerHour: data_speed_1.DataSpeedMilesPerHour,
    DataSpeedFeetPerSecond: data_speed_1.DataSpeedFeetPerSecond,
    DataSpeedMetersPerMinute: data_speed_1.DataSpeedMetersPerMinute,
    DataSpeedFeetPerMinute: data_speed_1.DataSpeedFeetPerMinute,
    DataSpeedAvgKilometersPerHour: data_speed_avg_1.DataSpeedAvgKilometersPerHour,
    DataSpeedAvgMilesPerHour: data_speed_avg_1.DataSpeedAvgMilesPerHour,
    DataSpeedAvgFeetPerSecond: data_speed_avg_1.DataSpeedAvgFeetPerSecond,
    DataSpeedAvgMetersPerMinute: data_speed_avg_1.DataSpeedAvgMetersPerMinute,
    DataSpeedAvgFeetPerMinute: data_speed_avg_1.DataSpeedAvgFeetPerMinute,
    DataSpeedMinKilometersPerHour: data_speed_min_1.DataSpeedMinKilometersPerHour,
    DataSpeedMinMilesPerHour: data_speed_min_1.DataSpeedMinMilesPerHour,
    DataSpeedMinFeetPerSecond: data_speed_min_1.DataSpeedMinFeetPerSecond,
    DataSpeedMinMetersPerMinute: data_speed_min_1.DataSpeedMinMetersPerMinute,
    DataSpeedMinFeetPerMinute: data_speed_min_1.DataSpeedMinFeetPerMinute,
    DataSpeedMaxKilometersPerHour: data_speed_max_1.DataSpeedMaxKilometersPerHour,
    DataSpeedMaxMilesPerHour: data_speed_max_1.DataSpeedMaxMilesPerHour,
    DataSpeedMaxFeetPerSecond: data_speed_max_1.DataSpeedMaxFeetPerSecond,
    DataSpeedMaxMetersPerMinute: data_speed_max_1.DataSpeedMaxMetersPerMinute,
    DataSpeedMaxFeetPerMinute: data_speed_max_1.DataSpeedMaxFeetPerMinute,
    DataPaceMinutesPerMile: data_pace_1.DataPaceMinutesPerMile,
    DataPaceAvgMinutesPerMile: data_pace_avg_1.DataPaceAvgMinutesPerMile,
    DataPaceMinMinutesPerMile: data_pace_min_1.DataPaceMinMinutesPerMile,
    DataPaceMaxMinutesPerMile: data_pace_max_1.DataPaceMaxMinutesPerMile,
    DataSwimPaceMinutesPer100Yard: data_swim_pace_1.DataSwimPaceMinutesPer100Yard,
    DataSwimPaceAvgMinutesPer100Yard: data_swim_pace_avg_1.DataSwimPaceAvgMinutesPer100Yard,
    DataSwimPaceMinMinutesPer100Yard: data_swim_pace_min_1.DataSwimPaceMinMinutesPer100Yard,
    DataSwimPaceMaxMinutesPer100Yard: data_swim_pace_max_1.DataSwimPaceMaxMinutesPer100Yard,
    DataVerticalSpeedFeetPerSecond: data_vertical_speed_1.DataVerticalSpeedFeetPerSecond,
    DataVerticalSpeedMetersPerMinute: data_vertical_speed_1.DataVerticalSpeedMetersPerMinute,
    DataVerticalSpeedFeetPerMinute: data_vertical_speed_1.DataVerticalSpeedFeetPerMinute,
    DataVerticalSpeedMetersPerHour: data_vertical_speed_1.DataVerticalSpeedMetersPerHour,
    DataVerticalSpeedFeetPerHour: data_vertical_speed_1.DataVerticalSpeedFeetPerHour,
    DataVerticalSpeedKilometerPerHour: data_vertical_speed_1.DataVerticalSpeedKilometerPerHour,
    DataVerticalSpeedMilesPerHour: data_vertical_speed_1.DataVerticalSpeedMilesPerHour,
    DataVerticalSpeedAvgFeetPerSecond: data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerSecond,
    DataVerticalSpeedAvgMetersPerMinute: data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerMinute,
    DataVerticalSpeedAvgFeetPerMinute: data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerMinute,
    DataVerticalSpeedAvgMetersPerHour: data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerHour,
    DataVerticalSpeedAvgFeetPerHour: data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerHour,
    DataVerticalSpeedAvgKilometerPerHour: data_vertical_speed_avg_1.DataVerticalSpeedAvgKilometerPerHour,
    DataVerticalSpeedAvgMilesPerHour: data_vertical_speed_avg_1.DataVerticalSpeedAvgMilesPerHour,
    DataVerticalSpeedMaxFeetPerSecond: data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerSecond,
    DataVerticalSpeedMaxMetersPerMinute: data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerMinute,
    DataVerticalSpeedMaxFeetPerMinute: data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerMinute,
    DataVerticalSpeedMaxMetersPerHour: data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerHour,
    DataVerticalSpeedMaxFeetPerHour: data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerHour,
    DataVerticalSpeedMaxKilometerPerHour: data_vertical_speed_max_1.DataVerticalSpeedMaxKilometerPerHour,
    DataVerticalSpeedMaxMilesPerHour: data_vertical_speed_max_1.DataVerticalSpeedMaxMilesPerHour,
    DataVerticalSpeedMinFeetPerSecond: data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerSecond,
    DataVerticalSpeedMinMetersPerMinute: data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerMinute,
    DataVerticalSpeedMinFeetPerMinute: data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerMinute,
    DataVerticalSpeedMinMetersPerHour: data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerHour,
    DataVerticalSpeedMinFeetPerHour: data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerHour,
    DataVerticalSpeedMinKilometerPerHour: data_vertical_speed_min_1.DataVerticalSpeedMinKilometerPerHour,
    DataVerticalSpeedMinMilesPerHour: data_vertical_speed_min_1.DataVerticalSpeedMinMilesPerHour,
    DataIBI: data_ibi_1.DataIBI,
    DataSteps: data_steps_1.DataSteps,
    DataStrydAltitude: data_stryd_altitude_1.DataStrydAltitude,
    DataStrydSpeed: data_stryd_speed_1.DataStrydSpeed,
    DataStrydDistance: data_stryd_distance_1.DataStrydDistance,
    DataPoolLength: data_pool_length_1.DataPoolLength,
    DataDeviceLocation: data_device_location_1.DataDeviceLocation,
    DataPeakEPOC: data_peak_epoc_1.DataPeakEPOC,
    DataActivityTypes: data_activity_types_1.DataActivityTypes,
    DataDeviceNames: data_device_names_1.DataDeviceNames,
    DataStartAltitude: data_start_altitude_1.DataStartAltitude,
    DataEndAltitude: data_end_altitude_1.DataEndAltitude,
    DataSWOLFAvg: data_swolf_avg_1.DataSWOLFAvg,
    DataAccumulatedPower: data_accumulated_power_1.DataAccumulatedPower,
    DataLeftBalance: data_left_balance_1.DataLeftBalance,
    DataRightBalance: data_right_balance_1.DataRightBalance,
    DataPowerLeft: data_power_left_1.DataPowerLeft,
    DataPowerRight: data_power_right_1.DataPowerRight,
    DataRPE: data_rpe_1.DataRPE,
    DataStanceTime: data_stance_time_1.DataStanceTime,
    DataStanceTimeBalance: data_stance_time_balance_1.DataStanceTimeBalance,
    DataStepLength: data_step_length_1.DataStepLength,
    DataVerticalRatio: data_vertical_ratio_1.DataVerticalRatio,
    DataDescription: data_description_1.DataDescription,
    DataGroundTime: data_ground_time_1.DataGroundTime,
    DataAirPower: data_air_power_1.DataAirPower,
    DataAirPowerAvg: data__air_power_avg_1.DataAirPowerAvg,
    DataAirPowerMax: data_air_power_max_1.DataAirPowerMax,
    DataAirPowerMin: data_air_power_min_1.DataAirPowerMin,
};
var DynamicDataLoader = /** @class */ (function () {
    function DynamicDataLoader() {
    }
    DynamicDataLoader.getDataInstanceFromDataType = function (dataType, opts) {
        var className = Object.keys(exports.DataStore).find(function (dataClass) {
            return exports.DataStore[dataClass] && exports.DataStore[dataClass].type && exports.DataStore[dataClass].type === dataType;
        });
        if (!className || !exports.DataStore[className]) {
            throw new Error("Class type of '" + className + "' is not in the store");
        }
        return new exports.DataStore[className](opts);
    };
    DynamicDataLoader.getDataClassFromDataType = function (dataType) {
        var className = Object.keys(exports.DataStore).find(function (dataClass) {
            return exports.DataStore[dataClass] && exports.DataStore[dataClass].type && exports.DataStore[dataClass].type === dataType;
        });
        if (!className || !exports.DataStore[className]) {
            throw new Error("Class type of '" + dataType + "' is not in the store");
        }
        return exports.DataStore[className];
    };
    DynamicDataLoader.isUnitDerivedDataType = function (dataType) {
        return Object.values(this.unitBasedDataTypes).reduce(function (accu, item) { return accu.concat(item); }, []).indexOf(dataType) !== -1;
    };
    /**
     * This gets the base and extended unit datatypes from a datatype array depending on the user settings
     * @param dataTypes
     * @param userUnitSettings
     */
    DynamicDataLoader.getUnitBasedDataTypesFromDataTypes = function (dataTypes, userUnitSettings) {
        var unitBasedDataTypes = [];
        if (!userUnitSettings) {
            return unitBasedDataTypes;
        }
        if (dataTypes.indexOf(data_speed_1.DataSpeed.type) !== -1) {
            unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.speedUnits);
            unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.swimPaceUnits);
            unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.paceUnits);
        }
        if (dataTypes.indexOf(data_vertical_speed_1.DataVerticalSpeed.type) !== -1) {
            unitBasedDataTypes = unitBasedDataTypes.concat(userUnitSettings.verticalSpeedUnits);
        }
        return unitBasedDataTypes;
    };
    /**
     * Gets the unitbased types
     * @param dataType
     * @param userUnitSettings
     */
    DynamicDataLoader.getUnitBasedDataTypesFromDataType = function (dataType, userUnitSettings) {
        if (!userUnitSettings) {
            return [dataType];
        }
        if (dataType === data_speed_1.DataSpeed.type) {
            return userUnitSettings.speedUnits;
        }
        if (dataType === data_pace_1.DataPace.type) {
            return userUnitSettings.paceUnits;
        }
        if (dataType === data_swim_pace_1.DataSwimPace.type) {
            return userUnitSettings.swimPaceUnits;
        }
        if (dataType === data_vertical_speed_1.DataVerticalSpeed.type) {
            return userUnitSettings.verticalSpeedUnits;
        }
        return [dataType];
    };
    /**
     * Gets back an array of the unit based data for the data that was asked
     * For example if the user has for speed selected m/s+km/h doing:
     * getUnitBasedDataFromData(speedData) will return an array of [DataSpeed, DataSpeedInKilometersPerHour] instances
     * @param data
     * @param userUnitSettings
     * @todo move to solo unit settings eg speed settings
     */
    DynamicDataLoader.getUnitBasedDataFromDataInstance = function (data, userUnitSettings) {
        var _this = this;
        if (!userUnitSettings) {
            return [data];
        }
        switch (data.getType()) {
            // Speed
            case data_speed_1.DataSpeed.type:
                return userUnitSettings.speedUnits.reduce(function (accu, unit) {
                    return accu.concat([_this.getDataInstanceFromDataType(unit, data.getValue(unit))]);
                }, []);
            case data_speed_avg_1.DataSpeedAvg.type:
                return userUnitSettings.speedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_speed_1.DataSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvg.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedKilometersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvgKilometersPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvgMilesPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvgFeetPerSecond.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvgMetersPerMinute.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_avg_1.DataSpeedAvgFeetPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_speed_max_1.DataSpeedMax.type:
                return userUnitSettings.speedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_speed_1.DataSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMax.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedKilometersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMaxKilometersPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMaxMilesPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMaxFeetPerSecond.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMaxMetersPerMinute.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_max_1.DataSpeedMaxFeetPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_speed_min_1.DataSpeedMin.type:
                return userUnitSettings.speedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_speed_1.DataSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMin.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedKilometersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMinKilometersPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMinMilesPerHour.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMinFeetPerSecond.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMinMetersPerMinute.type, data.getValue(unit))]);
                        case data_speed_1.DataSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_speed_min_1.DataSpeedMinFeetPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            // Pace
            case data_pace_1.DataPace.type:
                return userUnitSettings.paceUnits.reduce(function (accu, unit) {
                    return accu.concat([_this.getDataInstanceFromDataType(unit, data.getValue(unit))]);
                }, []);
            case data_pace_avg_1.DataPaceAvg.type:
                return userUnitSettings.paceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_pace_1.DataPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_avg_1.DataPaceAvg.type, data.getValue(unit))]);
                        case data_pace_1.DataPaceMinutesPerMile.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_avg_1.DataPaceAvgMinutesPerMile.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_pace_max_1.DataPaceMax.type:
                return userUnitSettings.paceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_pace_1.DataPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_max_1.DataPaceMax.type, data.getValue(unit))]);
                        case data_pace_1.DataPaceMinutesPerMile.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_max_1.DataPaceMaxMinutesPerMile.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_pace_min_1.DataPaceMin.type:
                return userUnitSettings.paceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_pace_1.DataPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_min_1.DataPaceMin.type, data.getValue(unit))]);
                        case data_pace_1.DataPaceMinutesPerMile.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_pace_min_1.DataPaceMinMinutesPerMile.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            //Swim
            case data_swim_pace_1.DataSwimPace.type:
                return userUnitSettings.swimPaceUnits.reduce(function (accu, unit) {
                    return accu.concat([_this.getDataInstanceFromDataType(unit, data.getValue(unit))]);
                }, []);
            case data_swim_pace_avg_1.DataSwimPaceAvg.type:
                return userUnitSettings.swimPaceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_swim_pace_1.DataSwimPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_avg_1.DataSwimPaceAvg.type, data.getValue(unit))]);
                        case data_swim_pace_1.DataSwimPaceMinutesPer100Yard.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_avg_1.DataSwimPaceAvgMinutesPer100Yard.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_swim_pace_max_1.DataSwimPaceMax.type:
                return userUnitSettings.swimPaceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_swim_pace_1.DataSwimPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_max_1.DataSwimPaceMax.type, data.getValue(unit))]);
                        case data_swim_pace_1.DataSwimPaceMinutesPer100Yard.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_max_1.DataSwimPaceMaxMinutesPer100Yard.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_swim_pace_min_1.DataSwimPaceMin.type:
                return userUnitSettings.swimPaceUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_swim_pace_1.DataSwimPace.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_min_1.DataSwimPaceMin.type, data.getValue(unit))]);
                        case data_swim_pace_1.DataSwimPaceMinutesPer100Yard.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_swim_pace_min_1.DataSwimPaceMinMinutesPer100Yard.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            // Vertical speed
            case data_vertical_speed_1.DataVerticalSpeed.type:
                return userUnitSettings.verticalSpeedUnits.reduce(function (accu, unit) {
                    return accu.concat([_this.getDataInstanceFromDataType(unit, data.getValue(unit))]);
                }, []);
            case data_vertical_speed_avg_1.DataVerticalSpeedAvg.type:
                return userUnitSettings.verticalSpeedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_vertical_speed_1.DataVerticalSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerMinute.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerSecond.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedKilometerPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgKilometerPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgMilesPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_vertical_speed_max_1.DataVerticalSpeedMax.type:
                return userUnitSettings.verticalSpeedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_vertical_speed_1.DataVerticalSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMax.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerMinute.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerSecond.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedKilometerPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxKilometerPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxMilesPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            case data_vertical_speed_min_1.DataVerticalSpeedMin.type:
                return userUnitSettings.verticalSpeedUnits.reduce(function (accu, unit) {
                    switch (unit) {
                        case data_vertical_speed_1.DataVerticalSpeed.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMin.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerMinute.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedFeetPerSecond.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerSecond.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedKilometerPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinKilometerPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMilesPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinMilesPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerHour.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerHour.type, data.getValue(unit))]);
                        case data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type:
                            return accu.concat([_this.getDataInstanceFromDataType(data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerMinute.type, data.getValue(unit))]);
                    }
                    return accu;
                }, []);
            default:
                return [data];
        }
        // const a = this.getUnitBasedDataTypesFromDataType(data.getType(), userUnitSettings);
        // debugger;
        // return this.getUnitBasedDataTypesFromDataType(data.getType(), userUnitSettings)
        //   .reduce((unitBasedData: DataInterface[], dataType) => {
        //     debugger;
        //     return [...unitBasedData, this.getDataInstanceFromDataType(dataType, data.getValue(dataType))];
        //   }, [])
    };
    // Convert to enums please
    DynamicDataLoader.basicDataTypes = [
        data_heart_rate_1.DataHeartRate.type,
        data_altitude_1.DataAltitude.type,
        data_cadence_1.DataCadence.type,
        data_power_1.DataPower.type,
        data_pace_1.DataPace.type,
        data_speed_1.DataSpeed.type
    ];
    DynamicDataLoader.advancedDataTypes = [
        data_vertical_speed_1.DataVerticalSpeed.type,
        data_temperature_1.DataTemperature.type,
        data_sea_level_pressure_1.DataSeaLevelPressure.type,
        data_satellite_5_best_snr_1.DataSatellite5BestSNR.type,
        data_number_of_satellites_1.DataNumberOfSatellites.type,
        data_evpe_1.DataEVPE.type,
        data_ehpe_1.DataEHPE.type,
        data_distance_1.DataDistance.type,
        data_altitude_gps_1.DataGPSAltitude.type,
        data_absolute_pressure_1.DataAbsolutePressure.type,
        data_epoc_1.DataEPOC.type,
        data_energy_1.DataEnergy.type,
        data_battery_charge_1.DataBatteryCharge.type,
        data_battery_current_1.DataBatteryCurrent.type,
        data_battery_voltage_1.DataBatteryVoltage.type,
        data_battery_consumption_1.DataBatteryConsumption.type,
        data_form_power_1.DataFormPower.type,
        data_leg_stiffness_1.DataLegStiffness.type,
        data_vertical_oscillation_1.DataVerticalOscillation.type,
        data_total_training_effect_1.DataTotalTrainingEffect.type,
        data_ibi_1.DataIBI.type,
        data_stryd_altitude_1.DataStrydAltitude.type,
        data_accumulated_power_1.DataAccumulatedPower.type,
        data_stryd_altitude_1.DataStrydAltitude.type,
        data_stryd_distance_1.DataStrydDistance.type,
        data_stryd_speed_1.DataStrydSpeed.type,
        data_left_balance_1.DataLeftBalance.type,
        data_right_balance_1.DataRightBalance.type,
        data_power_left_1.DataPowerLeft.type,
        data_power_right_1.DataPowerRight.type,
        data_stance_time_1.DataStanceTime.type,
        data_stance_time_balance_1.DataStanceTimeBalance.type,
        data_step_length_1.DataStepLength.type,
        data_vertical_ratio_1.DataVerticalRatio.type,
        data_ground_time_1.DataGroundTime.type,
        data_air_power_1.DataAirPower.type,
    ];
    DynamicDataLoader.unitBasedDataTypes = (_a = {},
        _a[data_speed_1.DataSpeed.type] = [
            data_speed_1.DataSpeedKilometersPerHour.type,
            data_speed_1.DataSpeedMilesPerHour.type,
            data_speed_1.DataSpeedFeetPerSecond.type,
            data_speed_1.DataSpeedFeetPerMinute.type,
            data_speed_1.DataSpeedMetersPerMinute.type,
            // Pace is also based on speed
            data_pace_1.DataPace.type,
            data_pace_1.DataPaceMinutesPerMile.type,
            // Swim pace as well
            data_swim_pace_1.DataSwimPace.type,
            data_swim_pace_1.DataSwimPaceMinutesPer100Yard.type,
        ],
        _a[data_vertical_speed_1.DataVerticalSpeed.type] = [
            data_vertical_speed_1.DataVerticalSpeedFeetPerSecond.type,
            data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type,
            data_vertical_speed_1.DataVerticalSpeedFeetPerMinute.type,
            data_vertical_speed_1.DataVerticalSpeedMetersPerHour.type,
            data_vertical_speed_1.DataVerticalSpeedFeetPerHour.type,
            data_vertical_speed_1.DataVerticalSpeedKilometerPerHour.type,
            data_vertical_speed_1.DataVerticalSpeedMilesPerHour.type,
        ],
        _a);
    DynamicDataLoader.allDataTypes = DynamicDataLoader.basicDataTypes.concat(DynamicDataLoader.advancedDataTypes);
    return DynamicDataLoader;
}());
exports.DynamicDataLoader = DynamicDataLoader;
