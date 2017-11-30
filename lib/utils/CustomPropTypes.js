'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.valueOrAccessor = exports.datumValueTypes = exports.scaleType = exports.getter = exports.fourDirectionsOf = exports.xyObjectOf = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xyObjectOf = exports.xyObjectOf = function xyObjectOf(type) {
  return _propTypes2.default.shape({ x: type, y: type });
};

var fourDirectionsOf = exports.fourDirectionsOf = function fourDirectionsOf(type) {
  return _propTypes2.default.shape({
    top: type,
    bottom: type,
    left: type,
    right: type
  });
};

var getter = exports.getter = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.array, _propTypes2.default.func]);

var scaleType = exports.scaleType = _propTypes2.default.oneOf(['linear', 'time', 'ordinal', 'log', 'pow']);

var datumValueTypes = exports.datumValueTypes = [_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.instanceOf(Date)];

var valueOrAccessor = exports.valueOrAccessor = _propTypes2.default.oneOfType([].concat(datumValueTypes, [_propTypes2.default.func]));
//# sourceMappingURL=CustomPropTypes.js.map