"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_altitude_1 = require("../../../data/data.altitude");
var data_cadence_1 = require("../../../data/data.cadence");
var data_heart_rate_1 = require("../../../data/data.heart-rate");
var data_speed_1 = require("../../../data/data.speed");
var lap_1 = require("../../../laps/lap");
var data_altitude_gps_1 = require("../../../data/data.altitude-gps");
var data_power_1 = require("../../../data/data.power");
var data_energy_1 = require("../../../data/data.energy");
var lap_types_1 = require("../../../laps/lap.types");
var EventExporterTCX = /** @class */ (function () {
    function EventExporterTCX() {
        this.xmlSerializer = new XMLSerializer();
        this.fileType = 'application/tcx';
        this.fileExtension = 'tcx';
    }
    EventExporterTCX.prototype.getAsString = function (event) {
        // Copy
        var eventCopy = Object.create(event);
        // Create a XML document
        var xmlDocument = document.implementation.createDocument(null, null, null);
        // Create the TrainingCenterDatabase Element
        var trainingCenterDatabaseElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'TrainingCenterDatabase');
        trainingCenterDatabaseElement.setAttribute('xsi:schemaLocation', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd');
        trainingCenterDatabaseElement.setAttribute('xmlns:ns5', 'http://www.garmin.com/xmlschemas/ActivityGoals/v1');
        trainingCenterDatabaseElement.setAttribute('xmlns:ns3', 'http://www.garmin.com/xmlschemas/ActivityExtension/v2');
        trainingCenterDatabaseElement.setAttribute('xmlns:ns2', 'http://www.garmin.com/xmlschemas/UserProfile/v2');
        trainingCenterDatabaseElement.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        // Append it to the xmlDocument
        xmlDocument.appendChild(trainingCenterDatabaseElement);
        // Create wrapper for activites
        var activitiesElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Activities');
        trainingCenterDatabaseElement.appendChild(activitiesElement);
        // Go over all the activites
        var activityIndex = 0;
        var _loop_1 = function (activity) {
            activityIndex++;
            // Create the activities element
            var activityElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Activity');
            activitiesElement.appendChild(activityElement);
            // Set the sport @todo should map them to Garmin accepted ones
            // For now it's forced to Running
            activityElement.setAttribute('Sport', 'Running');
            // Add an ID element
            var idElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Id');
            idElement.textContent = activity.startDate.toISOString().substring(0, 19) + 'Z';
            activityElement.appendChild(idElement);
            var activityLaps = activity.getLaps();
            // If there are no laps create one and clone it from the activity
            if (!activityLaps.length) {
                var lap_2 = new lap_1.Lap(activity.startDate, activity.endDate);
                Array.from(activity.getStats().values()).forEach(function (stat) {
                    lap_2.addStat(stat);
                });
                activityLaps.push(lap_2);
            }
            // Create the Creator as last
            var creatorElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Creator'); // @todo should output the correct creator
            creatorElement.setAttribute('xsi:type', 'Device_t');
            var nameElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Name');
            nameElement.textContent = activity.creator.name;
            creatorElement.appendChild(nameElement);
            // Add it to the activity
            activityElement.appendChild(creatorElement);
            for (var _i = 0, activityLaps_1 = activityLaps; _i < activityLaps_1.length; _i++) {
                var lap = activityLaps_1[_i];
                // Create a lap element
                var lapElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Lap');
                // Add the first point as start time
                lapElement.setAttribute('StartTime', lap.startDate.toISOString().substring(0, 19) + 'Z');
                var totalTimeInSecondsElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'TotalTimeSeconds');
                totalTimeInSecondsElement.textContent = lap.getDuration().getValue().toString();
                lapElement.appendChild(totalTimeInSecondsElement);
                var distanceInMetersElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'DistanceMeters');
                distanceInMetersElement.textContent = lap.getDistance().getValue().toString();
                lapElement.appendChild(distanceInMetersElement);
                var caloriesInKCALElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Calories');
                if (lap.getStat(data_energy_1.DataEnergy.className)) {
                    caloriesInKCALElement.textContent = lap.getStat(data_energy_1.DataEnergy.className).getValue().toString();
                }
                else {
                    caloriesInKCALElement.textContent = '0';
                }
                lapElement.appendChild(caloriesInKCALElement);
                var triggerMethod = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'TriggerMethod');
                // @todo fix if autolap
                triggerMethod.textContent = lap.type === lap_types_1.LapTypes.Distance ? 'Distance' : 'Manual';
                lapElement.appendChild(triggerMethod);
                activityElement.appendChild(lapElement);
                var trackElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Track');
                lapElement.appendChild(trackElement);
                // Go over the points and find the ones without position
                var pointWithoutPosition = void 0;
                var _loop_2 = function (point) {
                    if (!point.getPosition()) {
                        pointWithoutPosition = point;
                        return "continue";
                    }
                    // Go over date that did not have a position and append missing data
                    if (pointWithoutPosition) {
                        pointWithoutPosition.getData().forEach(function (data, key, map) {
                            if (!point.getData().get(key)) {
                                point.addData(data);
                            }
                        });
                        pointWithoutPosition = void 0;
                    }
                    var pointElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Trackpoint');
                    trackElement.appendChild(pointElement);
                    var timeElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Time');
                    timeElement.textContent = point.getDate().toISOString().substring(0, 19) + 'Z';
                    pointElement.appendChild(timeElement);
                    var positionElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Position');
                    var positionLatitudeDegreesElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'LatitudeDegrees');
                    positionLatitudeDegreesElement.textContent = point.getPosition().latitudeDegrees.toString();
                    var positionLongitudeDegreesElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'LongitudeDegrees');
                    positionLongitudeDegreesElement.textContent = point.getPosition().longitudeDegrees.toString();
                    positionElement.appendChild(positionLatitudeDegreesElement);
                    positionElement.appendChild(positionLongitudeDegreesElement);
                    pointElement.appendChild(positionElement);
                    // Go over the Data
                    var extensionsElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Extensions');
                    var tpxElement = document.createElementNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX');
                    extensionsElement.appendChild(tpxElement);
                    pointElement.appendChild(extensionsElement);
                    point.getData().forEach(function (data, key, map) {
                        if ((data instanceof data_altitude_1.DataAltitude) && !(data instanceof data_altitude_gps_1.DataGPSAltitude)) {
                            var altitudeElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'AltitudeMeters');
                            altitudeElement.textContent = data.getValue().toFixed(0).toString();
                            pointElement.appendChild(altitudeElement);
                        }
                        else if (data instanceof data_heart_rate_1.DataHeartRate) {
                            var heartRateElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'HeartRateBpm');
                            var heartRateValueElement = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Value');
                            heartRateValueElement.textContent = data.getValue().toFixed(0).toString();
                            heartRateElement.appendChild(heartRateValueElement);
                            pointElement.appendChild(heartRateElement);
                        }
                        else if (data instanceof data_speed_1.DataSpeed || data instanceof data_cadence_1.DataCadence || data instanceof data_power_1.DataPower) {
                            if (data instanceof data_speed_1.DataSpeed) {
                                var speedElement = document.createElementNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'Speed');
                                speedElement.textContent = data.getValue().toString();
                                tpxElement.appendChild(speedElement);
                            }
                            if (data instanceof data_power_1.DataPower) {
                                var poweElement = document.createElementNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'Watts');
                                poweElement.textContent = data.getValue().toString();
                                tpxElement.appendChild(poweElement);
                            }
                            if (data instanceof data_cadence_1.DataCadence) {
                                var cadenceElement = document.createElementNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'RunCadence');
                                var cadenceElementNoNS = document.createElementNS('http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'Cadence');
                                cadenceElement.textContent = (data.getValue() / 2).toFixed(0).toString();
                                cadenceElementNoNS.textContent = (data.getValue() / 2).toFixed(0).toString();
                                tpxElement.appendChild(cadenceElement);
                                // Apend a normal and an extension one
                                pointElement.appendChild(cadenceElementNoNS);
                            }
                        }
                    });
                };
                for (var _a = 0, _b = activity.getPointsInterpolated(lap.startDate, lap.endDate); _a < _b.length; _a++) {
                    var point = _b[_a];
                    _loop_2(point);
                }
            }
        };
        for (var _i = 0, _a = eventCopy.getActivities(); _i < _a.length; _i++) {
            var activity = _a[_i];
            _loop_1(activity);
        }
        return '<?xml version="1.0" encoding="UTF-8"?>' + this.xmlSerializer.serializeToString(xmlDocument);
    };
    EventExporterTCX.prototype.getfileExtension = function () {
        return this.fileExtension;
    };
    EventExporterTCX.prototype.getFileType = function () {
        return this.fileType;
    };
    return EventExporterTCX;
}());
exports.EventExporterTCX = EventExporterTCX;
