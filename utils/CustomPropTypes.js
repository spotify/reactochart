"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accessorOrType = exports.valueOrAccessor = exports.datumValueTypes = exports.scaleType = exports.getter = exports.fourDirectionsOf = exports.xyObjectOf = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const xyObjectOf = type => _propTypes.default.shape({
  x: type,
  y: type
});

exports.xyObjectOf = xyObjectOf;

const fourDirectionsOf = type => _propTypes.default.shape({
  top: type,
  bottom: type,
  left: type,
  right: type
});

exports.fourDirectionsOf = fourDirectionsOf;

const getter = _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number, _propTypes.default.array, _propTypes.default.func]);

exports.getter = getter;

const scaleType = _propTypes.default.oneOf(["linear", "time", "ordinal", "log", "pow"]);

exports.scaleType = scaleType;
const datumValueTypes = [_propTypes.default.number, _propTypes.default.string, _propTypes.default.instanceOf(Date)];
exports.datumValueTypes = datumValueTypes;

const valueOrAccessor = _propTypes.default.oneOfType([...datumValueTypes, _propTypes.default.func]);

exports.valueOrAccessor = valueOrAccessor;

const accessorOrType = type => {
  if (_lodash.default.isArray(type)) return _propTypes.default.oneOfType([_propTypes.default.func, ...type]);
  return _propTypes.default.oneOfType([_propTypes.default.func, type]);
};

exports.accessorOrType = accessorOrType;
//# sourceMappingURL=CustomPropTypes.js.map