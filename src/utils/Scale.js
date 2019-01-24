import _ from "lodash";
import { scaleLinear, scaleTime, scalePoint, scaleLog, scalePow } from "d3";

import { combineDomains, domainFromData } from "./Data";

export function scaleTypeFromDataType(dataType) {
  return _.get(
    {
      number: "linear",
      time: "time",
      categorical: "ordinal"
    },
    dataType,
    "ordinal"
  );
}

export function dataTypeFromScaleType(scaleType) {
  return _.get(
    {
      linear: "number",
      log: "number",
      pow: "number",
      time: "time",
      ordinal: "categorical"
    },
    scaleType,
    "categorical"
  );
}

export function inferDataTypeFromDomain(domain) {
  if (!_.isArray(domain))
    throw new Error(
      "invalid domain, inferDataTypeFromDomain cannot infer data type"
    );

  return domain.length !== 2
    ? "categorical"
    : _.every(domain, _.isNumber)
      ? "number"
      : _.every(domain, _.isDate)
        ? "time"
        : "categorical";
}

export function inferScaleType(scale) {
  return !scale.ticks
    ? "ordinal"
    : _.isDate(scale.domain()[0])
      ? "time"
      : scale.base
        ? "log"
        : scale.exponent
          ? "pow"
          : "linear";
}

export function initScale(scaleType) {
  switch (scaleType) {
    case "linear":
      return scaleLinear();
    case "time":
      return scaleTime();
    case "ordinal":
      return scalePoint();
    case "log":
      return scaleLog();
    case "pow":
      return scalePow();
  }
}

export function isValidScale(scale) {
  return (
    _.isFunction(scale) &&
    _.isFunction(scale.domain) &&
    _.isFunction(scale.range)
  );
}

export function hasXYScales(scale) {
  return _.isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}

export function getScaleTicks(scale, scaleType, tickCount = 10) {
  scaleType = scaleType || inferScaleType(scale);
  return scaleType === "ordinal" ? scale.domain() : scale.ticks(tickCount);
}

export function getTickDomain(scale, { ticks, tickCount, nice } = {}) {
  const scaleType = inferScaleType(scale);
  const scaleDomain = scale.domain();

  if (nice && scaleType !== "ordinal") {
    // If nicing, initialize a new scale and nice it
    scale = scale
      .copy()
      .domain(scaleDomain)
      .nice(tickCount || 10);
  }

  if (_.isArray(ticks)) {
    return combineDomains([
      scale.domain(),
      domainFromData(ticks, _.identity, dataTypeFromScaleType(scaleType))
    ]);
  } else if (nice && scaleType !== "ordinal") return scale.domain();
  // return undefined by default, if we have no options pertaining to ticks
}

export function scaleEqual(scaleA, scaleB) {
  return !isValidScale(scaleA) || !isValidScale(scaleB)
    ? scaleA === scaleB // safe fallback
    : // check scale equality
      _.isEqual(scaleA.domain(), scaleB.domain()) &&
        _.isEqual(scaleA.range(), scaleB.range());
}

export function indexOfClosestLeftNumberInList(number, sortedList) {
  if (sortedList.length <= 1) {
    return 0;
  }

  const isDescending = sortedList[0] > sortedList[1];
  // _.sortedIndex works on ascending lists only
  // so reverse if working with descending list
  const listCopy = isDescending ? sortedList.slice().reverse() : sortedList;

  // Get lower bound of where number falls
  let indexForNumber = _.sortedIndex(listCopy, number);
  if (isDescending && indexForNumber < sortedList.length) {
    indexForNumber += 1;
  } else if (!isDescending && indexForNumber > 0) {
    indexForNumber -= 1;
  }

  return isDescending
    ? // If descending, remap indexForNumber to work with descending list
      Math.abs(indexForNumber - sortedList.length)
    : indexForNumber;
}

export function invertPointScale(scale, rangeValue) {
  const domain = scale.domain();

  // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain
  const rangePoints = domain.map(domainValue => scale(domainValue));
  const nearestLeftPointIndex = indexOfClosestLeftNumberInList(
    rangeValue,
    rangePoints
  );

  return domain[nearestLeftPointIndex];
}
