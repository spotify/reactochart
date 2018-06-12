import * as d3 from "d3";
import _ from "lodash";
import { expect } from "chai";

export function expectProps(el, expectedProps) {
  const props = el.props();
  _.forEach(expectedProps, (expectedValue, key) => {
    expect(props[key]).to.equal(expectedValue);
  });
}

export function testWithScales(scaleTypes, callback) {
  const testScales = {
    linear: {
      scale: d3
        .scaleLinear()
        .domain([-3, 3])
        .range([20, 100]),
      testValues: [-1.4, 1.7, 2.8]
    },
    // time: {},
    ordinal: {
      scale: d3
        .scalePoint()
        .domain(["a", "b", "c", "d", "e"])
        .range([0, 100]),
      testValues: ["a", "c", "e"]
    }
  };

  scaleTypes.forEach(scaleType => {
    if (!_.has(testScales, scaleType))
      throw new Error(
        `${scaleType} is not a valid scaleType for testWithScales`
      );
  });

  const scalesToTest = _.compact(
    scaleTypes.map(scaleType => testScales[scaleType])
  );
  scalesToTest.forEach((scaleInfo, scaleType) => {
    callback({ ...scaleInfo, scaleType });
  });
}
