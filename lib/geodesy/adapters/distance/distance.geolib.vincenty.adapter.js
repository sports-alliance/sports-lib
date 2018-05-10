"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geolib_1 = require("geolib");
var DistanceVincenty = /** @class */ (function () {
    function DistanceVincenty() {
    }
    DistanceVincenty.prototype.getDistance = function (points) {
        var distance = 0;
        var excludeFirstPointsArray = points.slice(1);
        var pointA = points[0];
        for (var _i = 0, excludeFirstPointsArray_1 = excludeFirstPointsArray; _i < excludeFirstPointsArray_1.length; _i++) {
            var pointB = excludeFirstPointsArray_1[_i];
            var positionA = pointA.getPosition();
            var positionB = pointB.getPosition();
            if (!positionA || !positionB) {
                continue;
            }
            var pointAPositionAsDecimal = {
                longitude: positionA.longitudeDegrees,
                latitude: positionA.latitudeDegrees,
            };
            var pointBPositionAsDecimal = {
                longitude: positionB.longitudeDegrees,
                latitude: positionB.latitudeDegrees,
            };
            distance += geolib_1.getDistance(pointAPositionAsDecimal, pointBPositionAsDecimal);
            pointA = pointB;
        }
        return distance;
    };
    return DistanceVincenty;
}());
exports.DistanceVincenty = DistanceVincenty;
