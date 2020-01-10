"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = require("../../../event");
var activity_1 = require("../../../../activities/activity");
var creator_1 = require("../../../../creators/creator");
var lap_1 = require("../../../../laps/lap");
var data_energy_1 = require("../../../../data/data.energy");
var data_duration_1 = require("../../../../data/data.duration");
var data_distance_1 = require("../../../../data/data.distance");
var data_pause_1 = require("../../../../data/data.pause");
var data_speed_max_1 = require("../../../../data/data.speed-max");
var data_heart_rate_avg_1 = require("../../../../data/data.heart-rate-avg");
var data_heart_rate_max_1 = require("../../../../data/data.heart-rate-max");
var activity_types_1 = require("../../../../activities/activity.types");
var data_speed_avg_1 = require("../../../../data/data.speed-avg");
var lap_types_1 = require("../../../../laps/lap.types");
var importer_suunto_device_names_1 = require("../suunto/importer.suunto.device.names");
var data_pace_avg_1 = require("../../../../data/data.pace-avg");
var data_pace_max_1 = require("../../../../data/data.pace-max");
var importer_tcx_mapper_1 = require("./importer.tcx.mapper");
var event_utilities_1 = require("../../../utilities/event.utilities");
var helpers_1 = require("../../../utilities/helpers");
var EventImporterTCX = /** @class */ (function () {
    function EventImporterTCX() {
    }
    EventImporterTCX.getFromXML = function (xml, name) {
        var _this = this;
        if (name === void 0) { name = 'New Event'; }
        return new Promise(function (resolve, reject) {
            // Activities
            var activities = Array.from(xml.getElementsByTagName('TrainingCenterDatabase')[0].getElementsByTagName('Activity'))
                .map(function (activityElement) {
                // TCX begins with laps, get them
                var laps = _this.getLaps(activityElement.getElementsByTagName('Lap'));
                var activity = new activity_1.Activity(new Date(activityElement.getElementsByTagName('Lap')[0].getAttribute('StartTime')), laps[laps.length - 1].endDate, activity_types_1.ActivityTypes[activityElement.getAttribute('Sport') || 'unknown'], _this.getCreator(activityElement.getElementsByTagName('Creator')[0]));
                // Go over the laps and start filling up the stats and creating the points
                // @todo
                activity.setDuration(new data_duration_1.DataDuration(0));
                activity.setDistance(new data_distance_1.DataDistance(0));
                activity.setPause(new data_pause_1.DataPause(0));
                activity.addStat(new data_energy_1.DataEnergy(0));
                // Get the laps and add the total distance to the activity
                laps.forEach(function (lap) {
                    if (lap.getDuration().getValue() === 0) {
                        return;
                    }
                    activity.addLap(lap);
                    // Increment wrapper stats
                    activity.getDistance().setValue(activity.getDistance().getValue() + lap.getDistance().getValue());
                    activity.getDuration().setValue(activity.getDuration().getValue() + lap.getDuration().getValue());
                    activity.getPause().setValue(activity.getPause().getValue() + lap.getPause().getValue());
                    if (lap.getStat(data_energy_1.DataEnergy.type)) {
                        activity.addStat(new data_energy_1.DataEnergy(activity.getStat(data_energy_1.DataEnergy.type).getValue() + lap.getStat(data_energy_1.DataEnergy.type).getValue()));
                    }
                    // Todo perhaps think about distance if 0 to add the lap as pause
                });
                // @todo reduce laps to trackpoints
                var trackPointElements = Array.from(activityElement.getElementsByTagName('Lap')).reduce(function (trackPointElementArray, lapElement) {
                    Array.from(lapElement.getElementsByTagName('Trackpoint')).forEach(function (trackPointElement) {
                        trackPointElementArray.push(trackPointElement);
                    });
                    return trackPointElementArray;
                }, []);
                // If the distance from laps is 0 and there is a last trackpoint with distance use that
                if (activity.getDistance().getValue() === 0 && trackPointElements[trackPointElements.length - 1].getElementsByTagName('DistanceMeters')[0]) {
                    activity.setDistance(new data_distance_1.DataDistance(Number(trackPointElements[trackPointElements.length - 1].getElementsByTagName('DistanceMeters')[0].textContent)));
                }
                importer_tcx_mapper_1.TCXSampleMapper.forEach(function (sampleMapping) {
                    // Should check the children
                    var subjectTrackPointElements = trackPointElements.filter(function (element) {
                        return helpers_1.isNumber(sampleMapping.getSampleValue(element));
                    });
                    if (subjectTrackPointElements.length) {
                        activity.addStream(activity.createStream(sampleMapping.dataType));
                        subjectTrackPointElements.forEach(function (subjectTrackPointElement) {
                            activity.addDataToStream(sampleMapping.dataType, (new Date(subjectTrackPointElement.getElementsByTagName('Time')[0].textContent)), sampleMapping.getSampleValue(subjectTrackPointElement));
                        });
                    }
                });
                return activity;
            });
            // Init the event
            var event = new event_1.Event(name, activities[0].startDate, activities[activities.length - 1].endDate);
            activities.forEach(function (activity) { return event.addActivity(activity); });
            event_utilities_1.EventUtilities.generateStatsForAll(event);
            resolve(event);
        });
    };
    EventImporterTCX.getCreator = function (creatorElement) {
        var creator;
        creator = new creator_1.Creator('Unknown device');
        if (!creatorElement) {
            return creator;
        }
        // Try to see if its a listed Suunto Device name
        if (creatorElement.getElementsByTagName('Name')[0]) {
            creator.name = importer_suunto_device_names_1.ImporterSuuntoDeviceNames[creatorElement.getElementsByTagName('Name')[0].textContent]
                || creatorElement.getElementsByTagName('Name')[0].textContent || creator.name;
        }
        if (creatorElement.getElementsByTagName('Version')[0]) {
            creator.swInfo = creatorElement.getElementsByTagName('Version')[0].textContent;
        }
        return creator;
    };
    EventImporterTCX.getLaps = function (lapElements) {
        return Array.from(lapElements).reduce(function (lapArray, lapElement) {
            // Create the lap
            var lap = new lap_1.Lap(new Date(lapElement.getAttribute('StartTime')), new Date(+(new Date(lapElement.getAttribute('StartTime'))) +
                1000 * Number(lapElement.getElementsByTagName('TotalTimeSeconds')[0].textContent)), lap_types_1.LapTypes.AutoLap);
            if (lapElement.getElementsByTagName('TriggerMethod')[0]) {
                lap.type = lap_types_1.LapTypes[lapElement.getElementsByTagName('TriggerMethod')[0].textContent];
            }
            if (lapElement.getElementsByTagName('Calories')[0]) {
                lap.addStat(new data_energy_1.DataEnergy(Number(lapElement.getElementsByTagName('Calories')[0].textContent)));
            }
            // Create a stats (required TCX fields)
            lap.addStat(new data_duration_1.DataDuration(Number(lapElement.getElementsByTagName('TotalTimeSeconds')[0].textContent)));
            lap.addStat(new data_distance_1.DataDistance(Number(lapElement.getElementsByTagName('DistanceMeters')[0].textContent)));
            lap.setPause(new data_pause_1.DataPause(0));
            // Optionals
            if (lapElement.getElementsByTagName('MaximumSpeed')[0]) {
                lap.addStat(new data_speed_max_1.DataSpeedMax(Number(lapElement.getElementsByTagName('MaximumSpeed')[0].textContent)));
                lap.addStat(new data_pace_max_1.DataPaceMax(helpers_1.convertSpeedToPace(Number(lapElement.getElementsByTagName('MaximumSpeed')[0].textContent))));
            }
            if (lapElement.getElementsByTagName('AverageHeartRateBpm')[0]) {
                lap.addStat(new data_heart_rate_avg_1.DataHeartRateAvg(Number(lapElement.getElementsByTagName('AverageHeartRateBpm')[0].getElementsByTagName('Value')[0].textContent)));
            }
            if (lapElement.getElementsByTagName('MaximumHeartRateBpm')[0]) {
                lap.addStat(new data_heart_rate_max_1.DataHeartRateMax(Number(lapElement.getElementsByTagName('MaximumHeartRateBpm')[0].getElementsByTagName('Value')[0].textContent)));
            }
            if (lapElement.getElementsByTagName('Extensions')[0] && lapElement.getElementsByTagName('Extensions')[0].getElementsByTagName('AvgSpeed')[0]) {
                lap.addStat(new data_speed_avg_1.DataSpeedAvg(Number(lapElement.getElementsByTagName('Extensions')[0].getElementsByTagName('AvgSpeed')[0].textContent)));
                lap.addStat(new data_pace_avg_1.DataPaceAvg(helpers_1.convertSpeedToPace(Number(lapElement.getElementsByTagName('Extensions')[0].getElementsByTagName('AvgSpeed')[0].textContent))));
            }
            // Should check the track
            var lastPointFromPreviousTrack;
            // Get all the tracks and find the lap pause for this one
            Array.from(lapElement.getElementsByTagName('Track')).forEach(function (trackElement) {
                // Get the last
                var firstPointFromCurrentTrack = trackElement.getElementsByTagName('Trackpoint')[0];
                // If there is no first point then no need to iterate it's empty
                if (!firstPointFromCurrentTrack) {
                    return;
                }
                // if we do not have a last point of a previous parsed track set it to this one
                if (!lastPointFromPreviousTrack) {
                    lastPointFromPreviousTrack = trackElement.getElementsByTagName('Trackpoint')[trackElement.getElementsByTagName('Trackpoint').length - 1];
                    return;
                }
                // Here we should have the current first point and the last point from the previous track
                var lastPointTime = (new Date(lastPointFromPreviousTrack.getElementsByTagName('Time')[0].textContent)).getTime();
                var firstPointTime = (new Date(firstPointFromCurrentTrack.getElementsByTagName('Time')[0].textContent)).getTime();
                lap.setPause(new data_pause_1.DataPause(lap.getPause().getValue() + (firstPointTime - lastPointTime) / 1000));
                // Set the last to this one (will become the previous track on next track)
                lastPointFromPreviousTrack = trackElement.getElementsByTagName('Trackpoint')[trackElement.getElementsByTagName('Trackpoint').length - 1];
            });
            lapArray.push(lap);
            return lapArray;
        }, []);
    };
    return EventImporterTCX;
}());
exports.EventImporterTCX = EventImporterTCX;
