import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import { mount } from 'enzyme';

import { ColorHeatmap, RangeRect } from '../../../src';
import { getValue } from '../../../src/utils/Data.js';

describe('ColorHeatmap', () => {
  const gridData = _.range(30).map(m => {
    return _.range(30).map(n => {
      return {
        x: n,
        xEnd: n + 1,
        y: m,
        yEnd: m + 1,
        value: Math.sin(m * n * 0.01),
      };
    });
  });
  const data = _.flatten(gridData);
  const props = {
    data,
    value: d => d.value,
    x: d => d.x,
    xEnd: d => d.xEnd,
    y: d => d.y,
    yEnd: d => d.yEnd,
    xScale: scaleLinear()
      .domain([-1, 0, 1])
      .range([0, 30]),
    yScale: scaleLinear()
      .domain([0, 10])
      .range([0, 30]),
    colors: ['rebeccapurple', 'goldenrod'],
    interpolator: 'lab',
    rectClassName: 'rect-class',
  };

  it('renders a color heatmap', () => {
    const chart = mount(<ColorHeatmap {...props} />);
    const rangeRects = chart.find(RangeRect);
    expect(rangeRects).toHaveLength(props.data.length);
  });

  it('passes props correctly', () => {
    const chart = mount(<ColorHeatmap {...props} />);

    expect(
      chart
        .find(RangeRect)
        .first()
        .props().x,
    ).toEqual(getValue(props.x, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().xEnd,
    ).toEqual(getValue(props.xEnd, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().y,
    ).toEqual(getValue(props.y, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().yEnd,
    ).toEqual(getValue(props.yEnd, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().xScale,
    ).toEqual(props.xScale);
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().yScale,
    ).toEqual(props.yScale);
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().className,
    ).toEqual(props.rectClassName);
  });

  it('sets the color scale to the prop value when colorScale prop is passed', () => {
    const propsWithColorScale = { ...props, colorScale: () => 'rgb' };
    const updatedChart = mount(<ColorHeatmap {...propsWithColorScale} />);

    expect(
        updatedChart
            .find(RangeRect)
            .first()
            .props().style,
    ).toHaveProperty('fill', 'rgb');
  });
});
