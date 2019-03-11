"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("./stream");
var IBIStream = /** @class */ (function (_super) {
    __extends(IBIStream, _super);
    function IBIStream(data) {
        var _this = _super.call(this, 'IBI') || this;
        if (data) {
            _this.data = data;
        }
        return _this;
    }
    IBIStream.prototype.getStreamDataByTime = function (startDate) {
        var time = 0;
        return this.data.reduce(function (accu, dataItem, index) {
            time += dataItem;
            accu.push({
                time: startDate.getTime() + time,
                value: dataItem,
            });
            return accu;
        }, []);
    };
    //
    IBIStream.prototype.getStreamDataByDuration = function (offset, filter) {
        if (filter === void 0) { filter = true; }
        // let data = (new IBIData(<number[]>this.data))
        //   .lowLimitBPMFilter()
        //   .lowPassFilter()
        //   .highLimitBPMFilter().getAsArray();
        var data = this.data;
        var time = offset || 0;
        return data.reduce(function (accu, dataItem, index) {
            time += dataItem;
            accu.push({
                time: time,
                value: dataItem,
            });
            return accu;
        }, []);
    };
    return IBIStream;
}(stream_1.Stream));
exports.IBIStream = IBIStream;
