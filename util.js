"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.methodIfFuncProp = methodIfFuncProp;
exports.hasOneOfTwo = hasOneOfTwo;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
function methodIfFuncProp(propName, props, context) {
  return _lodash.default.isFunction(props[propName]) && _lodash.default.isFunction(context[propName]) ? context[propName] : null;
}

function hasOneOfTwo(a, b) {
  return _lodash.default.some([a, b], _lodash.default.isUndefined) && _lodash.default.some([a, b], v => !_lodash.default.isUndefined(v));
}
//# sourceMappingURL=util.js.map