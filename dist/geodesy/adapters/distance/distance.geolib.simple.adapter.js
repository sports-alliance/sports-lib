"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geolib_1 = require("geolib");
var DistanceSimple = /** @class */ (function () {
    function DistanceSimple() {
    }
    DistanceSimple.prototype.getDistance = function (points, accuracyInMeters) {
        var distance = 0;
        var excludeFirstPointsArray = points.slice(1);
        var pointA = points[0];
        for (var _i = 0, excludeFirstPointsArray_1 = excludeFirstPointsArray; _i < excludeFirstPointsArray_1.length; _i++) {
            var pointB = excludeFirstPointsArray_1[_i];
            var pointAPositionAsDecimal = {
                longitude: pointA.getPosition().longitudeDegrees,
                latitude: pointA.getPosition().latitudeDegrees,
            };
            var pointBPositionAsDecimal = {
                longitude: pointB.getPosition().longitudeDegrees,
                latitude: pointB.getPosition().latitudeDegrees,
            };
            var calculatedDistance = geolib_1.getDistanceSimple(pointAPositionAsDecimal, pointBPositionAsDecimal, accuracyInMeters);
            if (calculatedDistance) {
                distance += calculatedDistance;
            }
            pointA = pointB;
        }
        return distance;
    };
    return DistanceSimple;
}());
exports.DistanceSimple = DistanceSimple;
