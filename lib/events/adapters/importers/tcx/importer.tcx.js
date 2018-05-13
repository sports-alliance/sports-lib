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
var data_latitude_degrees_1 = require("../../../../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../../../../data/data.longitude-degrees");
var data_power_1 = require("../../../../data/data.power");
var event_utilities_1 = require("../../../utilities/event.utilities");
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
var EventImporterTCX = /** @class */ (function () {
    function EventImporterTCX() {
    }
    EventImporterTCX.getFromXML = function (xml, name) {
        var _this = this;
        if (name === void 0) { name = 'New Event'; }
        // Init the event
        var event = new event_1.Event(name);
        event.setDistance(new data_distance_1.DataDistance(0));
        event.setDuration(new data_duration_1.DataDuration(0));
        event.setPause(new data_pause_1.DataPause(0));
        var _loop_1 = function (activityElement) {
            // TCX begins with laps, get them
            var laps = this_1.getLaps(activityElement.getElementsByTagName('Lap'));
            var activity = new activity_1.Activity(new Date(activityElement.getElementsByTagName('Lap')[0].getAttribute('StartTime')), laps[laps.length - 1].endDate, activity_types_1.ActivityTypes[activityElement.getAttribute('Sport')] || activity_types_1.ActivityTypes['unknown'], this_1.getCreator(activityElement.getElementsByTagName('Creator')[0]));
            event.addActivity(activity);
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
                activity.addStat(new data_energy_1.DataEnergy(activity.getStat(data_energy_1.DataEnergy.className).getValue() + lap.getStat(data_energy_1.DataEnergy.className).getValue()));
                // Todo perhaps think about distance if 0 to add the lap as pause
                // Same for event
                event.getDistance().setValue(event.getDistance().getValue() + lap.getDistance().getValue());
                event.setDuration(new data_duration_1.DataDuration(event.getDuration().getValue() + lap.getDuration().getValue()));
                event.getPause().setValue(event.getPause().getValue() + lap.getPause().getValue());
            });
            Array.from(activityElement.getElementsByTagName('Lap')).map(function (lapElement) {
                _this.getPoints(lapElement.getElementsByTagName('Trackpoint')).map(function (point) {
                    activity.addPoint(point);
                });
            });
            activity.sortPointsByDate();
        };
        var this_1 = this;
        // Activities
        for (var _i = 0, _a = xml.getElementsByTagName('TrainingCenterDatabase')[0].getElementsByTagName('Activity'); _i < _a.length; _i++) {
            var activityElement = _a[_i];
            _loop_1(activityElement);
        }
        event_utilities_1.EventUtilities.generateStats(event);
        return event;
    };
    EventImporterTCX.getPoints = function (trackPointsElements) {
        return Array.from(trackPointsElements).reduce(function (pointsArray, trackPointElement) {
            var point = new point_1.Point(new Date(trackPointElement.getElementsByTagName('Time')[0].textContent));
            pointsArray.push(point);
            for (var _i = 0, _a = trackPointElement.children; _i < _a.length; _i++) {
                var dataElement = _a[_i];
                switch (dataElement.tagName) {
                    case 'Position': {
                        point.addData(new data_latitude_degrees_1.DataLatitudeDegrees(Number(dataElement.getElementsByTagName('LatitudeDegrees')[0].textContent)));
                        point.addData(new data_longitude_degrees_1.DataLongitudeDegrees(Number(dataElement.getElementsByTagName('LongitudeDegrees')[0].textContent)));
                        break;
                    }
                    case 'AltitudeMeters': {
                        point.addData(new data_altitude_1.DataAltitude(Number(dataElement.textContent)));
                        break;
                    }
                    case 'Cadence': {
                        point.addData(new data_cadence_1.DataCadence(Number(dataElement.textContent)));
                        break;
                    }
                    case 'HeartRateBpm': {
                        point.addData(new data_heart_rate_1.DataHeartRate(Number(dataElement.getElementsByTagName('Value')[0].textContent)));
                        break;
                    }
                    case 'Extensions': {
                        for (var _b = 0, _c = dataElement.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children; _b < _c.length; _b++) {
                            var dataExtensionElement = _c[_b];
                            switch (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '')) {
                                case 'Speed': {
                                    point.addData(new data_speed_1.DataSpeed(Number(dataExtensionElement.textContent)));
                                    break;
                                }
                                case 'RunCadence': {
                                    point.addData(new data_cadence_1.DataCadence(Number(dataExtensionElement.textContent)));
                                    break;
                                }
                                case 'Watts': {
                                    point.addData(new data_power_1.DataPower(Number(dataExtensionElement.textContent)));
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
            return pointsArray;
        }, []);
    };
    EventImporterTCX.getCreator = function (creatorElement) {
        var creator;
        if (!creatorElement) {
            creator = new creator_1.Creator('Unknown device');
            return creator;
        }
        // Try to see if its a listed Suunto Device name
        creator = new creator_1.Creator(importer_suunto_device_names_1.ImporterSuuntoDeviceNames[creatorElement.getElementsByTagName('Name')[0].textContent]
            || creatorElement.getElementsByTagName('Name')[0].textContent);
        if (creatorElement.getElementsByTagName('Version')[0]) {
            creator.swInfo = creatorElement.getElementsByTagName('Version')[0].textContent;
        }
        return creator;
    };
    EventImporterTCX.getLaps = function (lapElements) {
        return Array.from(lapElements).reduce(function (lapArray, lapElement) {
            // Create the lap
            var lap = new lap_1.Lap(new Date(lapElement.getAttribute('StartTime')), new Date(+(new Date(lapElement.getAttribute('StartTime'))) +
                1000 * Number(lapElement.getElementsByTagName('TotalTimeSeconds')[0].textContent)), lap_types_1.LapTypes[lapElement.getElementsByTagName('TriggerMethod')[0].textContent]);
            // Create a stats (required TCX fields)
            lap.addStat(new data_energy_1.DataEnergy(Number(lapElement.getElementsByTagName('Calories')[0].textContent)));
            lap.addStat(new data_duration_1.DataDuration(Number(lapElement.getElementsByTagName('TotalTimeSeconds')[0].textContent)));
            lap.addStat(new data_distance_1.DataDistance(Number(lapElement.getElementsByTagName('DistanceMeters')[0].textContent)));
            lap.setPause(new data_pause_1.DataPause(0));
            // Optionals
            if (lapElement.getElementsByTagName('MaximumSpeed')[0]) {
                lap.addStat(new data_speed_max_1.DataSpeedMax(Number(lapElement.getElementsByTagName('MaximumSpeed')[0].textContent)));
            }
            if (lapElement.getElementsByTagName('AverageHeartRateBpm')[0]) {
                lap.addStat(new data_heart_rate_avg_1.DataHeartRateAvg(Number(lapElement.getElementsByTagName('AverageHeartRateBpm')[0].getElementsByTagName('Value')[0].textContent)));
            }
            if (lapElement.getElementsByTagName('MaximumHeartRateBpm')[0]) {
                lap.addStat(new data_heart_rate_max_1.DataHeartRateMax(Number(lapElement.getElementsByTagName('MaximumHeartRateBpm')[0].getElementsByTagName('Value')[0].textContent)));
            }
            if (lapElement.getElementsByTagName('Extensions')[0] && lapElement.getElementsByTagName('Extensions')[0].getElementsByTagName('AvgSpeed')[0]) {
                lap.addStat(new data_speed_avg_1.DataSpeedAvg(Number(lapElement.getElementsByTagName('Extensions')[0].getElementsByTagName('AvgSpeed')[0].textContent)));
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
