'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = xyPropsEqual;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shallowEqual = require('./shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _Scale = require('./Scale');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function xyPropsEqual(propsA, propsB) {
  // const start = performance.now();
  var deepishProps = ['margin', 'scaleType'];
  var deeperProps = ['domain'];
  var deepProps = deepishProps.concat(deeperProps).concat('scale');

  var isEqual = (0, _shallowEqual2.default)(_lodash2.default.omit(propsA, deepProps), _lodash2.default.omit(propsB, deepProps)) && _lodash2.default.every(deepishProps, function (key) {
    return (0, _shallowEqual2.default)(propsA[key], propsB[key]);
  }) && _lodash2.default.every(deeperProps, function (key) {
    return _lodash2.default.isEqual(propsA[key], propsB[key]);
  }) && _lodash2.default.every(['x', 'y'], function (key) {
    return (0, _Scale.scaleEqual)(propsA.scale[key], propsB.scale[key]);
  });

  // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);
  return isEqual;
}