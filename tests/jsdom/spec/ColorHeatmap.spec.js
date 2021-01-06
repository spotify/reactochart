import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { ColorHeatmap, RangeRect } from '../../../src/index.js';
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
    expect(rangeRects).to.have.length(props.data.length);
  });

  it('passes props correctly', () => {
    const chart = mount(<ColorHeatmap {...props} />);

    expect(
      chart
        .find(RangeRect)
        .first()
        .props().x,
    ).to.equal(getValue(props.x, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().xEnd,
    ).to.equal(getValue(props.xEnd, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().y,
    ).to.equal(getValue(props.y, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().yEnd,
    ).to.equal(getValue(props.yEnd, props.data[0]));
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().xScale,
    ).to.equal(props.xScale);
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().yScale,
    ).to.equal(props.yScale);
    expect(
      chart
        .find(RangeRect)
        .first()
        .props().className,
    ).to.equal(props.rectClassName);

    describe('when colorScale prop is passed', () => {
      it('sets the color scale to the prop value', () => {
        const propsWithColorScale = { ...props, colorScale: () => 'rgb' };
        const updatedChart = mount(<ColorHeatmap {...propsWithColorScale} />);

        expect(
          updatedChart
            .find(RangeRect)
            .first()
            .props().style,
        ).to.contain({ fill: 'rgb' });
      });
    });
  });
});
