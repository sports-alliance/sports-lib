"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var distance_geolib_simple_adapter_1 = require("./distance/distance.geolib.simple.adapter");
var distance_geolib_vincenty_adapter_1 = require("./distance/distance.geolib.vincenty.adapter");
var GeoLibAdapter = /** @class */ (function () {
    function GeoLibAdapter(useSimpleDistance) {
        this.distanceAdapter = useSimpleDistance ? new distance_geolib_simple_adapter_1.DistanceSimple() : new distance_geolib_vincenty_adapter_1.DistanceVincenty();
    }
    GeoLibAdapter.prototype.getDistance = function (points, accuracyInMeters, precision) {
        return this.distanceAdapter.getDistance(points, accuracyInMeters, precision);
    };
    return GeoLibAdapter;
}());
exports.GeoLibAdapter = GeoLibAdapter;
