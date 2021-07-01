import React from 'react';
import { scaleLinear } from 'd3-scale';
import { mount } from 'enzyme';
import { ScatterPlot } from '../../../src';

describe('ScatterPlot', () => {
  const props = {
    data: [[0, 0], [2, 1], [5, 1], [3, 5], [4, 2], [5, 5], [1, 4]],
    x: d => d[0],
    y: d => d[1],
    pointClassName: 'my-point',
    pointStyle: { fill: 'blue' },
    xScale: scaleLinear().domain([0, 5]),
    yScale: scaleLinear().domain([0, 5]),
    onMouseEnterPoint: jest.fn(),
    onMouseMovePoint: jest.fn(),
    onMouseLeavePoint: jest.fn(),
    pointOffset: [2, 2],
  };

  it('passes props correctly to points', () => {
    let chart = mount(<ScatterPlot {...props} />);
    let points = chart.find('circle');

    points.forEach(point => {
      expect(point.props().className).toContain(props.pointClassName);
      expect(point.props().style).toEqual(props.pointStyle);
    });

    chart = mount(<ScatterPlot {...props} pointSymbol={() => 'a'} />);
    points = chart.find('text');

    points.forEach(point => {
      expect(point.props().className).toContain(props.pointClassName);
      expect(point.props().style).toEqual({
        textAnchor: 'middle',
        dominantBaseline: 'central',
        ...props.pointStyle,
      });
    });
  });

  it('renders correct amount of points in correct area', () => {
    const chart = mount(<ScatterPlot {...props} />);
    const points = chart.find('circle');

    expect(points).toHaveLength(props.data.length);

    points.forEach((point, idx) => {
      const { xScale, yScale, data, x, y, pointOffset } = props;
      const xPos = xScale(x(data[idx])) + pointOffset[0];
      const yPos = yScale(y(data[idx])) + pointOffset[1];

      expect(point.props().cx).toEqual(xPos);
      expect(point.props().cy).toEqual(yPos);
    });
  });

  it('triggers event handlers', () => {
    const chart = mount(<ScatterPlot {...props} />);
    const points = chart.find('circle');

    expect(props.onMouseMovePoint).not.toHaveBeenCalled();
    points.at(1).simulate('mousemove');
    expect(props.onMouseMovePoint).toHaveBeenCalled();
    expect(props.onMouseEnterPoint).not.toHaveBeenCalled();
    points.at(1).simulate('mouseenter');
    expect(props.onMouseEnterPoint).toHaveBeenCalled();
    expect(props.onMouseLeavePoint).not.toHaveBeenCalled();
    points.at(1).simulate('mouseleave');
    expect(props.onMouseLeavePoint).toHaveBeenCalled();
  });
});
