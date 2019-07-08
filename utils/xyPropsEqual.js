"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = xyPropsEqual;
exports.xyPropsEqualDebug = xyPropsEqualDebug;
exports.defaultPropKeysToDeepCheck = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _shallowEqual = _interopRequireDefault(require("./shallowEqual"));

var _Scale = require("./Scale");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// xyPropsEqual is a function used by XYPlot-type charts,
// in their `shouldComponentUpdate` methods, for determining whether next props are the same as previous props.
// in a perfect world this would just be a simple shallow equality check,
// however some props are almost always passed as object/array literals (so they never ===)
// or require special equality checks (eg. d3 scales)
// default list of props to check for *deep equality* using _.isEqual
// can be overridden by components by passing `propKeysToDeepCheck` argument
// todo: decide whether data really belongs on this list? deep-checking data can be slow, but re-rendering is even slower
const defaultPropKeysToDeepCheck = ["margin", "scaleType", "spacing", "domain", "style", "data" // not worth deepchecking data due to perf issues
];
exports.defaultPropKeysToDeepCheck = defaultPropKeysToDeepCheck;

function xyPropsEqual(propsA, propsB, customKeysToDeepCheck = [], includeDefaults = true) {
  const propKeysToDeepCheck = includeDefaults ? defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck) : customKeysToDeepCheck;
  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat("scale");

  const isEqual = // most keys just get shallow-equality checked
  (0, _shallowEqual.default)(_lodash.default.omit(propsA, propKeysToSkipShallowCheck), _lodash.default.omit(propsB, propKeysToSkipShallowCheck)) && // propKeysToDeepCheck get deep-equality checked using _.isEqual
  _lodash.default.every(propKeysToDeepCheck, key => _lodash.default.isEqual(propsA[key], propsB[key])) && // d3 scales are special, get deep-checked using custom `scaleEqual` utility
  _lodash.default.every(["x", "y"], key => {
    return (0, _Scale.scaleEqual)(_lodash.default.get(propsA, "scale[".concat(key, "]")), _lodash.default.get(propsA, "scale[".concat(key, "]")));
  });

  return isEqual;
}

function xyPropsEqualDebug(propsA, propsB, customKeysToDeepCheck = [], includeDefaults = true) {
  const propKeysToDeepCheck = includeDefaults ? defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck) : customKeysToDeepCheck; // debug version of xyPropsEqual which console.logs, for figuring out which props are failing equality check
  // const start = performance.now();

  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat("scale");

  const isEqual = // most keys just get shallow-equality checked
  (0, _shallowEqual.default)(_lodash.default.omit(propsA, propKeysToSkipShallowCheck), _lodash.default.omit(propsB, propKeysToSkipShallowCheck)) && _lodash.default.every(propKeysToDeepCheck, key => {
    const isDeepEqual = _lodash.default.isEqual(propsA[key], propsB[key]);

    if (!isDeepEqual) console.log("xyProps: ".concat(key, " not equal"));
    return isDeepEqual;
  }) && _lodash.default.every(["x", "y"], key => {
    const isScaleEqual = (0, _Scale.scaleEqual)(propsA.scale[key], propsB.scale[key]);
    if (!isScaleEqual) console.log("xyProps: scale.".concat(key, " not equal"));
    return isScaleEqual;
  }); // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);


  return isEqual;
}
//# sourceMappingURL=xyPropsEqual.js.map