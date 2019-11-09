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
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }
        if (endDate < startDate) {
            throw new Error('Activity end date is before the start date and that is not acceptable');
        }
        if (+endDate - +startDate > 12 * 10 * 30 * 24 * 60 * 60 * 1000) {
            throw new Error('Activity duration is over 10 years and that is not supported');
        }
        _this.type = type;
        _this.creator = creator;
        return _this;
    }
    Activity.prototype.createStream = function (type) {
        return new stream_1.Stream(type, Array(event_utilities_1.EventUtilities.getDataLength(this.startDate, this.endDate)).fill(null));
    };
    Activity.prototype.addDataToStream = function (type, date, value) {
        this.getStreamData(type)[Math.ceil((+date - +this.startDate) / 1000)] = value; // @todo ceil vs floor
        return this;
    };
    Activity.prototype.addStream = function (stream) {
        if (this.streams.find(function (activityStream) { return activityStream.type === stream.type; })) {
            throw new Error("Duplicate type of stream when adding " + stream.type + " to activity " + this.getID());
        }
        this.streams.push(stream);
        return this;
    };
    Activity.prototype.clearStreams = function () {
        this.streams = [];
        return this;
    };
    Activity.prototype.removeStream = function (stream) {
        this.streams = this.streams.filter(function (activityStream) { return stream !== activityStream; });
        return this;
    };
    Activity.prototype.addStreams = function (streams) {
        var _a;
        (_a = this.streams).push.apply(_a, streams);
        return this;
    };
    Activity.prototype.getAllStreams = function () {
        return this.streams;
    };
    Activity.prototype.getAllExportableStreams = function () {
        return this.getAllStreams().filter(function (stream) { return !stream.isUnitDerivedDataType(); });
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
        var find = this.streams
            .find(function (stream) { return stream.type === streamType; });
        if (!find) {
            throw Error("No stream found with type " + streamType);
        }
        return find;
    };
    Activity.prototype.getStreamData = function (streamType, startDate, endDate) {
        var _this = this;
        var stream = (streamType instanceof stream_1.Stream) ? streamType : this.getStream(streamType);
        if (!startDate && !endDate) {
            return stream.data;
        }
        if (startDate && endDate) {
            return stream.data
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) <= endDate; })
                .filter(function (value, index) { return (new Date(_this.startDate.getTime() + index * 1000)) >= startDate; });
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
    /**
     * Gets the data array of an activity stream excluding the non numeric ones
     * @todo include strings and all data abstract types
     * @param streamType
     * @param startDate
     * @param endDate
     */
    Activity.prototype.getSquashedStreamData = function (streamType, startDate, endDate) {
        return this.getStreamData(streamType, startDate, endDate).filter(function (data) { return helpers_1.isNumber(data); });
    };
    /**
     * Combines the lat - long streams to a DataPositionInterface
     * @param startDate
     * @param endDate
     * @param latitudeStream
     * @param longitudeStream
     */
    Activity.prototype.getPositionData = function (startDate, endDate, latitudeStream, longitudeStream) {
        var latitudeStreamData = latitudeStream ? this.getStreamData(latitudeStream, startDate, endDate) : this.getStreamData(data_latitude_degrees_1.DataLatitudeDegrees.type, startDate, endDate);
        var longitudeStreamData = longitudeStream ? this.getStreamData(longitudeStream, startDate, endDate) : this.getStreamData(data_longitude_degrees_1.DataLongitudeDegrees.type, startDate, endDate);
        return latitudeStreamData.reduce(function (positionArray, value, index, array) {
            var currentLatitude = latitudeStreamData[index];
            var currentLongitude = longitudeStreamData[index];
            if (!helpers_1.isNumber(currentLatitude) || !helpers_1.isNumber(currentLongitude)) {
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
    /**
     * Combines the lat - long streams to a DataPositionInterface and excludes nulls
     * @param startDate
     * @param endDate
     * @param latitudeStream
     * @param longitudeStream
     */
    Activity.prototype.getSquashedPositionData = function (startDate, endDate, latitudeStream, longitudeStream) {
        return this.getPositionData(startDate, endDate, latitudeStream, longitudeStream).filter(function (data) { return data !== null; });
    };
    Activity.prototype.getStreamDataTypesBasedOnDataType = function (streamTypeToBaseOn, streamTypes) {
        return event_utilities_1.EventUtilities.getStreamDataTypesBasedOnDataType(this.getStream(streamTypeToBaseOn), this.getAllStreams()
            .filter(function (stream) { return stream.type !== streamTypeToBaseOn; })
            .filter(function (stream) { return streamTypes.indexOf(stream.type) !== -1; }));
    };
    Activity.prototype.getStreamDataTypesBasedOnTime = function (streamTypes) {
        return event_utilities_1.EventUtilities.getStreamDataTypesBasedOnTime(this.startDate, this.endDate, this.getAllStreams().filter(function (stream) { return streamTypes.indexOf(stream.type) !== -1; }));
    };
    Activity.prototype.getStreamDataByTime = function (streamType, filterNull) {
        if (filterNull === void 0) { filterNull = false; }
        return this.getStream(streamType).getStreamDataByTime(this.startDate, filterNull);
    };
    Activity.prototype.addLap = function (lap) {
        this.laps.push(lap);
        return this;
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
