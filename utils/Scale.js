"use strict";

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
exports.indexOfClosestNumberInList = indexOfClosestNumberInList;
exports.invertPointScale = invertPointScale;

var _lodash = _interopRequireDefault(require("lodash"));

var _d = require("d3");

var _Data = require("./Data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scaleTypeFromDataType(dataType) {
  return _lodash.default.get({
    number: "linear",
    time: "time",
    categorical: "ordinal"
  }, dataType, "ordinal");
}

function dataTypeFromScaleType(scaleType) {
  return _lodash.default.get({
    linear: "number",
    log: "number",
    pow: "number",
    time: "time",
    ordinal: "categorical"
  }, scaleType, "categorical");
}

function inferDataTypeFromDomain(domain) {
  if (!_lodash.default.isArray(domain)) throw new Error("invalid domain, inferDataTypeFromDomain cannot infer data type");
  return domain.length !== 2 ? "categorical" : _lodash.default.every(domain, _lodash.default.isNumber) ? "number" : _lodash.default.every(domain, _lodash.default.isDate) ? "time" : "categorical";
}

function inferScaleType(scale) {
  return !scale.ticks ? "ordinal" : _lodash.default.isDate(scale.domain()[0]) ? "time" : scale.base ? "log" : scale.exponent ? "pow" : "linear";
}

function initScale(scaleType) {
  switch (scaleType) {
    case "linear":
      return (0, _d.scaleLinear)();

    case "time":
      return (0, _d.scaleTime)();

    case "ordinal":
      return (0, _d.scalePoint)();

    case "log":
      return (0, _d.scaleLog)();

    case "pow":
      return (0, _d.scalePow)();
  }
}

function isValidScale(scale) {
  return _lodash.default.isFunction(scale) && _lodash.default.isFunction(scale.domain) && _lodash.default.isFunction(scale.range);
}

function hasXYScales(scale) {
  return _lodash.default.isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}

function getScaleTicks(scale, scaleType, tickCount = 10) {
  scaleType = scaleType || inferScaleType(scale);
  return scaleType === "ordinal" ? scale.domain() : scale.ticks(tickCount);
}

function getTickDomain(scale, {
  ticks,
  tickCount,
  nice
} = {}) {
  const scaleType = inferScaleType(scale);
  const scaleDomain = scale.domain();

  if (nice && scaleType !== "ordinal") {
    // If nicing, initialize a new scale and nice it
    scale = scale.copy().domain(scaleDomain).nice(tickCount || 10);
  }

  if (_lodash.default.isArray(ticks)) {
    return (0, _Data.combineDomains)([scale.domain(), (0, _Data.domainFromData)(ticks, _lodash.default.identity, dataTypeFromScaleType(scaleType))]);
  } else if (nice && scaleType !== "ordinal") return scale.domain(); // return undefined by default, if we have no options pertaining to ticks

}

function scaleEqual(scaleA, scaleB) {
  return !isValidScale(scaleA) || !isValidScale(scaleB) ? scaleA === scaleB // safe fallback
  : // check scale equality
  _lodash.default.isEqual(scaleA.domain(), scaleB.domain()) && _lodash.default.isEqual(scaleA.range(), scaleB.range());
}

function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

function invertPointScale(scale, rangeValue) {
  const domain = scale.domain(); // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain

  const rangePoints = domain.map(domainValue => scale(domainValue));

  if (rangePoints.length <= 1) {
    return domain[0];
  }

  const isDescending = rangePoints[0] > rangePoints[1]; // _.sortedIndex works on ascending lists only
  // so reverse if working with descending list

  if (isDescending) {
    domain.reverse();
    rangePoints.reverse();
  }

  const nearestPointIndex = indexOfClosestNumberInList(rangeValue, rangePoints);
  return domain[nearestPointIndex];
}
//# sourceMappingURL=Scale.js.map