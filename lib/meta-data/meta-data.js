"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetaData = /** @class */ (function () {
    function MetaData(service, id, date) {
        this.id = id;
        this.serviceNames = service;
        this.date = date;
    }
    MetaData.prototype.toJSON = function () {
        return {
            id: this.id,
            service: this.serviceNames,
            date: this.date.toJSON()
        };
    };
    return MetaData;
}());
exports.MetaData = MetaData;
