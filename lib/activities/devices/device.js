"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../events/utilities/helpers");
var Device = /** @class */ (function () {
    function Device(type) {
        this.type = type || 'Unknown';
    }
    Device.prototype.toJSON = function () {
        debugger;
        return {
            type: this.type,
            index: helpers_1.isNumber(this.index) ? this.index || null : null,
            batteryStatus: this.batteryStatus || null,
            batteryVoltage: this.batteryVoltage || null,
            manufacturer: this.manufacturer || null,
            serialNumber: this.serialNumber || null,
            product: this.product || null,
            swInfo: this.swInfo || null,
            hwInfo: this.hwInfo || null,
            antDeviceNumber: this.antDeviceNumber || null,
            antTransmissionType: this.antTransmissionType || null,
            antNetwork: this.antNetwork || null,
            sourceType: this.sourceType || null,
            cumOperatingTime: this.cumOperatingTime || null,
        };
    };
    return Device;
}());
exports.Device = Device;
