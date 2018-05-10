"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GeoLocationInfo = /** @class */ (function () {
    function GeoLocationInfo(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    GeoLocationInfo.prototype.toJSON = function () {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            city: this.city,
            country: this.country,
            province: this.province,
        };
    };
    return GeoLocationInfo;
}());
exports.GeoLocationInfo = GeoLocationInfo;
