"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GXParser = /** @class */ (function () {
    function GXParser(xml, domParser) {
        if (domParser === void 0) { domParser = null; }
        domParser = domParser || DOMParser;
        var parser = new domParser();
        var root = parser.parseFromString(xml, 'text/xml');
        return this.parseChild(root.documentElement);
    }
    GXParser.prototype.parseChild = function (elm) {
        var attrs = {};
        var attributes = elm.attributes;
        for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
            var attribute = attributes_1[_i];
            var attr = attribute;
            if (attr && attr.value) {
                attrs[attr.name] = attr.value;
            }
        }
        if (elm.childNodes) {
            var children = elm.childNodes;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var name_1 = child.localName;
                if (!name_1) {
                    continue;
                }
                if (!attrs[name_1]) {
                    attrs[name_1] = [];
                }
                attrs[name_1].push(this.parseChild(child));
            }
        }
        if (Object.keys(attrs).length === 0) {
            return elm.textContent;
        }
        return attrs;
    };
    return GXParser;
}());
exports.GXParser = GXParser;
