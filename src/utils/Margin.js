import _ from 'lodash';
import d3 from 'd3';

export const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

export function innerWidth(width, margin = {}) {
  return Math.max(width - ((margin.left || 0) + (margin.right || 0)), 0);
}
export function innerHeight(height, margin = {}) {
  return Math.max(height - ((margin.top || 0) + (margin.bottom || 0)), 0);
}

export function innerSize({width, height} = {}, margin = {}) {
  return {width: innerWidth(width, margin), height: innerHeight(height, margin)};
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

export function maxMargins(margins = []) {
  return margins.reduce((result, margin) => {
    return _.mapValues(result, (value, key) => {
      return Math.max(margin[key] || 0, result[key] || 0);
    });
  }, _.clone(zeroMargin));
}

export function sumMargins(margins = []) {
  return margins.reduce((result, margin) => {
    return _.mapValues(result, (value, key) => {
      return (result[key] || 0) + (margin[key] || 0);
    });
  }, _.clone(zeroMargin));
}
