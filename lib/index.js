"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var importer_gpx_1 = require("./events/adapters/importers/gpx/importer.gpx");
var importer_tcx_1 = require("./events/adapters/importers/tcx/importer.tcx");
var importer_fit_1 = require("./events/adapters/importers/fit/importer.fit");
var importer_suunto_json_1 = require("./events/adapters/importers/suunto/importer.suunto.json");
var importer_json_1 = require("./events/adapters/importers/json/importer.json");
var QuantifiedSelfLib = /** @class */ (function () {
    function QuantifiedSelfLib() {
    }
    /**
     * Parses and returns an event using GPX format
     * @param gpxString
     */
    QuantifiedSelfLib.importFromGPX = function (gpxString) {
        return importer_gpx_1.EventImporterGPX.getFromString(gpxString);
    };
    ;
    /**
     * Parses and returns an event using TCX format
     * @param xmlDocument
     */
    QuantifiedSelfLib.importFromTCX = function (xmlDocument) {
        return importer_tcx_1.EventImporterTCX.getFromXML(xmlDocument);
    };
    ;
    /**
     * Parses and returns an event using FIT format
     * @param arrayBuffer
     */
    QuantifiedSelfLib.importFromFit = function (arrayBuffer) {
        return importer_fit_1.EventImporterFIT.getFromArrayBuffer(arrayBuffer);
    };
    ;
    /**
     * Parses and returns an event using Suunto format
     * @param jsonString
     */
    QuantifiedSelfLib.importFromSuunto = function (jsonString) {
        return importer_suunto_json_1.EventImporterSuuntoJSON.getFromJSONString(jsonString);
    };
    /**
     * Parses and returns an event using native format (QuantifiedSelfLib exported format)
     * @param json EventJSONInterface
     */
    QuantifiedSelfLib.importFromJSON = function (json) {
        return importer_json_1.EventImporterJSON.getEventFromJSON(json);
    };
    return QuantifiedSelfLib;
}());
exports.QuantifiedSelfLib = QuantifiedSelfLib;
