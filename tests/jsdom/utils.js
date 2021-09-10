import _ from 'lodash';
import { scaleLinear, scalePoint } from 'd3-scale';

export function expectProps(el, expectedProps) {
  const props = el.props();
  _.forEach(expectedProps, (expectedValue, key) => {
    expect(props[key]).toEqual(expectedValue);
  });
}

export function testWithScales(scaleTypes, callback) {
  const testScales = {
    linear: {
      scale: scaleLinear()
        .domain([-3, 3])
        .range([20, 100]),
      testValues: [-1.4, 1.7, 2.8],
    },
    // time: {},
    ordinal: {
      scale: scalePoint()
        .domain(['a', 'b', 'c', 'd', 'e'])
        .range([0, 100]),
      testValues: ['a', 'c', 'e'],
    },
  };

  scaleTypes.forEach(scaleType => {
    if (!_.has(testScales, scaleType))
      throw new Error(
        `${scaleType} is not a valid scaleType for testWithScales`,
      );
  });

  const scalesToTest = _.compact(
    scaleTypes.map(scaleType => testScales[scaleType]),
  );
  scalesToTest.forEach((scaleInfo, scaleType) => {
    callback({ ...scaleInfo, scaleType });
  });
}
