import _ from "lodash";

export const zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

function getFuzzy(obj = {}, fuzzyKey) {
  // find a fuzzy match for key in object and return the value
  // eg getFuzzy({marginLeft: 10}, 'left') returns 10
  return _.find(obj, (value, key) => {
    return !!key.match(new RegExp(fuzzyKey, "i"));
  });
}

export function innerWidth(width, margin = {}) {
  return Math.max(
    width -
      ((getFuzzy(margin, "left") || 0) + (getFuzzy(margin, "right") || 0)),
    0
  );
}
export function innerHeight(height, margin = {}) {
  return Math.max(
    height -
      ((getFuzzy(margin, "top") || 0) + (getFuzzy(margin, "bottom") || 0)),
    0
  );
}

export function innerSize({ width, height } = {}, margin = {}) {
  return {
    width: innerWidth(width, margin),
    height: innerHeight(height, margin)
  };
}

export function innerRangeX(outerWidth, margin = {}) {
  const left = getFuzzy(margin, "left") || 0;
  return [
    Math.min(left, outerWidth),
    Math.min(left + innerWidth(outerWidth, margin), outerWidth)
  ];
}
export function innerRangeY(outerHeight, margin = {}) {
  const top = getFuzzy(margin, "top") || 0;
  return [
    Math.min(top + innerHeight(outerHeight, margin), outerHeight),
    Math.min(top, outerHeight)
  ];
}

function prefixKeys(obj, prefix) {
  if (!prefix) return obj;
  return _.mapKeys(obj, (value, key) => prefix + _.upperFirst(key));
}

export function maxMargins(margins = [], keyPrefix) {
  return margins.reduce((result, margin) => {
    return _.mapValues(result, (value, key) => {
      return Math.max(margin[key] || 0, result[key] || 0);
    });
  }, _.clone(prefixKeys(zeroMargin, keyPrefix)));
}

export function sumMargins(margins = [], keyPrefix) {
  return margins.reduce((result, margin) => {
    return _.mapValues(result, (value, key) => {
      return (result[key] || 0) + (margin[key] || 0);
    });
  }, _.clone(prefixKeys(zeroMargin, keyPrefix)));
}
