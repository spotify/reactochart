'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultPropKeysToDeepCheck = undefined;
exports.default = xyPropsEqual;
exports.xyPropsEqualDebug = xyPropsEqualDebug;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shallowEqual = require('./shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _Scale = require('./Scale');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// xyPropsEqual is a function used by XYPlot-type charts,
// in their `shouldComponentUpdate` methods, for determining whether next props are the same as previous props.
// in a perfect world this would just be a simple shallow equality check,
// however some props are almost always passed as object/array literals (so they never ===)
// or require special equality checks (eg. d3 scales)

// default list of props to check for *deep equality* using _.isEqual
// can be overridden by components by passing `propKeysToDeepCheck` argument
// todo: decide whether data really belongs on this list? deep-checking data can be slow, but re-rendering is even slower
var defaultPropKeysToDeepCheck = exports.defaultPropKeysToDeepCheck = ['margin', 'scaleType', 'spacing', 'domain', 'style', 'lineStyle', 'data'];

function xyPropsEqual(propsA, propsB) {
  var propKeysToDeepCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultPropKeysToDeepCheck;

  var propKeysToSkipShallowCheck = propKeysToDeepCheck.concat('scale');

  var isEqual =
  // most keys just get shallow-equality checked
  (0, _shallowEqual2.default)(_lodash2.default.omit(propsA, propKeysToSkipShallowCheck), _lodash2.default.omit(propsB, propKeysToSkipShallowCheck)) &&
  // propKeysToDeepCheck get deep-equality checked using _.isEqual
  _lodash2.default.every(propKeysToDeepCheck, function (key) {
    return _lodash2.default.isEqual(propsA[key], propsB[key]);
  }) &&
  // d3 scales are special, get deep-checked using custom `scaleEqual` utility
  _lodash2.default.every(['x', 'y'], function (key) {
    return (0, _Scale.scaleEqual)(_lodash2.default.get(propsA, 'scale[' + key + ']'), _lodash2.default.get(propsA, 'scale[' + key + ']'));
  });

  return isEqual;
}

function xyPropsEqualDebug(propsA, propsB) {
  var propKeysToDeepCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultPropKeysToDeepCheck;

  // debug version of xyPropsEqual which console.logs, for figuring out which props are failing equality check
  // const start = performance.now();
  var propKeysToSkipShallowCheck = propKeysToDeepCheck.concat('scale');

  var isEqual =
  // most keys just get shallow-equality checked
  (0, _shallowEqual2.default)(_lodash2.default.omit(propsA, propKeysToSkipShallowCheck), _lodash2.default.omit(propsB, propKeysToSkipShallowCheck)) && _lodash2.default.every(deeperProps, function (key) {
    var isDeepEqual = _lodash2.default.isEqual(propsA[key], propsB[key]);
    if (!isDeepEqual) console.log('xyProps: ' + key + ' not equal');
    return isDeepEqual;
  }) && _lodash2.default.every(['x', 'y'], function (key) {
    var isScaleEqual = (0, _Scale.scaleEqual)(propsA.scale[key], propsB.scale[key]);
    if (!isScaleEqual) console.log('xyProps: scale.' + key + ' not equal');
    return isScaleEqual;
  });

  // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);
  return isEqual;
}