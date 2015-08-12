import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';

export const AccessorPropType =
    PropTypes.oneOfType(PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func);

export function accessor(key) {
    return _.isFunction(key) ? key : // pass an accessor function...
        _.isNull(key) ? _.identity : // or null to just return the item itself...
        _.property(key);             // or an array index or object key
}

