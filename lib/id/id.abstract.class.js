"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var IDClass = /** @class */ (function () {
    function IDClass() {
        this.id = uuid_1.v4();
    }
    IDClass.prototype.getID = function () {
        return this.id;
    };
    IDClass.prototype.setID = function (id) {
        this.id = id;
    };
    return IDClass;
}());
exports.IDClass = IDClass;
