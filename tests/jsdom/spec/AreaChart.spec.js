import React from 'react';
import { scaleLinear } from 'd3-scale';
import { mount } from 'enzyme';
import _ from 'lodash';
import { AreaChart } from '../../../src';

import { combineDatasets } from '../../../src/utils/Data.js';

function randomWalk(length = 100, start = 0, variance = 10) {
  return _.reduce(
    _.range(length - 1),
    sequence => {
      return sequence.concat(_.last(sequence) + _.random(-variance, variance));
    },
    [start],
  );
}

function randomWalkTimeSeries(
  length = 100,
  start = 0,
  variance = 10,
  startDate = new Date(2015, 0, 1),
) {
  let date = startDate;
  return randomWalk(length, start, variance).map(n => {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return [date, n];
  });
}

describe('AreaChart', () => {
  const areaChartProps = {
    data: _.range(41),
    x: d => d,
    y: d => Math.sin(d / 10) * 10,
    yEnd: d => Math.cos((d + 1) / 10) * 10,
    pathClassName: 'my-path',
    xScale: scaleLinear().domain([0, 41]),
    yScale: scaleLinear().domain([0, 10]),
    pathStyle: { fill: 'red' },
  };

  const data1 = randomWalkTimeSeries(115).map(([x, y]) => ({ x, y }));
  const data2 = randomWalkTimeSeries(115).map(([x, y]) => ({ x, y }));

  // we have two datasets, but AreaChart takes one combined dataset
  // so combine the two datasets into one using the combineDatasets utility function
  // (from 'reactochart/utils/Data')
  const combined = combineDatasets(
    [
      { data: data1, combineKey: 'x', dataKeys: { y: 'y0' } },
      { data: data2, combineKey: 'x', dataKeys: { y: 'y1' } },
    ],
    'x',
  );

  const differenceAreaChartProps = {
    data: combined,
    isDifference: true,
    pathStylePositive: { fill: 'blue' },
    pathStyleNegative: { fill: 'green' },
    x: d => d.x,
    y: d => d.y0,
    yEnd: d => d.y1,
  };

  it('passes props correctly to path', () => {
    let chart = mount(<AreaChart {...areaChartProps} />);
    let path = chart.find('path');

    expect(path.props().className).toContain('my-path');
    expect(path.props().style).toEqual(areaChartProps.pathStyle);

    chart = mount(
      <AreaChart {...areaChartProps} {...differenceAreaChartProps} />,
    );
    path = chart.find('path');

    path.forEach((p, index) => {
      if (index < 2) {
        expect(p.props().className).not.toContain(
          areaChartProps.pathClassName,
        );
      } else if (index === 3) {
        expect(p.props().style.fill).toEqual(
          differenceAreaChartProps.pathStyleNegative.fill,
        );
        expect(p.props().className).toContain(areaChartProps.pathClassName);
      } else {
        expect(p.props().style.fill).toEqual(
          differenceAreaChartProps.pathStylePositive.fill,
        );
        expect(p.props().className).toContain(areaChartProps.pathClassName);
      }
    });
  });

  it('renders the expected group and the expected number of paths', () => {
    let chart = mount(<AreaChart {...areaChartProps} />);
    let path = chart.find('path');
    let group = chart.find('g');

    expect(group.length).toEqual(1);
    expect(group.props().className).toEqual('rct-area-chart');
    expect(path.length).toEqual(1);

    chart = mount(
      <AreaChart {...areaChartProps} {...differenceAreaChartProps} />,
    );
    path = chart.find('path');
    group = chart.find('g');

    expect(group.length).toEqual(1);
    expect(group.props().className).toEqual('rct-area-chart--difference');
    expect(path.length).toEqual(4);
  });

  it('getDomain returns correctly', () => {
    const domainProps = {
      data: _.range(10),
      x: x => x,
      y: () => 0,
      yEnd: d => d + 2,
    };
    const domain = { yDomain: [0, 11] };

    expect(AreaChart.getDomain(domainProps)).toEqual(domain);
  });
});
