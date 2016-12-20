import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';

import {combineDomains, domainFromData} from './Data';

export function scaleTypeFromDataType(dataType) {
  return _.get({
    number: 'linear',
    time: 'time',
    categorical: 'ordinal'
  }, dataType, 'ordinal');
}

export function dataTypeFromScaleType(scaleType) {
  return _.get({
    linear: 'number',
    log: 'number',
    pow: 'number',
    time: 'time',
    ordinal: 'categorical'
  }, scaleType, 'categorical');
}

export function inferDataTypeFromDomain(domain) {
  if(!_.isArray(domain))
    throw new Error('invalid domain, inferDataTypeFromDomain cannot infer data type');

  return (domain.length !== 2) ? 'categorical':
    (_.every(domain, _.isNumber)) ? 'number':
    (_.every(domain, _.isDate)) ? 'time':
    'categorical';
}

export function inferScaleType(scale) {
  return !(scale.ticks) ? 'ordinal' :
    _.isDate(scale.domain()[0]) ? 'time' :
    (scale.base) ? 'log' :
    (scale.exponent) ? 'pow' :
    'linear';
}

export function initScale(scaleType) {
  switch(scaleType) {
    case 'linear': return d3.scaleLinear();
    case 'time': return d3.scaleTime();
    case 'ordinal': return d3.scaleOrdinal();
    case 'log': return d3.scaleLog();
    case 'pow': return d3.scalePow();
  }
}

export function isValidScale(scale) {
  return _.isFunction(scale) && _.isFunction(scale.domain) && _.isFunction(scale.range);
}

export function hasXYScales(scale) {
  return _.isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}

export function getScaleTicks(scale, scaleType, tickCount=10) {
  scaleType = scaleType || inferScaleType(scale);
  return (scaleType === 'ordinal') ?
    scale.domain() :
    scale.ticks(tickCount);
}

export function getTickDomain(scale, {ticks, tickCount, nice} = {}) {
  const scaleType = inferScaleType(scale);
  // bug - d3 linearScale.copy().nice() modifies original scale, so we must create a new scale instead of copy()ing
  // todo replace this with d3-scale from d3 v4.0
  if(nice && scaleType !== 'ordinal') {
    scale = initScale(scaleType).domain(scale.domain()).nice(tickCount || 10);
  }

  if(_.isArray(ticks)) {
    return combineDomains([scale.domain(), domainFromData(ticks, _.identity, dataTypeFromScaleType(scaleType))]);
  }
  else if(nice && scaleType !== 'ordinal') return scale.domain();
  // return undefined by default, if we have no options pertaining to ticks
}

export function scaleEqual(scaleA, scaleB) {
  return (
    (!isValidScale(scaleA) || !isValidScale(scaleB)) ?
      scaleA === scaleB : // safe fallback
      ( // check scale equality
        _.isEqual(scaleA.domain(), scaleB.domain()) &&
        _.isEqual(scaleA.range(), scaleB.range()) &&
        _.isEqual(getScaleTicks(scaleA), getScaleTicks(scaleB)) // todo is this necessary?
      )
  );
}
