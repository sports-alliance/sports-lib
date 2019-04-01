"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var activity_1 = require("../../../../activities/activity");
var creator_1 = require("../../../../creators/creator");
var event_1 = require("../../../event");
var activity_types_1 = require("../../../../activities/activity.types");
var importer_gpx_mapper_1 = require("./importer.gpx.mapper");
var helpers_1 = require("../../../utilities/helpers");
var event_utilities_1 = require("../../../utilities/event.utilities");
var GXParser = require('gxparser').GXParser;
var EventImporterGPX = /** @class */ (function () {
    function EventImporterGPX() {
    }
    EventImporterGPX.getFromString = function (gpx, domParser, name) {
        if (name === void 0) { name = 'New Event'; }
        return new Promise(function (resolve, reject) {
            var parsedGPX = GXParser(gpx);
            var track = parsedGPX.trk || parsedGPX.rte;
            var activities = track.reduce(function (activities, trackOrRoute) {
                // Get the samples
                var samples = [];
                var isActivity = false;
                if (trackOrRoute.trkseg) {
                    samples = trackOrRoute.trkseg.reduce(function (trkptArray, trkseg) {
                        return trkptArray.concat(trkseg.trkpt);
                    }, []);
                    // Determine if it's a route. The samples will most probably be missing the time
                    isActivity = !!samples[0].time;
                }
                else if (trackOrRoute.rtept) {
                    samples = trackOrRoute.rtept;
                }
                // Sort the points if its only an activity
                if (isActivity) {
                    samples.sort(function (sampleA, sampleB) {
                        return +(new Date(sampleA.time[0])) - +(new Date(sampleB.time[0]));
                    });
                }
                // debugger;
                // Create an activity. Set the dates depending on route etc
                var startDate = new Date(isActivity ? samples[0].time[0] : new Date());
                var endDate = isActivity ?
                    new Date(trackOrRoute.trkseg[trackOrRoute.trkseg.length - 1].trkpt[trackOrRoute.trkseg[trackOrRoute.trkseg.length - 1].trkpt.length - 1].time[0]) :
                    new Date(startDate.getTime() + samples.length * 1000);
                var activityType = isActivity ? activity_types_1.ActivityTypes.unknown : activity_types_1.ActivityTypes.route;
                if (trackOrRoute.type && activity_types_1.ActivityTypes[trackOrRoute.type]) {
                    activityType = activity_types_1.ActivityTypes[trackOrRoute.type];
                }
                var activity = new activity_1.Activity(startDate, endDate, activityType, new creator_1.Creator(parsedGPX.creator, parsedGPX.version));
                // Match
                importer_gpx_mapper_1.GPXSampleMapper.forEach(function (sampleMapping) {
                    var subjectSamples = samples.filter(function (sample) { return helpers_1.isNumberOrString(sampleMapping.getSampleValue(sample)); });
                    if (subjectSamples.length) {
                        activity.addStream(activity.createStream(sampleMapping.dataType));
                        subjectSamples.forEach(function (subjectSample, index) {
                            activity.addDataToStream(sampleMapping.dataType, isActivity ? new Date(subjectSample.time[0]) : new Date(activity.startDate.getTime() + index * 1000), sampleMapping.getSampleValue(subjectSample));
                        });
                    }
                });
                // debugger;
                activities.push(activity);
                return activities;
            }, []);
            var event = new event_1.Event(name, activities[0].startDate, activities[activities.length - 1].endDate);
            activities.forEach(function (activity) {
                event.addActivity(activity);
            });
            // debugger;
            // generate global stats
            event_utilities_1.EventUtilities.generateStatsForAll(event);
            resolve(event);
        });
    };
    return EventImporterGPX;
}());
exports.EventImporterGPX = EventImporterGPX;
