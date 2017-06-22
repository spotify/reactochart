'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scaleType = exports.getter = exports.fourDirectionsOf = exports.xyObjectOf = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;
var xyObjectOf = exports.xyObjectOf = function xyObjectOf(type) {
  return PropTypes.shape({ x: type, y: type });
};

var fourDirectionsOf = exports.fourDirectionsOf = function fourDirectionsOf(type) {
  return PropTypes.shape({
    top: type,
    bottom: type,
    left: type,
    right: type
  });
};

var getter = exports.getter = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func]);

var scaleType = exports.scaleType = PropTypes.oneOf(['linear', 'time', 'ordinal', 'log', 'pow']);