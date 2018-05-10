"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventExporterGPX = /** @class */ (function () {
    function EventExporterGPX() {
        this.fileType = 'application/gpx';
        this.fileExtension = 'gpx';
    }
    EventExporterGPX.prototype.getAsString = function (event) {
        return undefined;
    };
    EventExporterGPX.prototype.getfileExtension = function () {
        return this.fileExtension;
    };
    EventExporterGPX.prototype.getFileType = function () {
        return this.fileType;
    };
    return EventExporterGPX;
}());
exports.EventExporterGPX = EventExporterGPX;
