"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.innerWidth = innerWidth;
exports.innerHeight = innerHeight;
exports.innerSize = innerSize;
exports.innerRangeX = innerRangeX;
exports.innerRangeY = innerRangeY;
exports.prefixKeys = prefixKeys;
exports.maxMargins = maxMargins;
exports.sumMargins = sumMargins;
exports.zeroMargin = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const zeroMargin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};
exports.zeroMargin = zeroMargin;

function getFuzzy(obj = {}, fuzzyKey) {
  // find a fuzzy match for key in object and return the value
  // eg getFuzzy({marginLeft: 10}, 'left') returns 10
  return _lodash.default.find(obj, (value, key) => {
    return !!key.match(new RegExp(fuzzyKey, "i"));
  });
}

function innerWidth(width, margin = {}) {
  return Math.max(width - ((getFuzzy(margin, "left") || 0) + (getFuzzy(margin, "right") || 0)), 0);
}

function innerHeight(height, margin = {}) {
  return Math.max(height - ((getFuzzy(margin, "top") || 0) + (getFuzzy(margin, "bottom") || 0)), 0);
}

function innerSize({
  width,
  height
} = {}, margin = {}) {
  return {
    width: innerWidth(width, margin),
    height: innerHeight(height, margin)
  };
}

function innerRangeX(outerWidth, margin = {}) {
  const left = getFuzzy(margin, "left") || 0;
  return [Math.min(left, outerWidth), Math.min(left + innerWidth(outerWidth, margin), outerWidth)];
}

function innerRangeY(outerHeight, margin = {}) {
  const top = getFuzzy(margin, "top") || 0;
  return [Math.min(top + innerHeight(outerHeight, margin), outerHeight), Math.min(top, outerHeight)];
}

function prefixKeys(obj, prefix) {
  if (!prefix) return obj;
  return _lodash.default.mapKeys(obj, (value, key) => prefix + _lodash.default.upperFirst(key));
} // TODO this isn't used anywhere, deprecate?


function maxMargins(margins = [], keyPrefix) {
  return margins.reduce((result, margin) => {
    return _lodash.default.mapValues(result, (value, key) => {
      return Math.max(margin[key] || 0, result[key] || 0);
    });
  }, _lodash.default.clone(prefixKeys(zeroMargin, keyPrefix)));
}

function sumMargins(margins = [], keyPrefix) {
  return margins.reduce((result, margin) => {
    return _lodash.default.mapValues(result, (value, key) => {
      return (result[key] || 0) + (margin[key] || 0);
    });
  }, _lodash.default.clone(prefixKeys(zeroMargin, keyPrefix)));
}
//# sourceMappingURL=Margin.js.map