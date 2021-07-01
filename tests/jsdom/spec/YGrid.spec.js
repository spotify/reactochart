import React from 'react';
import { scaleLinear } from 'd3-scale';
import { mount } from 'enzyme';

import { YGrid, YLine } from '../../../src/index.js';
import { getScaleTicks, getTickDomain } from '../../../src/utils/Scale';

describe('YGrid', () => {
  const props = {
    width: 10,
    spacingTop: 10,
    spacingBottom: 10,
    spacingLeft: 10,
    spacingRight: 10,
    lineClassName: 'ygrid-line-class',
    lineStyle: { stroke: 'blue' },
    yScale: scaleLinear().domain([0, 100]),
  };

  it('passes props correctly to YLine', () => {
    const yGrid = mount(<YGrid {...props} />);
    const yLines = yGrid.find(YLine);

    yLines.forEach(yLine => {
      const yLineProps = yLine.props();

      expect(yLineProps.className).toContain(props.lineClassName);
      expect(yLineProps.style).toEqual(props.lineStyle);
      expect(yLineProps.spacingTop).toEqual(props.spacingTop);
      expect(yLineProps.spacingBottom).toEqual(props.spacingBottom);
      expect(yLineProps.spacingLeft).toEqual(props.spacingLeft);
      expect(yLineProps.spacingRight).toEqual(props.spacingRight);
      expect(yLineProps.yScale).toEqual(props.yScale);
      expect(yLineProps.width).toEqual(props.width);
    });
  });

  it('renders the correct amount of YLines given tickCount', () => {
    const tickCount = 50;
    const yGrid = mount(<YGrid {...props} tickCount={tickCount} />);
    const group = yGrid.find('g');

    expect(group).toHaveLength(1);
    expect(group.getDOMNode().className).toEqual('rct-chart-grid-y');

    const yLines = yGrid.find(YLine);
    const numTicksMade = getScaleTicks(props.yScale, null, tickCount);

    expect(yLines).toHaveLength(numTicksMade.length);
  });

  it('renders the correct amount of YLines given ticks', () => {
    const ticks = [0, 25, 50, 100];
    const yGrid = mount(<YGrid {...props} ticks={ticks} />);
    const group = yGrid.find('g');

    expect(group).toHaveLength(1);
    expect(group.getDOMNode().className).toEqual('rct-chart-grid-y');

    const yLines = yGrid.find(YLine);
    expect(yLines).toHaveLength(ticks.length);
  });

  it('getTickDomain works as expected', () => {
    const ticks = [0, 25, 50, 100];

    const result = getTickDomain(props.yScale, { ...props, ticks });

    expect(YGrid.getTickDomain({ ...props, ticks })).toEqual({
      yTickDomain: result,
    });
  });
});
