import get from 'lodash/get';
import isDate from 'lodash/isDate';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import isNumber from 'lodash/isNumber';
import identity from 'lodash/identity';
import {
  scaleLinear,
  scaleTime,
  scalePoint,
  scaleLog,
  scalePow,
} from 'd3-scale';

import { combineDomains, domainFromData } from './Data';

export function scaleTypeFromDataType(dataType) {
  return get(
    {
      number: 'linear',
      time: 'time',
      categorical: 'ordinal',
    },
    dataType,
    'ordinal',
  );
}

export function dataTypeFromScaleType(scaleType) {
  return get(
    {
      linear: 'number',
      log: 'number',
      pow: 'number',
      time: 'time',
      ordinal: 'categorical',
    },
    scaleType,
    'categorical',
  );
}

export function inferDataTypeFromDomain(domain) {
  if (!Array.isArray(domain))
    throw new Error(
      'invalid domain, inferDataTypeFromDomain cannot infer data type',
    );

  return domain.length !== 2
    ? 'categorical'
    : domain.every(isNumber)
    ? 'number'
    : domain.every(isDate)
    ? 'time'
    : 'categorical';
}

export function inferScaleType(scale) {
  return !scale.ticks
    ? 'ordinal'
    : isDate(scale.domain()[0])
    ? 'time'
    : scale.base
    ? 'log'
    : scale.exponent
    ? 'pow'
    : 'linear';
}

export function initScale(scaleType) {
  switch (scaleType) {
    case 'linear':
      return scaleLinear();
    case 'time':
      return scaleTime();
    case 'ordinal':
      return scalePoint();
    case 'log':
      return scaleLog();
    case 'pow':
      return scalePow();
    default:
      return;
  }
}

export function isValidScale(scale) {
  return (
    isFunction(scale) && isFunction(scale.domain) && isFunction(scale.range)
  );
}

export function hasXYScales(scale) {
  return isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}

export function getScaleTicks(scale, scaleType, tickCount = 10) {
  return (scaleType || inferScaleType(scale)) === 'ordinal'
    ? scale.domain()
    : scale.ticks(tickCount);
}

export function getTickDomain(scale, { ticks, tickCount, nice } = {}) {
  const scaleType = inferScaleType(scale);
  const scaleDomain = scale.domain();

  if (nice && scaleType !== 'ordinal') {
    // If nicing, initialize a new scale and nice it
    // eslint-disable-next-line no-param-reassign
    scale = scale
      .copy()
      .domain(scaleDomain)
      .nice(tickCount || 10);
  }

  if (Array.isArray(ticks)) {
    return combineDomains([
      scale.domain(),
      domainFromData(ticks, identity, dataTypeFromScaleType(scaleType)),
    ]);
  } else if (nice && scaleType !== 'ordinal') return scale.domain();
  // return undefined by default, if we have no options pertaining to ticks
}

export function scaleEqual(scaleA, scaleB) {
  return !isValidScale(scaleA) || !isValidScale(scaleB)
    ? scaleA === scaleB // safe fallback
    : // check scale equality
      isEqual(scaleA.domain(), scaleB.domain()) &&
        isEqual(scaleA.range(), scaleB.range());
}

export function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number)
      ? i
      : closestI;
  }, 0);
}

export function invertPointScale(scale, rangeValue) {
  const domain = scale.domain();

  // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain
  const rangePoints = domain.map(domainValue => scale(domainValue));

  if (rangePoints.length <= 1) {
    return domain[0];
  }

  const isDescending = rangePoints[0] > rangePoints[1];

  if (isDescending) {
    domain.reverse();
    rangePoints.reverse();
  }

  const nearestPointIndex = indexOfClosestNumberInList(rangeValue, rangePoints);

  return domain[nearestPointIndex];
}
