'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.methodIfFuncProp = methodIfFuncProp;
exports.hasOneOfTwo = hasOneOfTwo;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
function methodIfFuncProp(propName, props, context) {
    return _lodash2.default.isFunction(props[propName]) && _lodash2.default.isFunction(context[propName]) ? context[propName] : null;
}

function hasOneOfTwo(a, b) {
    return _lodash2.default.some([a, b], _lodash2.default.isUndefined) && _lodash2.default.some([a, b], function (v) {
        return !_lodash2.default.isUndefined(v);
    });
}
//# sourceMappingURL=util.js.map