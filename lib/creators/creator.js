"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Creator = /** @class */ (function () {
    function Creator(name) {
        debugger;
        this.name = name;
    }
    Creator.prototype.toJSON = function () {
        return {
            name: this.name,
            serialNumber: this.serialNumber,
            swInfo: this.swInfo,
            hwInfo: this.hwInfo,
        };
    };
    return Creator;
}());
exports.Creator = Creator;
