"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDClass = /** @class */ (function () {
    function IDClass() {
    }
    IDClass.prototype.getID = function () {
        return this.id || null;
    };
    IDClass.prototype.setID = function (id) {
        this.id = id;
        return this;
    };
    return IDClass;
}());
exports.IDClass = IDClass;
