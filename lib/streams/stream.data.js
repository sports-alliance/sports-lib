"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StreamData = /** @class */ (function () {
    function StreamData(date, data) {
        this.date = date;
        this.data = data;
    }
    StreamData.prototype.toJSON = function () {
        var _a;
        return _a = {},
            _a[this.date.getTime()] = this.data.getValue(),
            _a;
    };
    return StreamData;
}());
exports.StreamData = StreamData;
