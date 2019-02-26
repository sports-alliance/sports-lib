"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geolib_1 = require("geolib");
var GeoLibAdapter = /** @class */ (function () {
    function GeoLibAdapter() {
    }
    GeoLibAdapter.prototype.getDistance = function (positionArray) {
        var distance = 0;
        var excludeFirstPointsArray = positionArray.slice(1);
        var firstPosition = positionArray[0];
        for (var _i = 0, excludeFirstPointsArray_1 = excludeFirstPointsArray; _i < excludeFirstPointsArray_1.length; _i++) {
            var nextPosition = excludeFirstPointsArray_1[_i];
            var firstPositionAsDecimal = {
                longitude: firstPosition.longitudeDegrees,
                latitude: firstPosition.latitudeDegrees,
            };
            var nextPositionAsDecimal = {
                longitude: nextPosition.longitudeDegrees,
                latitude: nextPosition.latitudeDegrees,
            };
            distance += geolib_1.getDistance(firstPositionAsDecimal, nextPositionAsDecimal);
            firstPosition = nextPosition;
        }
        return distance;
    };
    return GeoLibAdapter;
}());
exports.GeoLibAdapter = GeoLibAdapter;
