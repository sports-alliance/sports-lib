"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exporter_tcx_1 = require("../adapters/exporters/exporter.tcx");
var event_1 = require("../event");
var data_heart_rate_1 = require("../../data/data.heart-rate");
var data_cadence_1 = require("../../data/data.cadence");
var data_speed_1 = require("../../data/data.speed");
var data_vertical_speed_1 = require("../../data/data.vertical-speed");
var data_temperature_1 = require("../../data/data.temperature");
var data_altitude_1 = require("../../data/data.altitude");
var data_power_1 = require("../../data/data.power");
var data_altitude_max_1 = require("../../data/data.altitude-max");
var data_altitude_min_1 = require("../../data/data.altitude-min");
var data_altitude_avg_1 = require("../../data/data.altitude-avg");
var data_heart_rate_max_1 = require("../../data/data.heart-rate-max");
var data_heart_rate_min_1 = require("../../data/data.heart-rate-min");
var data_heart_rate_avg_1 = require("../../data/data.heart-rate-avg");
var data_cadence_max_1 = require("../../data/data.cadence-max");
var data_cadence_min_1 = require("../../data/data.cadence-min");
var data_cadence_avg_1 = require("../../data/data.cadence-avg");
var data_speed_max_1 = require("../../data/data.speed-max");
var data_speed_min_1 = require("../../data/data.speed-min");
var data_speed_avg_1 = require("../../data/data.speed-avg");
var data_vertical_speed_max_1 = require("../../data/data.vertical-speed-max");
var data_vertical_speed_min_1 = require("../../data/data.vertical-speed-min");
var data_vertical_speed_avg_1 = require("../../data/data.vertical-speed-avg");
var data_power_max_1 = require("../../data/data.power-max");
var data_power_min_1 = require("../../data/data.power-min");
var data_power_avg_1 = require("../../data/data.power-avg");
var data_temperature_max_1 = require("../../data/data.temperature-max");
var data_temperature_min_1 = require("../../data/data.temperature-min");
var data_temperature_avg_1 = require("../../data/data.temperature-avg");
var data_distance_1 = require("../../data/data.distance");
var data_duration_1 = require("../../data/data.duration");
var data_pause_1 = require("../../data/data.pause");
var data_ascent_1 = require("../../data/data.ascent");
var data_descent_1 = require("../../data/data.descent");
var EventUtilities = /** @class */ (function () {
    function EventUtilities() {
    }
    EventUtilities.getEventAsTCXBloB = function (event) {
        return new Promise(function (resolve, reject) {
            resolve(new Blob([(new exporter_tcx_1.EventExporterTCX).getAsString(event)], { type: (new exporter_tcx_1.EventExporterTCX).getFileType() }));
        });
    };
    EventUtilities.getDataTypeAverage = function (event, dataType, startDate, endDate, activities) {
        var count = 0;
        var averageForDataType = event.getPoints(startDate, endDate, activities).reduce(function (average, point) {
            var data = point.getDataByType(dataType);
            if (!data) {
                return average;
            }
            average += Number(data.getValue());
            count++;
            return average;
        }, 0);
        return (averageForDataType / count);
    };
    EventUtilities.getDateTypeMaximum = function (event, dataType, startDate, endDate, activities) {
        return this.getDataTypeMinOrMax(true, event, dataType, startDate, endDate, activities);
    };
    EventUtilities.getDateTypeMinimum = function (event, dataType, startDate, endDate, activities) {
        return this.getDataTypeMinOrMax(false, event, dataType, startDate, endDate, activities);
    };
    EventUtilities.mergeEvents = function (events) {
        return new Promise(function (resolve, reject) {
            // First sort the events by first point date
            events.sort(function (eventA, eventB) {
                return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
            });
            var mergeEvent = new event_1.Event("Merged at " + (new Date()).toISOString());
            mergeEvent.setDistance(new data_distance_1.DataDistance(0));
            mergeEvent.setDuration(new data_duration_1.DataDuration(0));
            mergeEvent.setPause(new data_pause_1.DataPause(0));
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var event_2 = events_1[_i];
                for (var _a = 0, _b = event_2.getActivities(); _a < _b.length; _a++) {
                    var activity = _b[_a];
                    mergeEvent.addActivity(activity);
                    mergeEvent.getDistance().setValue(mergeEvent.getDistance().getValue() + activity.getDistance().getValue());
                    mergeEvent.getDuration().setValue(mergeEvent.getDuration().getValue() + activity.getDuration().getValue());
                    mergeEvent.getPause().setValue(mergeEvent.getPause().getValue() + activity.getPause().getValue());
                }
            }
            return resolve(mergeEvent);
        });
    };
    EventUtilities.generateStats = function (event) {
        var _this = this;
        // Todo should also work for event
        event.getActivities().map(function (activity) {
            _this.generateStatsForActivityOrLap(event, activity);
            activity.getLaps().map(function (lap) {
                _this.generateStatsForActivityOrLap(event, lap);
            });
        });
    };
    EventUtilities.getEventDataTypeGain = function (event, dataType, starDate, endDate, activities, minDiff) {
        return this.getEventDataTypeGainOrLoss(true, event, dataType, starDate, endDate, activities, minDiff);
    };
    EventUtilities.getEventDataTypeLoss = function (event, dataType, starDate, endDate, activities, minDiff) {
        return this.getEventDataTypeGainOrLoss(false, event, dataType, starDate, endDate, activities, minDiff);
    };
    EventUtilities.getEventDataTypeGainOrLoss = function (gain, event, dataType, starDate, endDate, activities, minDiff) {
        if (minDiff === void 0) { minDiff = 3.1; }
        var gainOrLoss = 0;
        var points = event.getPoints(starDate, endDate, activities);
        // Todo get by type
        points.reduce(function (previous, next) {
            var previousDataType = previous.getDataByType(dataType);
            var nextDataType = next.getDataByType(dataType);
            if (!previousDataType) {
                return next;
            }
            if (!nextDataType) {
                return previous;
            }
            // For gain
            if (gain) {
                // Increase the gain if eligible first check to be greater plus diff  [200, 300, 400, 100, 101, 102]
                if ((previousDataType.getValue() + minDiff) <= nextDataType.getValue()) {
                    gainOrLoss += nextDataType.getValue() - previousDataType.getValue();
                    return next;
                }
                // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
                if (previousDataType.getValue() <= nextDataType.getValue()) {
                    return previous;
                }
                return next;
            }
            // For Loss
            if ((previousDataType.getValue() - minDiff) >= nextDataType.getValue()) {
                gainOrLoss += previousDataType.getValue() - nextDataType.getValue();
                return next;
            }
            // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
            if (previousDataType.getValue() >= nextDataType.getValue()) {
                return previous;
            }
            return next;
        });
        return gainOrLoss;
    };
    EventUtilities.getDataTypeMinOrMax = function (max, event, dataType, startDate, endDate, activities) {
        var dataValuesArray = event.getPoints(startDate, endDate, activities).reduce(function (dataValues, point) {
            var pointData = point.getDataByType(dataType);
            if (pointData) {
                dataValues.push(pointData.getValue());
            }
            return dataValues;
        }, []);
        if (max) {
            return Math.max.apply(Math, dataValuesArray);
        }
        return Math.min.apply(Math, dataValuesArray);
    };
    EventUtilities.generateStatsForActivityOrLap = function (event, subject) {
        // Altitude
        if (subject.getStat(data_altitude_max_1.DataAltitudeMax.className) === undefined && this.getDateTypeMaximum(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_altitude_max_1.DataAltitudeMax(this.getDateTypeMaximum(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_altitude_min_1.DataAltitudeMin.className) === undefined && this.getDateTypeMinimum(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_altitude_min_1.DataAltitudeMin(this.getDateTypeMinimum(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_altitude_avg_1.DataAltitudeAvg.className) === undefined && this.getDataTypeAverage(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_altitude_avg_1.DataAltitudeAvg(this.getDataTypeAverage(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate)));
        }
        // Heart Rate
        if (subject.getStat(data_heart_rate_max_1.DataHeartRateMax.className) === undefined && this.getDateTypeMaximum(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_heart_rate_max_1.DataHeartRateMax(this.getDateTypeMaximum(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_heart_rate_min_1.DataHeartRateMin.className) === undefined && this.getDateTypeMinimum(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_heart_rate_min_1.DataHeartRateMin(this.getDateTypeMinimum(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_heart_rate_avg_1.DataHeartRateAvg.className) === undefined && this.getDataTypeAverage(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_heart_rate_avg_1.DataHeartRateAvg(this.getDataTypeAverage(event, data_heart_rate_1.DataHeartRate.type, subject.startDate, subject.endDate)));
        }
        // Cadence
        if (subject.getStat(data_cadence_max_1.DataCadenceMax.className) === undefined && this.getDateTypeMaximum(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_cadence_max_1.DataCadenceMax(this.getDateTypeMaximum(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_cadence_min_1.DataCadenceMin.className) === undefined && this.getDateTypeMinimum(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_cadence_min_1.DataCadenceMin(this.getDateTypeMinimum(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_cadence_avg_1.DataCadenceAvg.className) === undefined && this.getDataTypeAverage(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_cadence_avg_1.DataCadenceAvg(this.getDataTypeAverage(event, data_cadence_1.DataCadence.type, subject.startDate, subject.endDate)));
        }
        // Speed
        if (subject.getStat(data_speed_max_1.DataSpeedMax.className) === undefined && this.getDateTypeMaximum(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_speed_max_1.DataSpeedMax(this.getDateTypeMaximum(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_speed_min_1.DataSpeedMin.className) === undefined && this.getDateTypeMinimum(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_speed_min_1.DataSpeedMin(this.getDateTypeMinimum(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_speed_avg_1.DataSpeedAvg.className) === undefined && this.getDataTypeAverage(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_speed_avg_1.DataSpeedAvg(this.getDataTypeAverage(event, data_speed_1.DataSpeed.type, subject.startDate, subject.endDate)));
        }
        // Vertical Speed
        if (subject.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.className) === undefined && this.getDateTypeMaximum(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMax(this.getDateTypeMaximum(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.className) === undefined && this.getDateTypeMinimum(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMin(this.getDateTypeMinimum(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.className) === undefined && this.getDataTypeAverage(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(this.getDataTypeAverage(event, data_vertical_speed_1.DataVerticalSpeed.type, subject.startDate, subject.endDate)));
        }
        // Power
        if (subject.getStat(data_power_max_1.DataPowerMax.className) === undefined && this.getDateTypeMaximum(event, data_power_1.DataPower.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_power_max_1.DataPowerMax(this.getDateTypeMaximum(event, data_power_1.DataPower.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_power_min_1.DataPowerMin.className) === undefined && this.getDateTypeMinimum(event, data_power_1.DataPower.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_power_min_1.DataPowerMin(this.getDateTypeMinimum(event, data_power_1.DataPower.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_power_avg_1.DataPowerAvg.className) === undefined && this.getDataTypeAverage(event, data_power_1.DataPower.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_power_avg_1.DataPowerAvg(this.getDataTypeAverage(event, data_power_1.DataPower.type, subject.startDate, subject.endDate)));
        }
        // Temperature
        if (subject.getStat(data_temperature_max_1.DataTemperatureMax.className) === undefined && this.getDateTypeMaximum(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_temperature_max_1.DataTemperatureMax(this.getDateTypeMaximum(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_temperature_min_1.DataTemperatureMin.className) === undefined && this.getDateTypeMinimum(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_temperature_min_1.DataTemperatureMin(this.getDateTypeMinimum(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate)));
        }
        if (subject.getStat(data_temperature_avg_1.DataTemperatureAvg.className) === undefined && this.getDataTypeAverage(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_temperature_avg_1.DataTemperatureAvg(this.getDataTypeAverage(event, data_temperature_1.DataTemperature.type, subject.startDate, subject.endDate)));
        }
        // Ascent (altitude gain)
        if (subject.getStat(data_ascent_1.DataAscent.className) === undefined && this.getEventDataTypeGain(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_ascent_1.DataAscent(this.getEventDataTypeGain(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate)));
        }
        // Descent (altitude loss)
        if (subject.getStat(data_descent_1.DataDescent.className) === undefined && this.getEventDataTypeLoss(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate) !== null) {
            subject.addStat(new data_descent_1.DataDescent(this.getEventDataTypeLoss(event, data_altitude_1.DataAltitude.type, subject.startDate, subject.endDate)));
        }
    };
    return EventUtilities;
}());
exports.EventUtilities = EventUtilities;
function isNumberOrString(property) {
    return (typeof property === 'number' || typeof property === 'string');
}
exports.isNumberOrString = isNumberOrString;
