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
    time: 'time',
    ordinal: 'categorical'
  }, scaleType, 'categorical');
}

export function initScale(type) {
  switch(type) {
    case 'linear': return d3.scale.linear();
    case 'time': return d3.time.scale();
    case 'ordinal': return d3.scale.ordinal();
  }
}