"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_interface_1 = require("./data.interface");
var Data = /** @class */ (function () {
    function Data(value) {
        if ((typeof value !== 'string') && (typeof value !== 'number') && (typeof value !== 'boolean') && !Array.isArray(value)) {
            throw new Error('Value is not boolean or number or string ');
        }
        this.value = value;
    }
    Data.prototype.setValue = function (value) {
        this.value = value;
        return this;
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
    Data.prototype.getDisplayType = function () {
        return this.constructor.displayType || this.constructor.type;
    };
    Data.prototype.getUnitSystem = function () {
        return this.constructor.unitSystem;
    };
    Data.prototype.toJSON = function () {
        var _a;
        return _a = {},
            _a[this.getType()] = this.getValue(),
            _a;
    };
    Data.unitSystem = data_interface_1.UnitSystem.Metric;
    return Data;
}());
exports.Data = Data;
