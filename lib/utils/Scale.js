'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scaleTypeFromDataType = scaleTypeFromDataType;
exports.dataTypeFromScaleType = dataTypeFromScaleType;
exports.inferDataTypeFromDomain = inferDataTypeFromDomain;
exports.inferScaleType = inferScaleType;
exports.initScale = initScale;
exports.isValidScale = isValidScale;
exports.hasXYScales = hasXYScales;
exports.getScaleTicks = getScaleTicks;
exports.getTickDomain = getTickDomain;
exports.scaleEqual = scaleEqual;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _Data = require('./Data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scaleTypeFromDataType(dataType) {
  return _lodash2.default.get({
    number: 'linear',
    time: 'time',
    categorical: 'ordinal'
  }, dataType, 'ordinal');
}

function dataTypeFromScaleType(scaleType) {
  return _lodash2.default.get({
    linear: 'number',
    log: 'number',
    pow: 'number',
    time: 'time',
    ordinal: 'categorical'
  }, scaleType, 'categorical');
}

function inferDataTypeFromDomain(domain) {
  if (!_lodash2.default.isArray(domain)) throw new Error('invalid domain, inferDataTypeFromDomain cannot infer data type');

  return domain.length !== 2 ? 'categorical' : _lodash2.default.every(domain, _lodash2.default.isNumber) ? 'number' : _lodash2.default.every(domain, _lodash2.default.isDate) ? 'time' : 'categorical';
}

function inferScaleType(scale) {
  return !scale.ticks ? 'ordinal' : _lodash2.default.isDate(scale.domain()[0]) ? 'time' : scale.base ? 'log' : scale.exponent ? 'pow' : 'linear';
}

function initScale(scaleType) {
  switch (scaleType) {
    case 'linear':
      return _d2.default.scale.linear();
    case 'time':
      return _d2.default.time.scale();
    case 'ordinal':
      return _d2.default.scale.ordinal();
    case 'log':
      return _d2.default.scale.log();
    case 'pow':
      return _d2.default.scale.pow();
  }
}

function isValidScale(scale) {
  return _lodash2.default.isFunction(scale) && _lodash2.default.isFunction(scale.domain) && _lodash2.default.isFunction(scale.range);
}

function hasXYScales(scale) {
  return _lodash2.default.isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}

function getScaleTicks(scale, scaleType) {
  var tickCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

  scaleType = scaleType || inferScaleType(scale);
  return scaleType === 'ordinal' ? scale.domain() : scale.ticks(tickCount);
}

function getTickDomain(scale) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      ticks = _ref.ticks,
      tickCount = _ref.tickCount,
      nice = _ref.nice;

  var scaleType = inferScaleType(scale);
  // bug - d3 linearScale.copy().nice() modifies original scale, so we must create a new scale instead of copy()ing
  // todo replace this with d3-scale from d3 v4.0
  if (nice && scaleType !== 'ordinal') {
    scale = initScale(scaleType).domain(scale.domain()).nice(tickCount || 10);
  }

  if (_lodash2.default.isArray(ticks)) {
    return (0, _Data.combineDomains)([scale.domain(), (0, _Data.domainFromData)(ticks, _lodash2.default.identity, dataTypeFromScaleType(scaleType))]);
  } else if (nice && scaleType !== 'ordinal') return scale.domain();
  // return undefined by default, if we have no options pertaining to ticks
}

function scaleEqual(scaleA, scaleB) {
  return !isValidScale(scaleA) || !isValidScale(scaleB) ? scaleA === scaleB : // safe fallback
  // check scale equality
  _lodash2.default.isEqual(scaleA.domain(), scaleB.domain()) && _lodash2.default.isEqual(scaleA.range(), scaleB.range()) && _lodash2.default.isEqual(getScaleTicks(scaleA), getScaleTicks(scaleB)) // todo is this necessary?
  ;
}