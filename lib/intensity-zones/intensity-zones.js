"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../events/utilities/helpers");
var IntensityZones = /** @class */ (function () {
    function IntensityZones(type) {
        this.type = type;
    }
    IntensityZones.prototype.toJSON = function () {
        var json = {
            type: this.type,
            zone1Duration: this.zone1Duration,
            zone2Duration: this.zone2Duration,
            zone3Duration: this.zone3Duration,
            zone4Duration: this.zone4Duration,
            zone5Duration: this.zone5Duration,
        };
        if (helpers_1.isNumber(this.zone2LowerLimit)) {
            json.zone2LowerLimit = this.zone2LowerLimit;
        }
        if (helpers_1.isNumber(this.zone3LowerLimit)) {
            json.zone3LowerLimit = this.zone3LowerLimit;
        }
        if (helpers_1.isNumber(this.zone4LowerLimit)) {
            json.zone4LowerLimit = this.zone4LowerLimit;
        }
        if (helpers_1.isNumber(this.zone5LowerLimit)) {
            json.zone5LowerLimit = this.zone5LowerLimit;
        }
        return json;
    };
    return IntensityZones;
}());
exports.IntensityZones = IntensityZones;
