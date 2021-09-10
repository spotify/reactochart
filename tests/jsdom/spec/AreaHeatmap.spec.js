import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import { mount } from 'enzyme';

import { AreaHeatmap } from '../../../src';

describe('AreaHeatmap', () => {
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
    area: d => d.value,
    x: d => d.x,
    xEnd: d => d.xEnd,
    y: d => d.y,
    yEnd: d => d.yEnd,
    rectClassName: 'rect-class',
    xScale: scaleLinear()
      .domain([-1, 0, 1])
      .range([0, 30]),
    yScale: scaleLinear()
      .domain([0, 10])
      .range([0, 30]),
    onMouseMove: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
    rectStyle: { fill: 'rebeccapurple' },
  };

  it('renders a color heatmap', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    const group = chart.find('g.rct-area-heatmap-chart');
    expect(group).toHaveLength(1);
    expect(group.find('rect').length).toBeGreaterThan(1);
  });

  it('passes props correctly', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    const lastRect = chart.find('rect').last();

    expect(typeof chart.props().onMouseMove).toBe('function');
    expect(typeof chart.props().onMouseEnter).toBe('function');
    expect(typeof chart.props().onMouseLeave).toBe('function');

    expect(typeof lastRect.props().x).toBe('number');
    expect(typeof lastRect.props().y).toBe('number');
    expect(typeof lastRect.props().width).toBe('number');
    expect(typeof lastRect.props().height).toBe('number');
    expect(lastRect.props().className).toContain(props.rectClassName);
    expect(lastRect.props().style).toEqual(props.rectStyle);
  });

  it('triggers event handlers', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    expect(chart.props().onMouseMove).not.toHaveBeenCalled();
    chart.simulate('mousemove');
    expect(chart.props().onMouseMove).toHaveBeenCalled();
    expect(chart.props().onMouseEnter).not.toHaveBeenCalled();
    chart.simulate('mouseenter');
    expect(chart.props().onMouseEnter).toHaveBeenCalled();
    expect(chart.props().onMouseLeave).not.toHaveBeenCalled();
    chart.simulate('mouseleave');
    expect(chart.props().onMouseLeave).toHaveBeenCalled();
  });
});
