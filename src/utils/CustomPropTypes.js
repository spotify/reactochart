import PropTypes from "prop-types";
import _ from "lodash";

export const xyObjectOf = type => PropTypes.shape({ x: type, y: type });

export const fourDirectionsOf = type =>
  PropTypes.shape({
    top: type,
    bottom: type,
    left: type,
    right: type
  });

export const getter = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.array,
  PropTypes.func
]);

export const scaleType = PropTypes.oneOf([
  "linear",
  "time",
  "ordinal",
  "log",
  "pow"
]);

export const datumValueTypes = [
  PropTypes.number,
  PropTypes.string,
  PropTypes.instanceOf(Date)
];

export const valueOrAccessor = PropTypes.oneOfType([
  ...datumValueTypes,
  PropTypes.func
]);

export const accessorOrType = type => {
  if (_.isArray(type)) return PropTypes.oneOfType([PropTypes.func, ...type]);
  return PropTypes.oneOfType([PropTypes.func, type]);
};
