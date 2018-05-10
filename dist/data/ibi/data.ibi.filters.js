"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moving_median_1 = __importDefault(require("moving-median"));
var lowpassf_1 = __importDefault(require("lowpassf"));
/**
 * Collection of filters parsers and converters for IBI (R-R) data
 */
var IBIFilters = /** @class */ (function () {
    function IBIFilters() {
    }
    /**
     * A limit filter. It removes all values outside the limit
     * @param {IBIData} ibiData
     * @param {number} limit
     * @param {boolean} lowLimit
     */
    IBIFilters.limitFilter = function (ibiData, limit, lowLimit) {
        ibiData.getIBIDataMap().forEach(function (value, key, map) {
            if (value < limit && lowLimit) {
                map.delete(key);
            }
            else if (value > limit && !lowLimit) {
                map.delete(key);
            }
        });
    };
    /**
     * Running median filter
     * @param {IBIData} ibiData
     * @param {number} windowSize
     */
    IBIFilters.movingMedianFilter = function (ibiData, windowSize) {
        windowSize = windowSize || 5;
        var medianFilter = moving_median_1.default(windowSize);
        ibiData.getIBIDataMap().forEach(function (ibi, elapsedTime) {
            ibiData.setIBI(elapsedTime, Math.round(medianFilter(ibi)));
        });
    };
    /**
     * Low pass filter
     * @param {IBIData} ibiData
     * @param {number} windowSize
     * @param linearWeight
     */
    IBIFilters.lowPassFilter = function (ibiData, windowSize, linearWeight) {
        var lowPassFilter = new lowpassf_1.default();
        windowSize = windowSize || 5;
        linearWeight = linearWeight ? lowPassFilter.LinearWeightAverage : lowPassFilter.SimpleAverage;
        lowPassFilter.setLogic(linearWeight);
        lowPassFilter.setSamplingRange(windowSize);
        ibiData.getIBIDataMap().forEach(function (ibi, elapsedTime) {
            lowPassFilter.putValue(ibi);
            ibiData.setIBI(elapsedTime, Math.round(lowPassFilter.getFilteredValue()));
        });
    };
    return IBIFilters;
}());
exports.IBIFilters = IBIFilters;
