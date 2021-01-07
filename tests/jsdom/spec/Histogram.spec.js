import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { expectProps } from '../utils';
import { Histogram, AreaBarChart } from '../../../src/index.js';

describe('Histogram', () => {
  it('it passes most props through to AreaBarChart', () => {
    // histogram is a wrapper around AreaBarChart
    const props = {
      xScale: scaleLinear()
        .domain([-1, 0, 1])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 10])
        .range([100, 0]),
      data: [-1, 0, 1, -1, 0, 1, 1, 1],
      value: x => {
        return x;
      },
      thresholds: 3,
      nice: true,
      barClassName: 'test-bar-class-name',
      barStyle: { fill: 'red' },
      onMouseEnterBar: () => 'onMouseEnterBar',
      onMouseMoveBar: () => 'onMouseMoveBar',
      onMouseLeaveBar: () => 'onMouseLeaveBar',
    };

    const histogram = mount(<Histogram {...props} />);
    const areaBarChart = histogram.find(AreaBarChart);

    const parsedProps = {
      ...props,
      data: Histogram.computeHistogram(
        props.data,
        props.thresholds,
        props.value,
        null,
        props.nice,
      ),
    };

    // Omit data since expectProps will check for reference equality on the data instead of
    expectProps(areaBarChart, _.omit(parsedProps, ['data']));
    // Check value of data prop is equal
    expect(areaBarChart.props().data).to.eql(parsedProps.data);
  });

  it('renders histogram', () => {
    // histogram is a wrapper around AreaBarChart
    const props = {
      xScale: scaleLinear()
        .domain([-1, 0, 1])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 10])
        .range([100, 0]),
      data: [-1, 0, 1, -1, 0, 1, 1, 1],
      value: x => {
        return x;
      },
      nice: true,
      thresholds: 3,
      barClassName: 'test-bar-class-name',
      barStyle: { fill: 'red' },
      onMouseEnterBar: () => 'onMouseEnterBar',
      onMouseMoveBar: () => 'onMouseMoveBar',
      onMouseLeaveBar: () => 'onMouseLeaveBar',
    };

    const histogram = mount(<Histogram {...props} />);
    const group = histogram.find('g');
    const bars = group.find('rect');

    // histogram creates 4 bars
    expect(bars).to.have.length(4);
  });
});
