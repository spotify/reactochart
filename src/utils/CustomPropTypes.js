import React from 'react';
import PropTypes from 'prop-types';

export const xyObjectOf = (type) => (
  PropTypes.shape({x: type, y: type})
);

export const fourDirectionsOf = (type) => (
  PropTypes.shape({
    top: type,
    bottom: type,
    left: type,
    right: type
  })
);

export const getter = PropTypes.oneOfType([
  PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func
]);

export const scaleType = PropTypes.oneOf([
  'linear', 'time', 'ordinal', 'log', 'pow'
]);

