import React from 'react';
import { mount } from 'enzyme';

import { XYPlot, Bar } from '../../../src';

describe('XYPlot', () => {
  const commonXYProps = {
    xDomain: [0, 10],
    yDomain: [0, 100],
    xyPlotClassName: 'xy-plot',
    xyPlotStyle: { fill: 'blue' },
    xyPlotContainerStyle: { opacity: '0.5' },
  };

  it('renders SVG with given width, height, style and className (or a default)', () => {
    const chart = mount(<XYPlot width={600} height={800} {...commonXYProps} />);
    const svg = chart.find('svg');
    const plot = chart.find('.rct-plot-background');

    // svg className returns SvgAnimatedString, so access baseVal to get string
    // for chai contains to test against
    expect(svg.getDOMNode().className.baseVal).toContain(
      commonXYProps.xyPlotClassName,
    );

    expect(svg.getDOMNode().style._values).toEqual(
      commonXYProps.xyPlotContainerStyle,
    );
    expect(plot.getDOMNode().style._values).toEqual(commonXYProps.xyPlotStyle);

    const node = svg.instance();
    expect(node.tagName.toLowerCase()).toEqual('svg');
    expect(node.getAttribute('width')).toEqual('600');
    expect(node.getAttribute('height')).toEqual('800');

    const chart2 = mount(<XYPlot {...commonXYProps} />);
    const node2 = chart2.find('svg').instance();
    expect(node2.tagName.toLowerCase()).toEqual('svg');
    expect(parseInt(node2.getAttribute('width'), 10)).not.toBeNaN();
    expect(parseInt(node2.getAttribute('width'), 10)).toBeGreaterThan(10);
    expect(parseInt(node2.getAttribute('height'), 10)).not.toBeNaN();
    expect(parseInt(node2.getAttribute('height'), 10)).toBeGreaterThan(10);
  });

  it('renders inner chart area with given margin', () => {
    const size = 400;
    const margin = {
      marginTop: 10,
      marginBottom: 20,
      marginLeft: 30,
      marginRight: 40,
    };
    const chart = mount(
      <XYPlot width={size} height={size} {...margin} {...commonXYProps} />,
    );
    const inner = chart.find('.rct-chart-inner').instance();
    const bg = chart.find('.rct-plot-background').instance();
    expect(inner.getAttribute('transform').replace(/\s/, '')).toContain(
      `translate(${margin.marginLeft},${margin.marginTop})`,
    );
    expect(parseInt(bg.getAttribute('width'), 10)).toEqual(
      size - (margin.marginLeft + margin.marginRight),
    );
    expect(parseInt(bg.getAttribute('height'), 10)).toEqual(
      size - (margin.marginTop + margin.marginBottom),
    );
  });

  it('renders children with correct props', () => {
    const barProps = {
      x: 0,
      y: 0,
      yEnd: 30,
      style: { fill: 'red' },
      onMouseMove: jest.fn(),
    };
    const chart = mount(
      <XYPlot
        width={600}
        height={800}
        {...commonXYProps}
        onMouseMove={jest.fn()}
      >
        <Bar {...barProps} />
      </XYPlot>,
    );

    const bar = chart.find(Bar);

    // Make sure props passed into bar are correctly passed down by XYPlot and not overriden
    Object.keys(barProps).forEach(k => {
      expect(bar.props()[k]).toEqual(barProps[k]);
    });

    // Make sure click handlers passed into bar are correctly triggered
    expect(chart.props().onMouseMove).not.toHaveBeenCalled();
    expect(bar.props().onMouseMove).not.toHaveBeenCalled();
    bar.simulate('mousemove');
    expect(chart.props().onMouseMove).toHaveBeenCalled();
    expect(bar.props().onMouseMove).toHaveBeenCalled();
  });

  it('triggers event handlers', () => {
    const mouseHandlers = {
      onMouseMove: jest.fn(),
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn(),
      onMouseDown: jest.fn(),
      onMouseUp: jest.fn(),
      onClick: jest.fn(),
    };
    const chart = mount(<XYPlot {...commonXYProps} {...mouseHandlers} />);
    const chartProps = chart.props();
    const expectedKeys = [
      'event',
      'outerX',
      'outerY',
      'innerX',
      'innerY',
      'xValue',
      'yValue',
      'xScale',
      'yScale',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
    ];

    Object.keys(mouseHandlers).forEach(handler => {
      const handlerSimulateEventName = handler.substring(2).toLowerCase();

      expect(chartProps[handler]).not.toHaveBeenCalled();
      chart.simulate(handlerSimulateEventName);
      expect(chartProps[handler]).toHaveBeenCalled();
      expect(Object.keys(chartProps[handler].mock.calls[0][0])).toEqual(expectedKeys);
    });
  });
});
