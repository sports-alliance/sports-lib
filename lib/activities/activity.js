"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var duration_class_abstract_1 = require("../duration/duration.class.abstract");
var data_latitude_degrees_1 = require("../data/data.latitude-degrees");
var data_longitude_degrees_1 = require("../data/data.longitude-degrees");
var stream_1 = require("../streams/stream");
var helpers_1 = require("../events/utilities/helpers");
var event_utilities_1 = require("../events/utilities/event.utilities");
var Activity = /** @class */ (function (_super) {
    __extends(Activity, _super);
    function Activity(startDate, endDate, type, creator) {
        var _this = _super.call(this, startDate, endDate) || this;
        _this.intensityZones = []; // maybe rename
        _this.laps = [];
        _this.streams = [];
        _this.type = type;
        _this.creator = creator;
        return _this;
    }
    Activity.prototype.createStream = function (type) {
        return new stream_1.Stream(type, Array(event_utilities_1.EventUtilities.getDataLength(this.startDate, this.endDate)).fill(null));
    };
    Activity.prototype.addDataToStream = function (type, date, value) {
        this.getStreamData(type)[Math.ceil((+date - +this.startDate) / 1000)] = value;
    };
    Activity.prototype.addStream = function (stream) {
        this.streams.push(stream);
    };
    Activity.prototype.clearStreams = function () {
        this.streams = [];
    };
    Activity.prototype.removeStream = function (stream) {
        this.streams = this.streams.filter(function (activityStream) { return stream !== activityStream; });
    };
    Activity.prototype.addStreams = function (streams) {
        var _a;
        (_a = this.streams).push.apply(_a, streams);
    };
    Activity.prototype.getAllStreams = function () {
        return this.streams;
    };
    Activity.prototype.hasStreamData = function (streamType, startDate, endDate) {
        try {
            this.getStreamData(streamType, startDate, endDate);
        }
        catch (e) {
            return false;
        }
        return true;
    };
    Activity.prototype.hasPositionData = function (startDate, endDate) {
        return this.hasStreamData(data_latitude_degrees_1.DataLatitudeDegrees.type, startDate, endDate) && this.hasStreamData(data_longitude_degrees_1.DataLongitudeDegrees.type, startDate, endDate);
    };
    Activity.prototype.getStream = function (streamType) {
        var stream = this.streams
            .find(function (stream) { return stream.type === streamType; });
        if (!stream) {
            throw Error("No stream found with type " + streamType);
        }
        return stream;
    };
    Activity.prototype.getStreamData = function (streamType, startDate, endDate) {
        var _this = this;
        var stream = this.getStream(streamType);
        if (!startDate && !endDate) {
            return stream.data;
        }
        if (startDate && endDate) {
            return stream.data
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) >= startDate; })
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) <= endDate; });
        }
        if (startDate) {
            return stream.data
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) > startDate; });
        }
        if (endDate) {
            return stream.data
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) < endDate; });
        }
        return [];
    };
    // @todo see how this fits with the filtering on the stream class
    Activity.prototype.getSquashedStreamData = function (streamType, startDate, endDate) {
        return this.getStreamData(streamType, startDate, endDate).filter(function (data) { return helpers_1.isNumber(data); });
    };
    Activity.prototype.getPositionData = function (startDate, endDate) {
        var latitudeStreamData = this.getStreamData(data_latitude_degrees_1.DataLatitudeDegrees.type, startDate, endDate);
        var longitudeStreamData = this.getStreamData(data_longitude_degrees_1.DataLongitudeDegrees.type, startDate, endDate);
        return latitudeStreamData.reduce(function (positionArray, value, index, array) {
            // debugger;
            var currentLatitude = latitudeStreamData[index];
            var currentLongitude = longitudeStreamData[index];
            if (!currentLatitude || !currentLongitude) {
                positionArray.push(null);
                return positionArray;
            }
            positionArray.push({
                latitudeDegrees: currentLatitude,
                longitudeDegrees: currentLongitude,
            });
            return positionArray;
        }, []);
    };
    Activity.prototype.getStreamDataTypesBasedOnDataType = function (streamTypeToBaseOn, streamTypes) {
        return event_utilities_1.EventUtilities.getStreamDataTypesBasedOnDataType(this.getStream(streamTypeToBaseOn), this.getAllStreams()
            .filter(function (stream) { return stream.type !== streamTypeToBaseOn; })
            .filter(function (stream) { return streamTypes.indexOf(stream.type) !== -1; }));
    };
    Activity.prototype.getStreamDataTypesBasedOnTime = function (streamTypes) {
        return event_utilities_1.EventUtilities.getStreamDataTypesBasedOnTime(this.startDate, this.endDate, this.getAllStreams().filter(function (stream) { return streamTypes.indexOf(stream.type) !== -1; }));
    };
    Activity.prototype.getStreamDataByTime = function (streamType) {
        return this.getStream(streamType).getStreamDataByTime(this.startDate);
    };
    Activity.prototype.addLap = function (lap) {
        this.laps.push(lap);
    };
    Activity.prototype.getLaps = function (activity) {
        return this.laps;
    };
    Activity.prototype.toJSON = function () {
        var intensityZones = [];
        this.intensityZones.forEach(function (value) {
            intensityZones.push(value.toJSON());
        });
        var stats = {};
        this.stats.forEach(function (value, key) {
            Object.assign(stats, value.toJSON());
        });
        return {
            startDate: this.startDate.getTime(),
            endDate: this.endDate.getTime(),
            type: this.type,
            creator: this.creator.toJSON(),
            intensityZones: intensityZones,
            stats: stats,
            laps: this.getLaps().reduce(function (jsonLapsArray, lap) {
                jsonLapsArray.push(lap.toJSON());
                return jsonLapsArray;
            }, []),
        };
    };
    return Activity;
}(duration_class_abstract_1.DurationClassAbstract));
exports.Activity = Activity;
