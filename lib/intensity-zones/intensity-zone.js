"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IntensityZoneJSONInterface = /** @class */ (function () {
    function IntensityZoneJSONInterface() {
    }
    return IntensityZoneJSONInterface;
}());
var IntensityZone = /** @class */ (function () {
    function IntensityZone() {
    }
    IntensityZone.prototype.toJSON = function () {
        return {
            zone1Duration: this.zone1Duration,
            zone2Duration: this.zone2Duration,
            zone2LowerLimit: this.zone2LowerLimit,
            zone3Duration: this.zone3Duration,
            zone3LowerLimit: this.zone3LowerLimit,
            zone4Duration: this.zone4Duration,
            zone4LowerLimit: this.zone4LowerLimit,
            zone5Duration: this.zone5Duration,
            zone5LowerLimit: this.zone5LowerLimit,
        };
    };
    return IntensityZone;
}());
exports.IntensityZone = IntensityZone;
