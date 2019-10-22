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
var data_number_1 = require("./data.number");
var DataRPE = /** @class */ (function (_super) {
    __extends(DataRPE, _super);
    function DataRPE() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataRPE.prototype.getDisplayValue = function () {
        return RPEBorgCR10SCale[Math.ceil(this.getValue())] ? RPEBorgCR10SCale[Math.ceil(this.getValue())] : "Other " + this.getValue();
    };
    DataRPE.type = 'Rated Perceived Exertion';
    return DataRPE;
}(data_number_1.DataNumber));
exports.DataRPE = DataRPE;
var RPEBorgCR10SCale;
(function (RPEBorgCR10SCale) {
    RPEBorgCR10SCale[RPEBorgCR10SCale["No exertion at all"] = 0] = "No exertion at all";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Very, very slight"] = 1] = "Very, very slight";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Very slight"] = 2] = "Very slight";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Slight"] = 3] = "Slight";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Moderate"] = 4] = "Moderate";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Somewhat severe"] = 5] = "Somewhat severe";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Severe"] = 6] = "Severe";
    RPEBorgCR10SCale[RPEBorgCR10SCale["More than severe"] = 7] = "More than severe";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Very severe"] = 8] = "Very severe";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Extreme"] = 9] = "Extreme";
    RPEBorgCR10SCale[RPEBorgCR10SCale["Maximal"] = 10] = "Maximal";
})(RPEBorgCR10SCale = exports.RPEBorgCR10SCale || (exports.RPEBorgCR10SCale = {}));
