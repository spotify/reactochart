import _ from 'lodash';
import d3 from 'd3';

export const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

export function maxMargins(margins) {
  return margins.reduce((result, margin) => {
    return _.mapValues(result, (value, key) => {
      return Math.max(margin[key] || 0, result[key] || 0);
    });
  }, _.clone(zeroMargin));
}

export function sumMargins() {

}