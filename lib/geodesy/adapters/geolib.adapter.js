"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var distance_geolib_vincenty_adapter_1 = require("./distance/distance.geolib.vincenty.adapter");
var GeoLibAdapter = /** @class */ (function () {
    function GeoLibAdapter() {
        this.distanceAdapter = new distance_geolib_vincenty_adapter_1.DistanceVincenty();
    }
    GeoLibAdapter.prototype.getDistance = function (points) {
        return this.distanceAdapter.getDistance(points);
    };
    return GeoLibAdapter;
}());
exports.GeoLibAdapter = GeoLibAdapter;
