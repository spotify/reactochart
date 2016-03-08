import _ from 'lodash';
import React from 'react';


export function scaleTypeFromDataType(dataType) {
  return _.get({
    number: 'linear',
    time: 'time',
    categorical: 'ordinal'
  }, dataType, 'ordinal');
}

export function dataTypeFromScaleType(dataType) {
  return _.get({
    linear: 'number',
    time: 'time',
    ordinal: 'categorical'
  }, dataType, 'categorical');
}
