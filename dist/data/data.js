"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_interface_1 = require("./data.interface");
var Data = /** @class */ (function () {
    function Data(value) {
        this.setValue(value);
    }
    Data.prototype.setValue = function (value) {
        if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
            throw new Error('Only number, string and boolean are allowed');
        }
        this.value = value;
    };
    Data.prototype.getValue = function () {
        return this.value;
    };
    Data.prototype.getDisplayValue = function () {
        var value = this.getValue();
        if (typeof value === 'boolean') {
            value = String(value);
        }
        return value;
    };
    Data.prototype.getType = function () {
        return this.constructor.type;
    };
    Data.prototype.getUnit = function () {
        return this.constructor.unit;
    };
    Data.prototype.getDisplayUnit = function () {
        return this.getUnit();
    };
    Data.prototype.getUnitSystem = function () {
        return this.constructor.unitSystem;
    };
    Data.prototype.getClassName = function () {
        return this.constructor.className;
    };
    Data.prototype.toJSON = function () {
        return {
            className: this.getClassName(),
            value: this.getValue(),
        };
    };
    Data.unitSystem = data_interface_1.UnitSystem.Metric;
    return Data;
}());
exports.Data = Data;
