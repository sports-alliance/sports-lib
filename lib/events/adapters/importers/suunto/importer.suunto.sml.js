"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var importer_suunto_json_1 = require("./importer.suunto.json");
var helpers_1 = require("../../../utilities/helpers");
var parser = require('fast-xml-parser');
var EventImporterSuuntoSML = /** @class */ (function () {
    function EventImporterSuuntoSML() {
    }
    EventImporterSuuntoSML.getFromXML = function (contents, name) {
        if (name === void 0) { name = 'New Event'; }
        var json = parser.parse(contents).sml;
        debugger;
        //  A few mods here to convert it to compatible json suunto string
        json.DeviceLog.Samples = json.DeviceLog.Samples.Sample;
        var samplesWithUTC = json.DeviceLog.Samples.filter(function (sample) { return !!sample.UTC; });
        // Find the first UTC timestamped sample and use it later for start date
        var startDate = samplesWithUTC.length ? new Date(samplesWithUTC[0].UTC) : new Date(json.DeviceLog.Header.DateTime);
        // Determine the end date
        var endDate = samplesWithUTC.length > 1 ? samplesWithUTC[samplesWithUTC.length - 1].UTC : (new Date((startDate.getTime() + json.DeviceLog.Header.Duration * 1000)));
        // Filter out the old activity type
        json.DeviceLog.Samples = json.DeviceLog.Samples.filter(function (sample) {
            return !(sample.Events && sample.Events.Activity);
        });
        // Convert the events
        json.DeviceLog.Samples.filter(function (sample) { return !!sample.Events; }).forEach(function (sample) {
            sample.Events = [sample.Events];
        });
        // Inject start and end sample with event
        json.DeviceLog.Samples.unshift({
            Events: [
                {
                    Activity: { ActivityType: json.DeviceLog.Header.ActivityType }
                }
            ],
            TimeISO8601: startDate.toISOString()
        });
        // Add the end time and adjust the start time
        json.DeviceLog.Header.TimeISO8601 = json.DeviceLog.Header.TimeISO8601 || endDate;
        // Add the time on the samples
        json.DeviceLog.Samples.forEach(function (sample) {
            if (sample.TimeISO8601) {
                return;
            }
            if (sample.UTC) {
                sample.TimeISO8601 = (new Date(sample.UTC)).toISOString();
                return;
            }
            if (helpers_1.isNumber(sample.Time)) {
                sample.TimeISO8601 = (new Date(startDate.getTime() + (sample.Time * 1000))).toISOString();
                return;
            }
        });
        // Convert the RR
        if (json.DeviceLog['R-R']) {
            json.DeviceLog['R-R'].Data = json.DeviceLog['R-R'].Data.split(' ').map(function (dataString) { return Number(dataString); });
        }
        json.DeviceLog.Header.Altitude = json.DeviceLog.Header.Altitude ? [json.DeviceLog.Header.Altitude] : null;
        json.DeviceLog.Header.HR = json.DeviceLog.Header.HR ? [json.DeviceLog.Header.HR] : null;
        json.DeviceLog.Header.Cadence = json.DeviceLog.Header.Cadence ? [json.DeviceLog.Header.Cadence] : null;
        json.DeviceLog.Header.Speed = json.DeviceLog.Header.Speed ? [json.DeviceLog.Header.Speed] : null;
        json.DeviceLog.Header.Power = json.DeviceLog.Header.Power ? [json.DeviceLog.Header.Power] : null;
        json.DeviceLog.Header.Temperature = json.DeviceLog.Header.Temperature ? [json.DeviceLog.Header.Temperature] : null;
        json.DeviceLog.Windows = [{ Window: Object.assign({ Type: 'Activity' }, json.DeviceLog.Header) }];
        // debugger;
        return importer_suunto_json_1.EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(json));
    };
    EventImporterSuuntoSML.getFromJSONString = function (jsonString) {
        var _a;
        var json = JSON.parse(jsonString);
        var samples;
        // Try to be a hero here
        try {
            samples = json.Samples.filter(function (sample) { return !!JSON.parse(sample.Attributes)['suunto/sml'].Sample; }).map(function (sample) {
                return Object.assign({ TimeISO8601: sample.TimeISO8601 }, JSON.parse(sample.Attributes)['suunto/sml'].Sample);
            });
        }
        catch (e) {
            samples = json.Samples.filter(function (sample) { return !!sample.Attributes['suunto/sml'].Sample; }).map(function (sample) {
                return Object.assign({ TimeISO8601: sample.TimeISO8601 }, sample.Attributes['suunto/sml'].Sample);
            });
        }
        var rr;
        try {
            rr = {
                Data: json.Samples.filter(function (sample) { return !!JSON.parse(sample.Attributes)['suunto/sml']['R-R']; }).map(function (sample) {
                    return JSON.parse(sample.Attributes)['suunto/sml']['R-R'];
                }).reduce(function (accu, rrSample) {
                    return accu.concat(rrSample.Data.split(',').map(function (dataString) { return Number(dataString); }));
                }, [])
            };
        }
        catch (e) {
            rr = {
                Data: json.Samples.filter(function (sample) { return !!sample.Attributes['suunto/sml']['R-R']; }).map(function (sample) {
                    return sample.Attributes['suunto/sml']['R-R'];
                }).reduce(function (accu, rrSample) {
                    return accu.concat(rrSample.IBI);
                }, [])
            };
        }
        debugger;
        var suuntoJSON = {
            DeviceLog: (_a = {
                    Header: {},
                    Device: {
                        Name: 'Suunto unknown',
                        Info: {
                            HW: 0,
                            SW: 0,
                            SerialNumber: 0
                        }
                    },
                    Windows: [],
                    Samples: samples
                },
                _a['R-R'] = rr,
                _a)
        };
        // debugger;
        return importer_suunto_json_1.EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    };
    return EventImporterSuuntoSML;
}());
exports.EventImporterSuuntoSML = EventImporterSuuntoSML;
