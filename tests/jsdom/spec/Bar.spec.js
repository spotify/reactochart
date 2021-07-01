import React from 'react';
import { scalePoint, scaleLinear } from 'd3-scale';
import { mount, shallow } from 'enzyme';

import { Bar } from '../../../src';

describe('Bar', () => {
  let horizontalBarProps;
  let verticalBarProps;

  beforeEach(() => {
    verticalBarProps = {
      xScale: scalePoint()
        .domain(['a', 'b', 'c'])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      x: 'a',
      y: 0,
      yEnd: 1,
      thickness: 10,
    };

    horizontalBarProps = {
      xScale: scaleLinear()
        .domain([0, 1])
        .range([0, 100]),
      yScale: scalePoint()
        .domain(['a', 'b', 'c'])
        .range([100, 0]),
      x: 0.2,
      xEnd: 0.9,
      y: 'c',
      thickness: 12,
    };
  });

  it('renders a basic vertical bar correctly', () => {
    const bar = shallow(
      <Bar
        xScale={scalePoint()
          .domain(['a', 'b', 'c'])
          .range([0, 100])}
        yScale={scaleLinear()
          .domain([0, 1])
          .range([100, 0])}
        x="b"
        y={0.25}
        yEnd={0.75}
        thickness={20}
      />,
    );

    const rect = bar.find('rect');
    expect(rect).toHaveLength(1);

    const rectProps = rect.props();
    expect(rectProps.className).toContain('rct-chart-bar');
    expect(rectProps.className).toContain('rct-chart-bar-vertical');
    expect(rectProps.x).toEqual(50 - 20 / 2);
    expect(rectProps.y).toEqual(25);
    expect(rectProps.height).toEqual(50);
    expect(rectProps.width).toEqual(20);
  });

  it('renders a basic horizontal bar correctly', () => {
    const bar = shallow(
      <Bar
        xScale={scaleLinear()
          .domain([0, 1])
          .range([0, 100])}
        yScale={scalePoint()
          .domain(['a', 'b', 'c'])
          .range([100, 0])}
        x={0.1}
        xEnd={0.7}
        y="b"
        thickness={20}
      />,
    );

    const rect = bar.find('rect');
    expect(rect).toHaveLength(1);

    const rectProps = rect.props();
    expect(rectProps.className).toContain('rct-chart-bar');
    expect(rectProps.className).toContain('rct-chart-bar-horizontal');
    expect(rectProps.x).toEqual(10);
    expect(rectProps.y).toEqual(50 - 20 / 2);
    expect(rectProps.height).toEqual(20);
    expect(rectProps.width).toEqual(60);
  });

  it('has a thickness prop which controls the thickness of the bar', () => {
    // verticalBar
    const verticalBar = shallow(<Bar {...verticalBarProps} />);
    expect(verticalBar.find('rect')).toHaveLength(1);
    expect(verticalBar.find('rect').props().width).toEqual(10);

    const thickVerticalBar = shallow(
      <Bar {...verticalBarProps} thickness={40} />,
    );
    expect(thickVerticalBar.find('rect')).toHaveLength(1);
    expect(thickVerticalBar.find('rect').props().width).toEqual(40);

    // horizontalBar
    const horizontalBar = shallow(<Bar {...horizontalBarProps} />);
    expect(horizontalBar.find('rect')).toHaveLength(1);
    expect(horizontalBar.find('rect').props().height).toEqual(12);

    const thickHorizontalBar = shallow(
      <Bar {...horizontalBarProps} thickness={56} />,
    );
    expect(thickHorizontalBar.find('rect')).toHaveLength(1);
    expect(thickHorizontalBar.find('rect').props().height).toEqual(56);
  });

  it("passes className and style props through to the bar's rectangle element", () => {
    const barProps = {
      className: 'foo-bar-test-class',
      style: { fill: 'thistle' },
    };

    const verticalBar = shallow(<Bar {...verticalBarProps} {...barProps} />);
    const rect = verticalBar.find('rect');
    expect(rect).toHaveLength(1);
    expect(rect.props().className).toContain('foo-bar-test-class');
    expect(rect.props().style).toEqual(barProps.style);
  });

  it("attaches onMouseMove, onMouseEnter and onMouseLeave handlers to the bar's rectangle", () => {
    const barProps = {
      onMouseMove: jest.fn(),
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn(),
      onClick: jest.fn(),
    };

    const bar = mount(<Bar {...verticalBarProps} {...barProps} />);
    const rect = bar.find('rect');

    expect(barProps.onMouseEnter).not.toHaveBeenCalled();
    rect.simulate('mouseenter');
    expect(barProps.onMouseEnter).toHaveBeenCalledTimes(1);

    expect(barProps.onMouseMove).not.toHaveBeenCalled();
    rect.simulate('mousemove');
    expect(barProps.onMouseMove).toHaveBeenCalledTimes(1);

    expect(barProps.onMouseLeave).not.toHaveBeenCalled();
    rect.simulate('mouseleave');
    expect(barProps.onMouseLeave).toHaveBeenCalledTimes(1);

    expect(barProps.onClick).not.toHaveBeenCalled();
    rect.simulate('click');
    expect(barProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('throws an error if x/y scale(s) are missing or invalid', () => {
    const barProps = { x: 'a', y: 0, yEnd: 1 };
    const xScale = scalePoint()
      .domain(['a', 'b', 'c'])
      .range([0, 100]);
    const yScale = scaleLinear()
      .domain([0, 1])
      .range([100, 0]);

    // throw if no scale prop passed
    expect(() => {
      shallow(<Bar {...barProps} />);
    }).toThrowError();
    // throw if one scale is missing
    expect(() => {
      shallow(<Bar {...{ ...barProps, xScale }} />);
    }).toThrowError();
    // don't throw if both are provided
    expect(() => {
      shallow(<Bar {...{ ...barProps, xScale, yScale }} />);
    }).not.toThrowError();
  });

  it('throws an error if exactly ONE of xEnd OR yEnd are not provided', () => {
    const barProps = {
      xScale: scalePoint()
        .domain(['a', 'b', 'c'])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      x: 'a',
      y: 0,
    };

    // throw if neither xEnd or yEnd passed
    expect(() => {
      shallow(<Bar {...barProps} />);
    }).toThrowError();
    // throw if both xEnd and yEnd passed
    expect(() => {
      shallow(<Bar {...{ ...barProps, xEnd: 'b', yEnd: 1 }} />);
    }).toThrowError();
    // OK if one or other is passed
    expect(() => {
      shallow(<Bar {...{ ...barProps, xEnd: 'b' }} />);
    }).not.toThrowError();
    expect(() => {
      shallow(<Bar {...{ ...barProps, yEnd: 1 }} />);
    }).not.toThrowError();
  });

  it('displays the x values when showLabel is true', () => {
    const horizontalBarWithText = {
      ...horizontalBarProps,
      showLabel: true,
    };

    const horizontalBar = shallow(<Bar {...horizontalBarWithText} />);
    expect(horizontalBar.find('rect')).toHaveLength(1);
    expect(horizontalBar.find('rect').props().height).toEqual(12);
    expect(horizontalBar.find('text')).toHaveLength(1);

    const verticalBarWithText = {
      ...verticalBarProps,
      showLabel: true,
    };

    const verticalBar = shallow(<Bar {...verticalBarWithText} />);
    expect(verticalBar.find('rect')).toHaveLength(1);
    expect(verticalBar.find('rect').props().width).toEqual(10);
    expect(horizontalBar.find('text')).toHaveLength(1);
  });

  it("passes labelClassName through to the bar's text element", () => {
    const verticalProps = {
      ...verticalBarProps,
      labelClassName: 'foo-bar-test-class',
      showLabel: true,
    };

    const verticalBar = shallow(<Bar {...verticalProps} />);
    const text = verticalBar.find('text');
    expect(text).toHaveLength(1);
    expect(text.props().className).toContain('foo-bar-test-class');
  });

  it("passes labelFormat through to the bar's text value", () => {
    const verticalProps = {
      ...verticalBarProps,
      showLabel: true,
      labelFormat: d => `${d}%`,
    };

    const verticalBar = shallow(<Bar {...verticalProps} />);
    const text = verticalBar.find('text');
    expect(text).toHaveLength(1);
    expect(text.props().children).toEqual('1%');
  });
});
