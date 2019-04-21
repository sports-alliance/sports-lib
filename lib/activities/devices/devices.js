"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Devices = /** @class */ (function () {
    function Devices(name, swInfo, hwInfo, serialNumber) {
        this.name = name;
        if (swInfo) {
            this.swInfo = swInfo;
        }
        if (hwInfo) {
            this.hwInfo = hwInfo;
        }
        if (serialNumber) {
            this.serialNumber = serialNumber;
        }
    }
    Devices.prototype.toJSON = function () {
        return {
            name: this.name,
            serialNumber: this.serialNumber ? this.serialNumber : null,
            swInfo: this.swInfo ? this.swInfo : null,
            hwInfo: this.hwInfo ? this.hwInfo : null,
        };
    };
    return Devices;
}());
exports.Devices = Devices;
