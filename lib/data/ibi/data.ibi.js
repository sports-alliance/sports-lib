"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_ibi_filters_1 = require("./data.ibi.filters");
var IBIData = /** @class */ (function () {
    function IBIData(ibiDataArray) {
        /**
         * Key is time time since start of the array
         * value is the ibi
         * @type {Map<number, number>}
         */
        this.ibiDataMap = new Map();
        if (ibiDataArray) {
            this.parseIBIArray(ibiDataArray);
        }
    }
    /**
     * Parses an IBI data array
     * eg: [600, 600, 100] becomes a map of {600:600, 1200: 600, 1300:100}
     * @param {Array<number>} ibiArray
     */
    IBIData.prototype.parseIBIArray = function (ibiArray) {
        var _this = this;
        ibiArray.reduce(function (totalTime, ibiData) {
            if (ibiData > 0) {
                totalTime += ibiData;
                _this.ibiDataMap.set(totalTime, ibiData);
            }
            return totalTime;
        }, 0);
    };
    /**
     * Sets the ibi for the specific time
     * @param time
     * @param ibi
     */
    IBIData.prototype.setIBI = function (time, ibi) {
        this.ibiDataMap.set(time, ibi);
    };
    /**
     * Gets the IBI data map
     * @return {Map<number, number>}
     */
    IBIData.prototype.getIBIDataMap = function () {
        return this.ibiDataMap;
    };
    /**
     * Gets the IBI data map but uses BPM units instead of IBI
     * @return {Map<number, number>}
     */
    IBIData.prototype.getAsBPM = function () {
        var hrDataMap = new Map();
        this.ibiDataMap.forEach(function (value, key, map) {
            hrDataMap.set(key, Math.round(60000 / value));
        });
        return hrDataMap;
    };
    /**
     * Low Limit filter. Removes all hr values above limit
     * @param {number} bpmLowLimit in BPM
     */
    IBIData.prototype.lowLimitBPMFilter = function (bpmLowLimit) {
        data_ibi_filters_1.IBIFilters.limitFilter(this, 60000 / (bpmLowLimit || 40), false); // Lower bpm higher IBI limit!
        return this;
    };
    /**
     * High limit filter. Removes all hr values above limit
     * @param bpmHighLimit
     */
    IBIData.prototype.highLimitBPMFilter = function (bpmHighLimit) {
        data_ibi_filters_1.IBIFilters.limitFilter(this, 60000 / (bpmHighLimit || 220), true); // Higher bpm lower IBI limit!
        return this;
    };
    /**
     *  Low pass filter
     * @param windowSize
     */
    IBIData.prototype.lowPassFilter = function (windowSize) {
        data_ibi_filters_1.IBIFilters.lowPassFilter(this, windowSize);
        return this;
    };
    /**
     * Moving median filter
     * @param {number} windowSize
     * @return {this}
     */
    IBIData.prototype.movingMedianFilter = function (windowSize) {
        data_ibi_filters_1.IBIFilters.movingMedianFilter(this, windowSize);
        return this;
    };
    IBIData.prototype.toJSON = function () {
        return Array.from(this.ibiDataMap.values());
    };
    return IBIData;
}());
exports.IBIData = IBIData;
