import React from 'react';
import { scaleLinear } from 'd3-scale';
import { mount } from 'enzyme';

import { XGrid, XLine } from '../../../src';
import { getScaleTicks, getTickDomain } from '../../../src/utils/Scale';

describe('XGrid', () => {
  const props = {
    height: 10,
    spacingTop: 10,
    spacingBottom: 10,
    spacingLeft: 10,
    spacingRight: 10,
    lineClassName: 'xgrid-line-class',
    lineStyle: { stroke: 'blue' },
    xScale: scaleLinear().domain([0, 100]),
  };

  it('passes props correctly to XLine', () => {
    const xGrid = mount(<XGrid {...props} />);
    const xLines = xGrid.find(XLine);
    const group = xGrid.find('g');

    expect(group).toHaveLength(1);
    expect(group.getDOMNode().className).toEqual('rct-chart-grid-x');

    xLines.forEach(xLine => {
      const xLineProps = xLine.props();

      expect(xLineProps.className).toContain(props.lineClassName);
      expect(xLineProps.style).toEqual(props.lineStyle);
      expect(xLineProps.spacingTop).toEqual(props.spacingTop);
      expect(xLineProps.spacingBottom).toEqual(props.spacingBottom);
      expect(xLineProps.spacingLeft).toEqual(props.spacingLeft);
      expect(xLineProps.spacingRight).toEqual(props.spacingRight);
      expect(xLineProps.xScale).toEqual(props.xScale);
      expect(xLineProps.height).toEqual(props.height);
    });
  });

  it('renders the correct amount of XLines given tickCount', () => {
    const tickCount = 50;
    const xGrid = mount(<XGrid {...props} tickCount={tickCount} />);
    const group = xGrid.find('g');

    expect(group).toHaveLength(1);
    expect(group.getDOMNode().className).toEqual('rct-chart-grid-x');

    const xLines = xGrid.find(XLine);
    const numTicksMade = getScaleTicks(props.xScale, null, tickCount);

    expect(xLines).toHaveLength(numTicksMade.length);
  });

  it('renders the correct amount of XLines given ticks', () => {
    const ticks = [0, 25, 50, 100];
    const xGrid = mount(<XGrid {...props} ticks={ticks} />);
    const group = xGrid.find('g');

    expect(group).toHaveLength(1);
    expect(group.getDOMNode().className).toEqual('rct-chart-grid-x');

    const xLines = xGrid.find(XLine);
    expect(xLines).toHaveLength(ticks.length);
  });

  it('getTickDomain works as expected', () => {
    const ticks = [0, 25, 50, 100];

    const result = getTickDomain(props.xScale, { ...props, ticks });

    expect(XGrid.getTickDomain({ ...props, ticks })).toEqual({
      xTickDomain: result,
    });
  });
});
