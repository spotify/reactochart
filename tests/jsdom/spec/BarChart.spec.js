import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';

import {testWithScales} from '../utils';
import {XYPlot, BarChart, RangeBarChart} from '../../../src/index.js';

function expectProps(el, expectedProps) {
  const props = el.props();
  _.forEach(expectedProps, (expectedValue, key) => {
    expect(props[key]).to.equal(expectedValue);
  });
}



describe('BarChart', () => {
  it('passes most props through to RangeBarChart', () => {
    // bar chart is just a simple wrapper around RangeBarChart, most props are passed through
    const props = {
      scale: {
        x: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
        y: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      },
      data: [['a', 0.25], ['b', .5], ['c', .67]],
      x: d => d[0],
      y: d => d[1],
      barThickness: 13,
      horizontal: false,
      barClassName: 'test-bar-class-name',
      barStyle: {fill: "red"},
      getClass: () => 'test',
      onMouseEnterBar: () => 'onMouseEnterBar',
      onMouseMoveBar: () => 'onMouseMoveBar',
      onMouseLeaveBar: () => 'onMouseLeaveBar'
    };

    const chart = mount(<BarChart {...props} />);
    const rangeBarChart = chart.find(RangeBarChart);
    // all props should be passed through as-is *except* y
    expectProps(rangeBarChart, _.omit(props, ['y']));

    // vertical bar chart - y is passed to RangeBarChart as yEnd
    expect(rangeBarChart.props().yEnd).to.equal(props.y);

    // check that correct props are passed through in horizontal case\
    const horizontalProps = {...props, horizontal: true}
  });

  it('renders a bar chart with categorical X data & numerical Y data', () => {
    // make simple bar chart with 3 datapoints to make sure it renders correctly
    // this is more of an integration test/sanity check;
    // most tests for render correctness are in RangeBarChart and Bar specs

    testWithScales(['linear', 'ordinal'], ({scale: xScale, testValues: xTestValues}) => {
      testWithScales(['linear'], ({scale: yScale, testValues: yTestValues}) => {
        const props = {
          scale: {
            x: xScale,
            y: yScale
          },
          data: _.zip(_.take(xTestValues, 3), _.take(yTestValues, 3)),
          x: d => d[0],
          y: d => d[1],
          barThickness: 10
        };

        const chart = mount(<BarChart {...props} />);
        const group = chart.find('g');
        const bars = chart.find('rect');
        expect(group).to.have.length(1);
        expect(bars).to.have.length(3);

        ([0, 1, 2]).forEach((i) => {
          const barProps = bars.at(i).props();
          console.log(_.pick(barProps, ['x','y','width','height']));
          expect(barProps.x).to.equal(xScale(xTestValues[i]) - (props.barThickness / 2));
          expect(barProps.width).to.equal(props.barThickness);
          const yZero = yScale(0);
          const yVal = yScale(yTestValues[i]);
          console.log(yZero, yVal);
          expect(barProps.y).to.equal(Math.min(yZero, yVal));
          expect(barProps.height).to.equal(Math.abs(yVal - yZero));
        });
      })
    });
  });
});