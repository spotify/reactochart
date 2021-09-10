import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import { mount } from 'enzyme';

import { MarkerLineChart } from '../../../src';

describe('MarkerLineChart', () => {
  const props = {
    xScale: scaleLinear().domain([0, 30]),
    yScale: scaleLinear().domain([0, 1]),
    data: _.range(30),
    x: d => d,
    y: d => d + 5,
    lineClassName: 'my-line',
    lineStyle: { fill: 'blue' },
    onMouseEnterLine: jest.fn(),
    onMouseMoveLine: jest.fn(),
    onMouseLeaveLine: jest.fn(),
  };

  it('passes props correctly to line elements', () => {
    let chart = mount(<MarkerLineChart {...props} />);
    let lines = chart.find('line');

    lines.forEach(line => {
      expect(line.props().className).toContain(props.lineClassName);
      expect(line.props().style).toEqual(props.lineStyle);
    });

    // test with xEnd and yEnd
    chart = mount(<MarkerLineChart {...props} xEnd={d => d + 10} />);
    lines = chart.find('line');

    lines.forEach(line => {
      expect(line.props().className).toContain(props.lineClassName);
      expect(line.props().style).toEqual(props.lineStyle);
    });

    // test with xEnd and yEnd
    chart = mount(<MarkerLineChart {...props} horizontal yEnd={d => d + 10} />);
    lines = chart.find('line');

    lines.forEach(line => {
      expect(line.props().className).toContain(props.lineClassName);
      expect(line.props().style).toEqual(props.lineStyle);
    });
  });

  it('renders the correct amount of group and line elements and has proper width/height', () => {
    let chart = mount(<MarkerLineChart {...props} />);
    let lines = chart.find('line');
    const group = chart.find('g');

    expect(group).toHaveLength(1);
    expect(lines).toHaveLength(props.data.length);
    lines.forEach(line => {
      expect(Math.abs(line.props().x2 - line.props().x1)).toEqual(10);
    });

    // test with xEnd and yEnd
    const xEnd = d => d + 10;
    chart = mount(<MarkerLineChart {...props} xEnd={xEnd} />);
    lines = chart.find('line');

    lines.forEach((line, idx) => {
      const d = props.data[idx];
      const difference = Math.abs(
        props.xScale(props.x(d)) - props.xScale(xEnd(d)),
      );

      expect(Math.abs(line.props().x2 - line.props().x1)).toEqual(difference);
    });

    const yEnd = d => d + 10;
    chart = mount(<MarkerLineChart {...props} horizontal yEnd={yEnd} />);
    lines = chart.find('line');

    lines.forEach((line, idx) => {
      const d = props.data[idx];
      const difference = Math.abs(
        props.yScale(props.y(d)) - props.yScale(yEnd(d)),
      );

      expect(Math.abs(line.props().y2 - line.props().y1)).toEqual(difference);
    });
  });

  it('triggers event handlers', () => {
    const chart = mount(<MarkerLineChart {...props} />);
    const line = chart.find('line').first();

    expect(props.onMouseMoveLine).not.toHaveBeenCalled();
    line.simulate('mousemove');
    expect(props.onMouseMoveLine).toHaveBeenCalled();
    expect(props.onMouseEnterLine).not.toHaveBeenCalled();
    line.simulate('mouseenter');
    expect(props.onMouseEnterLine).toHaveBeenCalled();
    expect(props.onMouseLeaveLine).not.toHaveBeenCalled();
    line.simulate('mouseleave');
    expect(props.onMouseLeaveLine).toHaveBeenCalled();
  });
});
