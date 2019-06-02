"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var geolib_adapter_1 = require("../../geodesy/adapters/geolib.adapter");
var data_pace_max_1 = require("../../data/data.pace-max");
var data_pace_1 = require("../../data/data.pace");
var data_pace_min_1 = require("../../data/data.pace-min");
var data_pace_avg_1 = require("../../data/data.pace-avg");
var data_battery_charge_1 = require("../../data/data.battery-charge");
var data_battery_consumption_1 = require("../../data/data.battery-consumption");
var data_battery_life_estimation_1 = require("../../data/data.battery-life-estimation");
var data_latitude_degrees_1 = require("../../data/data.latitude-degrees");
var stream_1 = require("../../streams/stream");
var helpers_1 = require("./helpers");
var data_longitude_degrees_1 = require("../../data/data.longitude-degrees");
var EventUtilities = /** @class */ (function () {
    function EventUtilities() {
    }
    // public static async getEventAsTCXBloB(event: EventInterface): Promise<Blob> {
    //   const tcxString = await EventExporterTCX.getAsString(event);
    //   return (new Blob(
    //     [tcxString],
    //     {type: EventExporterTCX.fileType},
    //   ));
    // }
    EventUtilities.getDataTypeAvg = function (activity, streamType, startDate, endDate) {
        var data = activity
            .getSquashedStreamData(streamType, startDate, endDate);
        var average = data.reduce(function (average, value) {
            average += value;
            return average;
        }, 0);
        return (average / data.length);
    };
    EventUtilities.getDataTypeMax = function (activity, streamType, startDate, endDate) {
        return this.getDataTypeMinOrMax(activity, streamType, true, startDate, endDate);
    };
    EventUtilities.getDataTypeMin = function (activity, streamType, startDate, endDate) {
        return this.getDataTypeMinOrMax(activity, streamType, false, startDate, endDate);
    };
    EventUtilities.getDataTypeDifference = function (activity, streamType, startDate, endDate) {
        return this.getDataTypeMax(activity, streamType, startDate, endDate) - this.getDataTypeMin(activity, streamType, startDate, endDate);
    };
    EventUtilities.mergeEvents = function (events) {
        events.sort(function (eventA, eventB) {
            return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
        });
        var activities = events.reduce(function (activitiesArray, event) {
            activitiesArray.push.apply(activitiesArray, event.getActivities());
            return activitiesArray;
        }, []).map(function (activity) {
            return activity.setID(null);
        });
        var event = new event_1.Event("Merged at " + (new Date()).toISOString(), activities[0].startDate, activities[activities.length - 1].endDate);
        event.addActivities(activities);
        this.generateStatsForAll(event);
        return event;
    };
    EventUtilities.cropDistance = function (startDistance, endDistance, activity) {
        // Short to do the search just in case
        var startDistanceDate; // Does not sound right
        var endDistanceDate;
        // debugger;
        activity.getStreamData(data_distance_1.DataDistance.type).forEach(function (distanceFromData, index) {
            // Find the index with greater dinstnce and convert it to time
            if (startDistance && !startDistanceDate && distanceFromData && distanceFromData >= startDistance) {
                startDistanceDate = new Date(activity.startDate.getTime() + (index * 1000));
                return;
            }
            // Same for end
            if (endDistance && !endDistanceDate && distanceFromData && distanceFromData >= endDistance) {
                endDistanceDate = new Date(activity.startDate.getTime() + (index * 1000));
                return;
            }
        });
        if (!startDistanceDate && !endDistanceDate) {
            return activity;
        }
        debugger;
        activity = this.cropTime(activity, startDistanceDate, endDistanceDate);
        var distanceStream = activity.getAllStreams().find(function (stream) { return stream.type === data_distance_1.DataDistance.type; });
        if (distanceStream) {
            activity.removeStream(distanceStream);
        }
        // Should  reset all stats
        activity.clearStats();
        // Set the distance
        activity.setDistance(new data_distance_1.DataDistance(endDistance - startDistance));
        return activity;
    };
    EventUtilities.cropTime = function (activity, startDate, endDate) {
        activity.getAllStreams().forEach(function (stream) {
            // Get the data for the range specified
            var trimmedStreamData = activity.getStreamData(stream.type, startDate, endDate);
            // debugger;
            activity.removeStream(stream);
            activity.addStream(new stream_1.Stream(stream.type, trimmedStreamData));
        });
        activity.startDate = startDate || activity.startDate;
        activity.endDate = endDate || activity.endDate;
        // debugger
        return activity;
    };
    EventUtilities.getStreamDataTypesBasedOnDataType = function (streamToBaseOn, streams) {
        return streamToBaseOn.data.reduce(function (accu, streamDataItem, index) {
            if (!helpers_1.isNumberOrString(streamDataItem)) {
                return accu;
            }
            streams.forEach(function (stream) {
                if (helpers_1.isNumberOrString(stream.data[index])) {
                    accu[streamDataItem] = accu[streamDataItem] || {};
                    accu[streamDataItem][stream.type] = stream.data[index];
                }
            });
            return accu;
        }, {});
    };
    EventUtilities.getStreamDataTypesBasedOnTime = function (startDate, endDate, streams) {
        var streamDataBasedOnTime = {};
        var _loop_1 = function (i) {
            streams.forEach(function (stream) {
                if (helpers_1.isNumber(stream.data[i])) {
                    streamDataBasedOnTime[startDate.getTime() + (i * 1000)] = streamDataBasedOnTime[startDate.getTime() + (i * 1000)] || {};
                    streamDataBasedOnTime[startDate.getTime() + (i * 1000)][stream.type] = stream.data[i];
                }
            });
        };
        for (var i = 0; i < this.getDataLength(startDate, endDate); i++) {
            _loop_1(i);
        }
        return streamDataBasedOnTime;
    };
    EventUtilities.getDataLength = function (startDate, endDate) {
        return Math.ceil((+endDate - +startDate) / 1000);
    };
    EventUtilities.generateStatsForAll = function (event) {
        var _this = this;
        // First generate that stats on the activity it self
        event.getActivities().forEach(function (activity) {
            _this.generateMissingStreamsAndStatsForActivity(activity);
        });
        this.reGenerateStatsForEvent(event);
    };
    EventUtilities.generateMissingStreamsAndStatsForActivity = function (activity) {
        this.generateMissingStreamsForActivity(activity);
        activity.addStreams(this.getUnitStreamsFromStreams(activity.getAllStreams()));
        this.generateMissingStatsForActivity(activity);
        this.generateMissingUnitStatsForActivity(activity); // Perhaps this needs to happen on user level so needs to go out of here
    };
    EventUtilities.reGenerateStatsForEvent = function (event) {
        event.clearStats();
        event.startDate = event.getFirstActivity().startDate;
        event.endDate = event.getLastActivity().endDate;
        // If only one
        if (event.getActivities().length === 1) {
            event.getFirstActivity().getStats().forEach(function (stat) {
                event.addStat(stat);
            });
            return;
        }
        event.startDate = event.getFirstActivity().startDate;
        event.endDate = event.getLastActivity().endDate;
        event.setDuration(new data_duration_1.DataDuration(0));
        event.addStat(new data_ascent_1.DataAscent(0));
        event.addStat(new data_descent_1.DataDescent(0));
        event.getActivities().forEach(function (activity) {
            event.setDuration(new data_duration_1.DataDuration(event.getDuration().getValue() + activity.getDuration().getValue()));
        });
        event.setPause(new data_pause_1.DataPause(0));
        event.getActivities().forEach(function (activity) {
            event.setPause(new data_pause_1.DataPause(event.getPause().getValue() + activity.getPause().getValue()));
        });
        event.setDistance(new data_distance_1.DataDistance(0));
        event.getActivities().forEach(function (activity) {
            event.setDistance(new data_distance_1.DataDistance(event.getDistance().getValue() + activity.getDistance().getValue()));
        });
        event.getActivities().forEach(function (activity) {
            var activityAscent = activity.getStat(data_ascent_1.DataAscent.type);
            if (activityAscent) {
                var ascent = event.getStat(data_ascent_1.DataAscent.type);
                if (!ascent) {
                    event.addStat(new data_ascent_1.DataAscent(activityAscent.getValue()));
                }
                else {
                    event.addStat(new data_ascent_1.DataAscent(ascent.getValue() + activityAscent.getValue()));
                }
            }
        });
        event.getActivities().forEach(function (activity) {
            var activityDescent = activity.getStat(data_descent_1.DataDescent.type);
            if (activityDescent) {
                var Descent = event.getStat(data_descent_1.DataDescent.type);
                if (!Descent) {
                    event.addStat(new data_descent_1.DataDescent(activityDescent.getValue()));
                }
                else {
                    event.addStat(new data_descent_1.DataDescent(Descent.getValue() + activityDescent.getValue()));
                }
            }
        });
    };
    EventUtilities.getEventDataTypeGain = function (activity, streamType, starDate, endDate, minDiff) {
        if (minDiff === void 0) { minDiff = 5; }
        return this.getEventDataTypeGainOrLoss(activity, streamType, true, starDate, endDate, minDiff);
    };
    EventUtilities.getEventDataTypeLoss = function (activity, streamType, starDate, endDate, minDiff) {
        if (minDiff === void 0) { minDiff = 5; }
        return this.getEventDataTypeGainOrLoss(activity, streamType, false, starDate, endDate, minDiff);
    };
    EventUtilities.getEventDataTypeGainOrLoss = function (activity, streamType, gain, startDate, endDate, minDiff) {
        if (minDiff === void 0) { minDiff = 5; }
        // debugger;
        var gainOrLoss = 0;
        activity.getSquashedStreamData(streamType, startDate, endDate)
            .reduce(function (previousValue, nextValue) {
            // For gain
            if (gain) {
                // Increase the gain if eligible first check to be greater plus diff  [200, 300, 400, 100, 101, 102]
                if ((previousValue + minDiff) <= nextValue) {
                    gainOrLoss += nextValue - previousValue;
                    return nextValue;
                }
                // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
                if (previousValue < nextValue) {
                    return previousValue;
                }
                return nextValue;
            }
            // For Loss
            if ((previousValue - minDiff) >= nextValue) {
                gainOrLoss += previousValue - nextValue;
                return nextValue;
            }
            // if not eligible check if smaller without the diff and if yes do not register it and send it back as the last to check against
            if (previousValue > nextValue) {
                return previousValue;
            }
            return nextValue;
        });
        return gainOrLoss;
    };
    EventUtilities.getDataTypeMinOrMax = function (activity, streamType, max, startDate, endDate) {
        var data = activity
            .getSquashedStreamData(streamType, startDate, endDate);
        if (max) {
            return data.reduce(function (previousValue, currentValue) {
                return Math.max(previousValue, currentValue);
            }, -Infinity);
        }
        return data.reduce(function (previousValue, currentValue) {
            return Math.min(previousValue, currentValue);
        }, Infinity);
    };
    /**
     * Generates the stats for an activity
     * @param activity
     */
    EventUtilities.generateMissingStatsForActivity = function (activity) {
        // Add the number of points this activity has
        // @todo this wont work since the stats are after the generated streams // Could be wrong and I could still vise versa
        // activity.addStat(new DataNumberOfSamples(activity.getAllStreams().reduce((sum, stream) => sum + stream.getNumericData().length, 0)));
        // If there is no duration define that from the start date and end date
        if (!activity.getStat(data_duration_1.DataDuration.type)) {
            activity.addStat(new data_duration_1.DataDuration((activity.endDate.getTime() - activity.startDate.getTime()) / 1000));
        }
        // If there is no pause define that from the start date and end date and duration
        if (!activity.getStat(data_pause_1.DataPause.type)) {
            activity.addStat(new data_pause_1.DataPause(((activity.endDate.getTime() - activity.startDate.getTime()) / 1000) - activity.getDuration().getValue()));
        }
        // If there is no distance
        if (!activity.getStat(data_distance_1.DataDistance.type)) {
            var distance = 0;
            if (activity.hasStreamData(data_distance_1.DataDistance.type)) {
                distance = activity.getSquashedStreamData(data_distance_1.DataDistance.type)[activity.getSquashedStreamData(data_distance_1.DataDistance.type).length - 1];
            }
            else if (activity.hasStreamData(data_longitude_degrees_1.DataLongitudeDegrees.type) && activity.hasStreamData(data_latitude_degrees_1.DataLatitudeDegrees.type)) {
                distance = this.generateDistanceForActivity(activity, activity.startDate, activity.endDate);
            }
            activity.addStat(new data_distance_1.DataDistance(distance));
        }
        // @todo remove the start date and end date parameters
        // Ascent (altitude gain)
        if (!activity.getStat(data_ascent_1.DataAscent.type)
            && activity.hasStreamData(data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_ascent_1.DataAscent(this.getEventDataTypeGain(activity, data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)));
        }
        // Descent (altitude loss)
        if (!activity.getStat(data_descent_1.DataDescent.type)
            && activity.hasStreamData(data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_descent_1.DataDescent(this.getEventDataTypeLoss(activity, data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)));
        }
        // Altitude Max
        if (!activity.getStat(data_altitude_max_1.DataAltitudeMax.type)
            && activity.hasStreamData(data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_altitude_max_1.DataAltitudeMax(this.getDataTypeMax(activity, data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)));
        }
        // Altitude Min
        if (!activity.getStat(data_altitude_min_1.DataAltitudeMin.type)
            && activity.hasStreamData(data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_altitude_min_1.DataAltitudeMin(this.getDataTypeMin(activity, data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)));
        }
        // Altitude Avg
        if (!activity.getStat(data_altitude_avg_1.DataAltitudeAvg.type)
            && activity.hasStreamData(data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_altitude_avg_1.DataAltitudeAvg(this.getDataTypeAvg(activity, data_altitude_1.DataAltitude.type, activity.startDate, activity.endDate)));
        }
        // Heart Rate  Max
        if (!activity.getStat(data_heart_rate_max_1.DataHeartRateMax.type)
            && activity.hasStreamData(data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_heart_rate_max_1.DataHeartRateMax(this.getDataTypeMax(activity, data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)));
        }
        // Heart Rate Min
        if (!activity.getStat(data_heart_rate_min_1.DataHeartRateMin.type)
            && activity.hasStreamData(data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_heart_rate_min_1.DataHeartRateMin(this.getDataTypeMin(activity, data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)));
        }
        // Heart Rate Avg
        if (!activity.getStat(data_heart_rate_avg_1.DataHeartRateAvg.type)
            && activity.hasStreamData(data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_heart_rate_avg_1.DataHeartRateAvg(this.getDataTypeAvg(activity, data_heart_rate_1.DataHeartRate.type, activity.startDate, activity.endDate)));
        }
        // Cadence Max
        if (!activity.getStat(data_cadence_max_1.DataCadenceMax.type)
            && activity.hasStreamData(data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_cadence_max_1.DataCadenceMax(this.getDataTypeMax(activity, data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)));
        }
        // Cadence Min
        if (!activity.getStat(data_cadence_min_1.DataCadenceMin.type)
            && activity.hasStreamData(data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_cadence_min_1.DataCadenceMin(this.getDataTypeMin(activity, data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)));
        }
        // Cadence Avg
        if (!activity.getStat(data_cadence_avg_1.DataCadenceAvg.type)
            && activity.hasStreamData(data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_cadence_avg_1.DataCadenceAvg(this.getDataTypeAvg(activity, data_cadence_1.DataCadence.type, activity.startDate, activity.endDate)));
        }
        // Speed Max
        if (!activity.getStat(data_speed_max_1.DataSpeedMax.type)
            && activity.hasStreamData(data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_speed_max_1.DataSpeedMax(this.getDataTypeMax(activity, data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)));
        }
        // Speed Min
        if (!activity.getStat(data_speed_min_1.DataSpeedMin.type)
            && activity.hasStreamData(data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_speed_min_1.DataSpeedMin(this.getDataTypeMin(activity, data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)));
        }
        // Speed Avg
        if (!activity.getStat(data_speed_avg_1.DataSpeedAvg.type)
            && activity.hasStreamData(data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_speed_avg_1.DataSpeedAvg(this.getDataTypeAvg(activity, data_speed_1.DataSpeed.type, activity.startDate, activity.endDate)));
        }
        // Pace Max
        if (!activity.getStat(data_pace_max_1.DataPaceMax.type)
            && activity.hasStreamData(data_pace_1.DataPace.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_pace_max_1.DataPaceMax(this.getDataTypeMin(activity, data_pace_1.DataPace.type, activity.startDate, activity.endDate))); // Intentionally min
        }
        // Pace Min
        if (!activity.getStat(data_pace_min_1.DataPaceMin.type)
            && activity.hasStreamData(data_pace_1.DataPace.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_pace_min_1.DataPaceMin(this.getDataTypeMax(activity, data_pace_1.DataPace.type, activity.startDate, activity.endDate))); // Intentionally max
        }
        // Pace Avg
        if (!activity.getStat(data_pace_avg_1.DataPaceAvg.type)
            && activity.hasStreamData(data_pace_1.DataPace.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_pace_avg_1.DataPaceAvg(this.getDataTypeAvg(activity, data_pace_1.DataPace.type, activity.startDate, activity.endDate)));
        }
        // Vertical Speed Max
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type)
            && activity.hasStreamData(data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMax(this.getDataTypeMax(activity, data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)));
        }
        // Vertical Speed Min
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type)
            && activity.hasStreamData(data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMin(this.getDataTypeMin(activity, data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)));
        }
        // Vertical Speed Avg
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type)
            && activity.hasStreamData(data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvg(this.getDataTypeAvg(activity, data_vertical_speed_1.DataVerticalSpeed.type, activity.startDate, activity.endDate)));
        }
        // Power Max
        if (!activity.getStat(data_power_max_1.DataPowerMax.type)
            && activity.hasStreamData(data_power_1.DataPower.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_power_max_1.DataPowerMax(this.getDataTypeMax(activity, data_power_1.DataPower.type, activity.startDate, activity.endDate)));
        }
        // Power Min
        if (!activity.getStat(data_power_min_1.DataPowerMin.type)
            && activity.hasStreamData(data_power_1.DataPower.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_power_min_1.DataPowerMin(this.getDataTypeMin(activity, data_power_1.DataPower.type, activity.startDate, activity.endDate)));
        }
        if (!activity.getStat(data_power_avg_1.DataPowerAvg.type)
            && activity.hasStreamData(data_power_1.DataPower.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_power_avg_1.DataPowerAvg(this.getDataTypeAvg(activity, data_power_1.DataPower.type, activity.startDate, activity.endDate)));
        }
        // Temperature Max
        if (!activity.getStat(data_temperature_max_1.DataTemperatureMax.type)
            && activity.hasStreamData(data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_temperature_max_1.DataTemperatureMax(this.getDataTypeMax(activity, data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)));
        }
        // Temperature Min
        if (!activity.getStat(data_temperature_min_1.DataTemperatureMin.type)
            && activity.hasStreamData(data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_temperature_min_1.DataTemperatureMin(this.getDataTypeMin(activity, data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)));
        }
        // Temperature Avg
        if (!activity.getStat(data_temperature_avg_1.DataTemperatureAvg.type)
            && activity.hasStreamData(data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_temperature_avg_1.DataTemperatureAvg(this.getDataTypeAvg(activity, data_temperature_1.DataTemperature.type, activity.startDate, activity.endDate)));
        }
        // Battery Consumption Avg
        if (!activity.getStat(data_battery_consumption_1.DataBatteryConsumption.type)
            && activity.hasStreamData(data_battery_charge_1.DataBatteryCharge.type, activity.startDate, activity.endDate)) {
            activity.addStat(new data_battery_consumption_1.DataBatteryConsumption(this.getDataTypeDifference(activity, data_battery_charge_1.DataBatteryCharge.type, activity.startDate, activity.endDate)));
        }
        // Battery Life Estimation based on Consumption
        if (!activity.getStat(data_battery_life_estimation_1.DataBatteryLifeEstimation.type)) {
            var consumption = activity.getStat(data_battery_consumption_1.DataBatteryConsumption.type);
            if (consumption && consumption.getValue()) {
                activity.addStat(new data_battery_life_estimation_1.DataBatteryLifeEstimation(Number((+activity.endDate - +activity.startDate) / 1000 * 100) / Number(consumption.getValue())));
            }
        }
    };
    // @todo move to factory
    EventUtilities.generateMissingUnitStatsForActivity = function (activity) {
        if (!activity.getStat(data_pace_max_1.DataPaceMaxMinutesPerMile.type)) {
            var paceMax = activity.getStat(data_pace_max_1.DataPaceMax.type);
            if (paceMax) {
                activity.addStat(new data_pace_max_1.DataPaceMaxMinutesPerMile(helpers_1.convertPaceToPaceInMinutesPerMile(paceMax.getValue())));
            }
        }
        if (!activity.getStat(data_pace_min_1.DataPaceMinMinutesPerMile.type)) {
            var paceMin = activity.getStat(data_pace_min_1.DataPaceMin.type);
            if (paceMin) {
                activity.addStat(new data_pace_min_1.DataPaceMinMinutesPerMile(helpers_1.convertPaceToPaceInMinutesPerMile(paceMin.getValue())));
            }
        }
        if (!activity.getStat(data_pace_avg_1.DataPaceAvgMinutesPerMile.type)) {
            var paceAvg = activity.getStat(data_pace_avg_1.DataPaceAvg.type);
            if (paceAvg) {
                activity.addStat(new data_pace_avg_1.DataPaceAvgMinutesPerMile(helpers_1.convertPaceToPaceInMinutesPerMile(paceAvg.getValue())));
            }
        }
        if (!activity.getStat(data_speed_max_1.DataSpeedMaxKilometersPerHour.type)) {
            var speedMax = activity.getStat(data_speed_max_1.DataSpeedMax.type);
            if (speedMax) {
                activity.addStat(new data_speed_max_1.DataSpeedMaxKilometersPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(speedMax.getValue())));
            }
        }
        if (!activity.getStat(data_speed_max_1.DataSpeedMaxMilesPerHour.type)) {
            var speedMax = activity.getStat(data_speed_max_1.DataSpeedMax.type);
            if (speedMax) {
                activity.addStat(new data_speed_max_1.DataSpeedMaxMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(speedMax.getValue())));
            }
        }
        if (!activity.getStat(data_speed_max_1.DataSpeedMaxFeetPerSecond.type)) {
            var speedMax = activity.getStat(data_speed_max_1.DataSpeedMax.type);
            if (speedMax) {
                activity.addStat(new data_speed_max_1.DataSpeedMaxFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(speedMax.getValue())));
            }
        }
        if (!activity.getStat(data_speed_max_1.DataSpeedMaxFeetPerMinute.type)) {
            var speedMax = activity.getStat(data_speed_max_1.DataSpeedMax.type);
            if (speedMax) {
                activity.addStat(new data_speed_max_1.DataSpeedMaxFeetPerMinute(helpers_1.convertSpeedToSpeedInFeetPerMinute(speedMax.getValue())));
            }
        }
        if (!activity.getStat(data_speed_min_1.DataSpeedMinKilometersPerHour.type)) {
            var speedMin = activity.getStat(data_speed_min_1.DataSpeedMin.type);
            if (speedMin) {
                activity.addStat(new data_speed_min_1.DataSpeedMinKilometersPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(speedMin.getValue())));
            }
        }
        if (!activity.getStat(data_speed_min_1.DataSpeedMinMilesPerHour.type)) {
            var speedMin = activity.getStat(data_speed_min_1.DataSpeedMin.type);
            if (speedMin) {
                activity.addStat(new data_speed_min_1.DataSpeedMinMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(speedMin.getValue())));
            }
        }
        if (!activity.getStat(data_speed_min_1.DataSpeedMinFeetPerSecond.type)) {
            var speedMin = activity.getStat(data_speed_min_1.DataSpeedMin.type);
            if (speedMin) {
                activity.addStat(new data_speed_min_1.DataSpeedMinFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(speedMin.getValue())));
            }
        }
        if (!activity.getStat(data_speed_avg_1.DataSpeedAvgKilometersPerHour.type)) {
            var speedAvg = activity.getStat(data_speed_avg_1.DataSpeedAvg.type);
            if (speedAvg) {
                activity.addStat(new data_speed_avg_1.DataSpeedAvgKilometersPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(speedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_speed_avg_1.DataSpeedAvgMilesPerHour.type)) {
            var speedAvg = activity.getStat(data_speed_avg_1.DataSpeedAvg.type);
            if (speedAvg) {
                activity.addStat(new data_speed_avg_1.DataSpeedAvgMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(speedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_speed_avg_1.DataSpeedAvgFeetPerSecond.type)) {
            var speedAvg = activity.getStat(data_speed_avg_1.DataSpeedAvg.type);
            if (speedAvg) {
                activity.addStat(new data_speed_avg_1.DataSpeedAvgFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(speedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerSecond.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerMinute.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerMinute(helpers_1.convertSpeedToSpeedInMetersPerMinute(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerMinute.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerMinute(helpers_1.convertSpeedToSpeedInFeetPerMinute(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerHour.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgMetersPerHour(helpers_1.convertSpeedToSpeedInMetersPerHour(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerHour.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgFeetPerHour(helpers_1.convertSpeedToSpeedInFeetPerHour(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgKilometerPerHour.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgKilometerPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvgMilesPerHour.type)) {
            var verticalSpeedAvg = activity.getStat(data_vertical_speed_avg_1.DataVerticalSpeedAvg.type);
            if (verticalSpeedAvg) {
                activity.addStat(new data_vertical_speed_avg_1.DataVerticalSpeedAvgMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(verticalSpeedAvg.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerSecond.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerMinute.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerMinute(helpers_1.convertSpeedToSpeedInMetersPerMinute(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerMinute.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerMinute(helpers_1.convertSpeedToSpeedInFeetPerMinute(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerHour.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxMetersPerHour(helpers_1.convertSpeedToSpeedInMetersPerHour(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerHour.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxFeetPerHour(helpers_1.convertSpeedToSpeedInFeetPerHour(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxKilometerPerHour.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxKilometerPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMaxMilesPerHour.type)) {
            var verticalSpeedMax = activity.getStat(data_vertical_speed_max_1.DataVerticalSpeedMax.type);
            if (verticalSpeedMax) {
                activity.addStat(new data_vertical_speed_max_1.DataVerticalSpeedMaxMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(verticalSpeedMax.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerSecond.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerSecond(helpers_1.convertSpeedToSpeedInFeetPerSecond(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerMinute.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerMinute(helpers_1.convertSpeedToSpeedInMetersPerMinute(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerMinute.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerMinute(helpers_1.convertSpeedToSpeedInFeetPerMinute(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerHour.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinMetersPerHour(helpers_1.convertSpeedToSpeedInMetersPerHour(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerHour.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinFeetPerHour(helpers_1.convertSpeedToSpeedInFeetPerHour(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinKilometerPerHour.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinKilometerPerHour(helpers_1.convertSpeedToSpeedInKilometersPerHour(verticalSpeedMin.getValue())));
            }
        }
        if (!activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMinMilesPerHour.type)) {
            var verticalSpeedMin = activity.getStat(data_vertical_speed_min_1.DataVerticalSpeedMin.type);
            if (verticalSpeedMin) {
                activity.addStat(new data_vertical_speed_min_1.DataVerticalSpeedMinMilesPerHour(helpers_1.convertSpeedToSpeedInMilesPerHour(verticalSpeedMin.getValue())));
            }
        }
    };
    /**
     * Generates missing streams for an activity such as distance etc if they are missing
     * @param activity
     */
    EventUtilities.generateMissingStreamsForActivity = function (activity) {
        var _this = this;
        // Generate distance
        if (activity.hasStreamData(data_latitude_degrees_1.DataLatitudeDegrees.type) && !activity.hasStreamData(data_distance_1.DataDistance.type)) {
            var distanceStream_1 = activity.createStream(data_distance_1.DataDistance.type);
            var distance_1 = 0;
            activity.getPositionData().reduce(function (prevPosition, position, index, array) {
                // debugger;
                if (!position) {
                    return prevPosition;
                }
                if (prevPosition && position) {
                    distance_1 += _this.geoLibAdapter.getDistance([prevPosition, position]);
                }
                distanceStream_1.data[index] = distance_1;
                return position;
            });
            activity.addStream(distanceStream_1);
        }
        return activity;
    };
    EventUtilities.generateDistanceForActivity = function (activity, startDate, endDate) {
        return this.geoLibAdapter.getDistance(activity.getPositionData(startDate, endDate).filter(function (position) { return position !== null; }));
    };
    /**
     * @todo optimize with whitelist
     * @param streams
     */
    EventUtilities.getUnitStreamsFromStreams = function (streams) {
        var unitStreams = [];
        // Check if they contain the needed info
        var speedStream = streams.find(function (stream) { return stream.type === data_speed_1.DataSpeed.type; });
        var verticalSpeedStream = streams.find(function (stream) { return stream.type === data_vertical_speed_1.DataVerticalSpeed.type; });
        var paceStream = streams.find(function (stream) { return stream.type === data_pace_1.DataPace.type; });
        if (!speedStream) {
            throw new Error("No supported units found");
        }
        if (!paceStream) {
            paceStream = new stream_1.Stream(data_pace_1.DataPace.type, speedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToPace(dataValue);
            }));
            unitStreams.push(paceStream);
        }
        // Generate speed in Kilometers per hour
        unitStreams.push(new stream_1.Stream(data_speed_1.DataSpeedKilometersPerHour.type, speedStream.data.map(function (dataValue) {
            if (!helpers_1.isNumber(dataValue)) {
                return null;
            }
            return helpers_1.convertSpeedToSpeedInKilometersPerHour(dataValue);
        })));
        // Generate speed in Miles per hour
        unitStreams.push(new stream_1.Stream(data_speed_1.DataSpeedMilesPerHour.type, speedStream.data.map(function (dataValue) {
            if (!helpers_1.isNumber(dataValue)) {
                return null;
            }
            return helpers_1.convertSpeedToSpeedInMilesPerHour(dataValue);
        })));
        // Generate speed in feet per second
        unitStreams.push(new stream_1.Stream(data_speed_1.DataSpeedFeetPerSecond.type, speedStream.data.map(function (dataValue) {
            if (!helpers_1.isNumber(dataValue)) {
                return null;
            }
            return helpers_1.convertSpeedToSpeedInFeetPerSecond(dataValue);
        })));
        // Generate pace in minutes per mile
        unitStreams.push(new stream_1.Stream(data_pace_1.DataPaceMinutesPerMile.type, paceStream.data.map(function (dataValue) {
            if (!helpers_1.isNumber(dataValue)) {
                return null;
            }
            return helpers_1.convertPaceToPaceInMinutesPerMile(dataValue);
        })));
        // If we have more vertical speed data
        if (verticalSpeedStream) {
            // Generate vertical speed in feet per second
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedFeetPerSecond.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInFeetPerSecond(dataValue);
            })));
            // Generate vertical speed in meters per minute
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInMetersPerMinute(dataValue);
            })));
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedMetersPerMinute.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInMetersPerMinute(dataValue);
            })));
            // Generate vertical speed in feet per mintute
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedFeetPerMinute.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInFeetPerMinute(dataValue);
            })));
            // Generate vertical speed in meters per hour
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedMetersPerHour.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInMetersPerHour(dataValue);
            })));
            // Generate vertical speed in feet per hour
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedFeetPerHour.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInFeetPerHour(dataValue);
            })));
            // Generate vertical speed in in kilometers per hour
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedKilometerPerHour.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInKilometersPerHour(dataValue);
            })));
            // Generate vertical speed in miles per hour
            unitStreams.push(new stream_1.Stream(data_vertical_speed_1.DataVerticalSpeedMilesPerHour.type, verticalSpeedStream.data.map(function (dataValue) {
                if (!helpers_1.isNumber(dataValue)) {
                    return null;
                }
                return helpers_1.convertSpeedToSpeedInMilesPerHour(dataValue);
            })));
        }
        return unitStreams;
    };
    EventUtilities.geoLibAdapter = new geolib_adapter_1.GeoLibAdapter();
    return EventUtilities;
}());
exports.EventUtilities = EventUtilities;
