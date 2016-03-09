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

export function innerWidth(width, margin = {}) {
  return Math.max(width - ((margin.left || 0) + (margin.right || 0)), 0);
}
export function innerHeight(height, margin = {}) {
  return Math.max(height - ((margin.top || 0) + (margin.bottom || 0)), 0);
}

export function innerRangeX(outerWidth, margin = {}) {
  const left = margin.left || 0;
  return [
    Math.min(left, outerWidth),
    Math.min(left + innerWidth(outerWidth, margin), outerWidth)
  ];
}
export function innerRangeY(outerHeight, margin = {}) {
  const top = margin.top || 0;
  return [
    Math.min(top + innerHeight(outerHeight, margin), outerHeight),
    Math.min(top, outerHeight)
  ];
}
