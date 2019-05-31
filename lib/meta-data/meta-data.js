"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetaData = /** @class */ (function () {
    function MetaData(service, serviceWorkoutID, serviceUser, date) {
        this.serviceWorkoutID = serviceWorkoutID;
        this.serviceName = service;
        this.date = date;
        this.serviceUserName = serviceUser;
    }
    MetaData.prototype.toJSON = function () {
        return {
            serviceWorkoutID: this.serviceWorkoutID,
            serviceName: this.serviceName,
            serviceUserName: this.serviceUserName,
            date: this.date.getTime()
        };
    };
    return MetaData;
}());
exports.MetaData = MetaData;
