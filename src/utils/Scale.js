import _ from 'lodash';
import React from 'react';
import d3 from 'd3';

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

export function inferScaleType(scale) {
  return !(scale.ticks) ? 'ordinal' :
    _.isDate(scale.domain()[0]) ? 'time' :
    (scale.base) ? 'log' :
    (scale.exponent) ? 'pow' :
    'linear';
}

export function initScale(scaleType) {
  switch(scaleType) {
    case 'linear': return d3.scale.linear();
    case 'time': return d3.time.scale();
    case 'ordinal': return d3.scale.ordinal();
    case 'log': return d3.scale.log();
    case 'pow': return d3.scale.pow();
  }
}

export function isValidScale(scale) {
  return _.isFunction(scale) && _.isFunction(scale.domain) && _.isFunction(scale.range);
}


export function getScaleTicks(scale, scaleType, tickCount=10) {
  scaleType = scaleType || inferScaleType(scale);
  return (scaleType === 'ordinal') ?
    scale.domain() :
    scale.ticks(tickCount);
}
