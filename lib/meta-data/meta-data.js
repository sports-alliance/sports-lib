"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetaData = /** @class */ (function () {
    function MetaData(service, id, serviceUser, date) {
        this.id = id;
        this.serviceName = service;
        this.date = date;
        this.serviceUser = serviceUser;
    }
    MetaData.prototype.toJSON = function () {
        return {
            id: this.id,
            serviceName: this.serviceName,
            serviceUser: this.serviceUser,
            date: this.date.toJSON()
        };
    };
    return MetaData;
}());
exports.MetaData = MetaData;