"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventExporterJSON = /** @class */ (function () {
    function EventExporterJSON() {
    }
    EventExporterJSON.getAsString = function (event) {
        return new Promise(function (resolve, reject) {
            var jsonEvent = event.toJSON();
            jsonEvent.activities = event.getActivities().reduce(function (activities, activity) {
                var jsonActivity = activity.toJSON();
                jsonActivity.streams = activity.getAllStreams().reduce(function (streams, stream) {
                    streams.push(stream.toJSON());
                    return streams;
                }, []);
                activities.push(jsonActivity);
                return activities;
            }, []);
            resolve(JSON.stringify(jsonEvent));
        });
    };
    EventExporterJSON.fileType = 'application/json';
    EventExporterJSON.fileExtension = 'json';
    return EventExporterJSON;
}());
exports.EventExporterJSON = EventExporterJSON;
