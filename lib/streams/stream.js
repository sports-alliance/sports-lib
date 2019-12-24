"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../events/utilities/helpers");
var data_store_1 = require("../data/data.store");
var Stream = /** @class */ (function () {
    function Stream(type, data) {
        this.data = [];
        this.type = type;
        if (data) {
            this.data = data;
        }
    }
    Stream.prototype.getNumericData = function () {
        return this.data.filter(function (data) { return helpers_1.isNumber(data); });
    };
    /**
     * Gets the data based / offset on a startDate
     * @param startDate
     * @param filterNull
     * @param filterInfinity
     */
    Stream.prototype.getStreamDataByTime = function (startDate, filterNull, filterInfinity) {
        if (filterNull === void 0) { filterNull = false; }
        if (filterInfinity === void 0) { filterInfinity = false; }
        return this.data.reduce(function (accu, dataItem, index) {
            if ((filterNull && dataItem === null) || (filterInfinity && dataItem === Infinity)) {
                return accu;
            }
            accu.push({
                time: startDate.getTime() + index * 1000,
                value: dataItem,
            });
            return accu;
        }, []);
    };
    /**
     * Gets the data offset on a time
     * @param offset
     * @param filterNull
     * @param filterInfinity
     */
    Stream.prototype.getStreamDataByDuration = function (offset, filterNull, filterInfinity) {
        if (offset === void 0) { offset = 0; }
        if (filterNull === void 0) { filterNull = false; }
        if (filterInfinity === void 0) { filterInfinity = false; }
        return this.data.reduce(function (accu, dataItem, index) {
            if ((filterNull && dataItem === null) || (filterInfinity && dataItem === Infinity)) {
                return accu;
            }
            accu.push({
                time: index * 1000 + (offset || 0),
                value: dataItem,
            });
            return accu;
        }, []);
    };
    Stream.prototype.isUnitDerivedDataType = function () {
        return data_store_1.DynamicDataLoader.isUnitDerivedDataType(this.type);
    };
    Stream.prototype.toJSON = function () {
        return {
            type: this.type,
            data: this.data,
        };
    };
    return Stream;
}());
exports.Stream = Stream;
