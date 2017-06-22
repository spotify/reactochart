'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zeroMargin = undefined;
exports.innerWidth = innerWidth;
exports.innerHeight = innerHeight;
exports.innerSize = innerSize;
exports.innerRangeX = innerRangeX;
exports.innerRangeY = innerRangeY;
exports.maxMargins = maxMargins;
exports.sumMargins = sumMargins;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zeroMargin = exports.zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

function innerWidth(width) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return Math.max(width - ((margin.left || 0) + (margin.right || 0)), 0);
}
function innerHeight(height) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return Math.max(height - ((margin.top || 0) + (margin.bottom || 0)), 0);
}

function innerSize() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      width = _ref.width,
      height = _ref.height;

  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return { width: innerWidth(width, margin), height: innerHeight(height, margin) };
}

function innerRangeX(outerWidth) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var left = margin.left || 0;
  return [Math.min(left, outerWidth), Math.min(left + innerWidth(outerWidth, margin), outerWidth)];
}
function innerRangeY(outerHeight) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var top = margin.top || 0;
  return [Math.min(top + innerHeight(outerHeight, margin), outerHeight), Math.min(top, outerHeight)];
}

function maxMargins() {
  var margins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  return margins.reduce(function (result, margin) {
    return _lodash2.default.mapValues(result, function (value, key) {
      return Math.max(margin[key] || 0, result[key] || 0);
    });
  }, _lodash2.default.clone(zeroMargin));
}

function sumMargins() {
  var margins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  return margins.reduce(function (result, margin) {
    return _lodash2.default.mapValues(result, function (value, key) {
      return (result[key] || 0) + (margin[key] || 0);
    });
  }, _lodash2.default.clone(zeroMargin));
}