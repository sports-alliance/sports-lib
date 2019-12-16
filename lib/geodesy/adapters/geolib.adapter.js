"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var getDistance_1 = __importDefault(require("geolib/es/getDistance"));
var findNearest_1 = __importDefault(require("geolib/es/findNearest"));
var GeoLibAdapter = /** @class */ (function () {
    function GeoLibAdapter() {
        this.findNearest = findNearest_1.default;
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
            distance += getDistance_1.default(firstPositionAsDecimal, nextPositionAsDecimal);
            firstPosition = nextPosition;
        }
        return distance;
    };
    return GeoLibAdapter;
}());
exports.GeoLibAdapter = GeoLibAdapter;
