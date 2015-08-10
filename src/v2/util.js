import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';

export const AccessorPropType =
    PropTypes.oneOfType(PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func);

export function accessor(key) {
    return _.isFunction(key) ? key: _.property(key);
}

