import React from 'react';
import { mount } from 'enzyme';

import { PieChart } from '../../../src';

describe('PieChart', () => {
  const props = {
    data: [45, 35, 20],
    radius: 100,
    holeRadius: 50,
    pieSliceClassName: 'my-pie-slice',
    centerLabel: 'Woot',
    centerLabelClassName: 'my-center-label',
    centerLabelStyle: {
      textAnchor: 'middle',
      dominantBaseline: 'center',
      fill: 'blue',
    },
    onMouseEnterSlice: jest.fn(),
    onMouseMoveSlice: jest.fn(),
    onMouseLeaveSlice: jest.fn(),
    onClick: jest.fn(),
  };

  const markerLineProps = {
    markerLineValue: 20,
    markerLineClassName: 'my-marker-line',
    markerLineStyle: {
      fill: 'blue',
    },
    onMouseEnterLine: jest.fn(),
    onMouseMoveLine: jest.fn(),
    onMouseLeaveLine: jest.fn(),
  };

  it('passes props correctly to path and text elements', () => {
    const chart = mount(<PieChart {...props} {...markerLineProps} />);
    const paths = chart.find('path');
    const text = chart.find('text');

    paths.forEach(path => {
      const className = path.props().className;
      // Check if markerline vs pie slice
      if (className.includes('rct-marker-line')) {
        expect(className).toContain(markerLineProps.markerLineClassName);
        expect(path.props().style).toEqual(markerLineProps.markerLineStyle);
      } else {
        expect(className).toContain(props.pieSliceClassName);
      }
    });

    expect(text.props().className).toContain(props.centerLabelClassName);
    expect(text.props().style).toEqual(props.centerLabelStyle);
  });

  it('correctly calculates width and height given margins', () => {
    const chart = mount(
      <PieChart
        {...props}
        radius={50}
        marginLeft={50}
        marginRight={50}
        marginTop={50}
        marginBottom={50}
      />,
    );
    const svg = chart.find('svg');

    expect(svg.props().width).toEqual(200);
    expect(svg.props().height).toEqual(200);
  });

  it('renders correct amount of pie slices, markerlines, text elements', () => {
    let chart = mount(<PieChart {...props} />);
    let paths = chart.find('path');
    const text = chart.find('text');

    expect(paths).toHaveLength(3);

    expect(text).toHaveLength(1);

    chart = mount(<PieChart {...props} {...markerLineProps} />);
    paths = chart.find('path');

    expect(paths).toHaveLength(4);
  });

  it('triggers event handlers', () => {
    const chart = mount(<PieChart {...props} {...markerLineProps} />);
    const paths = chart.find('path');
    const pieSlice = paths.first();
    const markerLine = paths.last();

    // test pie slice
    expect(props.onMouseMoveSlice).not.toHaveBeenCalled();
    pieSlice.simulate('mousemove');
    expect(props.onMouseMoveSlice).toHaveBeenCalled();
    expect(props.onMouseEnterSlice).not.toHaveBeenCalled();
    pieSlice.simulate('mouseenter');
    expect(props.onMouseEnterSlice).toHaveBeenCalled();
    expect(props.onMouseLeaveSlice).not.toHaveBeenCalled();
    pieSlice.simulate('mouseleave');
    expect(props.onMouseLeaveSlice).toHaveBeenCalled();
    expect(props.onClick).not.toHaveBeenCalled();
    pieSlice.simulate('click');
    expect(props.onClick).toHaveBeenCalled();

    // test markerline
    expect(markerLineProps.onMouseMoveLine).not.toHaveBeenCalled();
    markerLine.simulate('mousemove');
    expect(markerLineProps.onMouseMoveLine).toHaveBeenCalled();
    expect(markerLineProps.onMouseEnterLine).not.toHaveBeenCalled();
    markerLine.simulate('mouseenter');
    expect(markerLineProps.onMouseEnterLine).toHaveBeenCalled();
    expect(markerLineProps.onMouseLeaveLine).not.toHaveBeenCalled();
    markerLine.simulate('mouseleave');
    expect(markerLineProps.onMouseLeaveLine).toHaveBeenCalled();
  });

  it('renders slices labels with custom styles and distances', () => {
    const sliceStyle = { color: 'red' };
    const chart = mount(
      <PieChart
        {...props}
        getPieSliceLabel={value => `${value}%`}
        pieSliceLabelDistance={20}
        pieSliceLabelStyle={sliceStyle}
      />,
    );

    props.data.forEach(value => {
      const textNode = chart.find(`text[children="${value}%"]`);
      expect(textNode.exists()).toBe(true);
      expect(textNode.prop('style')).toHaveProperty('color', sliceStyle.color);
    });
  });

  it('calls factory props to compute slice label distances and styles', () => {
    const chart = mount(
      <PieChart
        {...props}
        getPieSliceLabel={value => `${value}%`}
        pieSliceLabelDistance={value => value}
        pieSliceLabelStyle={value => ({ fontSize: value })}
      />,
    );

    props.data.forEach(value => {
      const textNode = chart.find(`text[children="${value}%"]`);
      expect(textNode.exists()).toBe(true);
      expect(textNode.prop('style')).toHaveProperty('fontSize', value);
    });
  });
});
