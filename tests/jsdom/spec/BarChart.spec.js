import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';

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
      getX: 0,
      getY: 1,
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
    // all props should be passed through as-is *except* getY
    expectProps(rangeBarChart, _.omit(props, ['getY']));

    // vertical bar chart - getY is passed to RangeBarChart as getYEnd
    expect(rangeBarChart.props().getYEnd).to.equal(props.getY);

    // check that correct props are passed through in horizontal case\
    const horizontalProps = {...props, horizontal: true}
  });

  it('renders a bar chart with categorical X data & numerical Y data', () => {
    // make simple bar chart with 3 datapoints to make sure it renders correctly
    // this is more of an integration test/sanity check;
    // most tests for render correctness are in RangeBarChart and Bar specs

    const props = {
      scale: {
        x: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
        y: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      },
      data: [['a', 0.25], ['b', .5], ['c', .67]],
      getX: 0,
      getY: 1,
      barThickness: 10
    };

    const chart = mount(<BarChart {...props} />);
    const group = chart.find('g');
    const bars = chart.find('rect');
    expect(group).to.have.length(1);
    expect(bars).to.have.length(3);

    expect(bars.at(0).props().x).to.equal(0 - (props.barThickness / 2));
    expect(bars.at(0).props().y).to.equal(75);
    expect(bars.at(0).props().width).to.equal(props.barThickness);
    expect(bars.at(0).props().height).to.equal(25);

    expect(bars.at(1).props().x).to.equal(50 - (props.barThickness / 2));
    expect(bars.at(1).props().y).to.equal(50);
    expect(bars.at(1).props().width).to.equal(props.barThickness);
    expect(bars.at(1).props().height).to.equal(50);

    expect(bars.at(2).props().x).to.equal(100 - (props.barThickness / 2));
    expect(bars.at(2).props().y).to.equal(33);
    expect(bars.at(2).props().width).to.equal(props.barThickness);
    expect(bars.at(2).props().height).to.equal(67);
  });
});