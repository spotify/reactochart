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

describe('RangeBarChart', () => {
  it('renders a bar chart with categorical X data & numerical Y data', () => {
    // make simple bar chart with 3 datapoints to make sure it renders correctly
    // this is more of an integration test/sanity check;
    // most tests for render correctness are in RangeBarChart and Bar specs

    const props = {
      scale: {
        x: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
        y: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      },
      data: [['a', [0.3, 0.5]], ['b', [0.6, .9]]],
      x: d => d[0],
      y: d => d[1][0],
      yEnd: d => d[1][1],
      barThickness: 10
    };

    const chart = mount(<RangeBarChart {...props} />);
    const group = chart.find('g');
    const bars = chart.find('rect');
    expect(group).to.have.length(1);
    expect(bars).to.have.length(2);

    expect(bars.at(0).props().x).to.equal(0 - (props.barThickness / 2));
    expect(bars.at(0).props().width).to.equal(props.barThickness);
    expect(bars.at(0).props().y).to.equal(50);
    expect(bars.at(0).props().height).to.equal(20);

    expect(bars.at(1).props().x).to.equal(50 - (props.barThickness / 2));
    expect(bars.at(1).props().width).to.equal(props.barThickness);
    expect(bars.at(1).props().y).to.equal(10);
    expect(bars.at(1).props().height).to.equal(30);
  });
});