import _ from 'lodash';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import React from 'react';
import { shallow } from 'enzyme';

import { YTicks } from '../../../src';

function expectTicksToExist(wrapper) {
  const ticksGroup = wrapper.find('g.rct-chart-ticks-y');
  expect(ticksGroup).toHaveLength(1);
  expect(ticksGroup).toContainMatchingElement('line.rct-chart-tick-y');
  return wrapper;
}

function expectCorrectTickPlacement(wrapper, ticks, scale) {
  const tickLines = wrapper.find('line.rct-chart-tick-y');
  expect(tickLines).toHaveLength(ticks.length);
  tickLines.forEach((line, i) => {
    expect(Math.round(+line.prop('y1'))).toEqual(Math.round(scale(ticks[i])));
  });
  return wrapper;
}

function getLineWidth(line) {
  const y1 = +line.prop('x1') || 0;
  const y2 = +line.prop('x2');
  return Math.abs(y2 - y1);
}

describe('YTicks', () => {
  const linearScale = scaleLinear()
    .domain([-5, 5])
    .range([0, 500]);
  const timeScale = scaleTime()
    .domain([new Date(2009, 0, 1), new Date(2010, 0, 1)])
    .range([0, 500]);
  const ordinalScale = scalePoint()
    .domain(['a', 'b', 'c', 'd'])
    .range([0, 300]);

  it('renders a .rct-chart-ticks-y element with tick lines', () => {
    expectTicksToExist(shallow(<YTicks yScale={linearScale} />));
    expectTicksToExist(shallow(<YTicks yScale={ordinalScale} />));
    expectTicksToExist(shallow(<YTicks yScale={timeScale} />));
  });

  it('uses `tickCount` to determine approx. # of ticks to display on number/time scales', () => {
    let wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickCount={11} />),
    );
    expect(wrapper.find('line.rct-chart-tick-y')).toHaveLength(11);
    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickCount={3} />),
    );
    expect(wrapper.find('line.rct-chart-tick-y')).toHaveLength(3);

    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={timeScale} tickCount={13} />),
    );
    expect(wrapper.find('line.rct-chart-tick-y')).toHaveLength(13);
    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={timeScale} tickCount={5} />),
    );
    expect(wrapper.find('line.rct-chart-tick-y')).toHaveLength(5);
  });

  it('uses `ticks` to determine which ticks to show', () => {
    const linearTicks = [-3, 2, 4];
    let wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} ticks={linearTicks} />),
    );
    expectCorrectTickPlacement(wrapper, linearTicks, linearScale);

    const timeTicks = [new Date(2009, 4, 10), new Date(2010, 5, 13)];
    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={timeScale} ticks={timeTicks} />),
    );
    expectCorrectTickPlacement(wrapper, timeTicks, timeScale);

    const ordinalTicks = ['b', 'd'];
    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={ordinalScale} ticks={ordinalTicks} />),
    );
    expectCorrectTickPlacement(wrapper, ordinalTicks, ordinalScale);
  });

  it('uses `tickLength` to determine tick length', () => {
    let wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickLength={5} />),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(getLineWidth(line)).toEqual(5));

    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickLength={13} />),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(getLineWidth(line)).toEqual(13));
  });

  it('uses `right` to draw the ticks right of rectangle', () => {
    const width = 400;
    let wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} width={width} />),
    );
    expect(wrapper.find('g.rct-chart-ticks-y')).toHaveProp(
      'transform',
      `translate(0, 0)`,
    );

    wrapper = expectTicksToExist(
      shallow(<YTicks position="right" yScale={linearScale} width={width} />),
    );
    expect(wrapper.find('g.rct-chart-ticks-y')).toHaveProp(
      'transform',
      `translate(${width}, 0)`,
    );
  });

  it('draws the ticks above/below line if `placement` is passed', () => {
    let wrapper = expectTicksToExist(shallow(<YTicks yScale={linearScale} />));
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(line.prop('x2')).toBeLessThan(0));
    wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} placement="before" />),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(line.prop('x2')).toBeLessThan(0));

    wrapper = expectTicksToExist(
      shallow(<YTicks position="right" yScale={linearScale} />),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(line.prop('x2')).toBeGreaterThan(0));
    wrapper = expectTicksToExist(
      shallow(
        <YTicks position="right" yScale={linearScale} placement="after" />,
      ),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(line.prop('x2')).toBeGreaterThan(0));
  });

  it('passes className to the ticks', () => {
    const wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickClassName="test-tick-class" />),
    );
    expect(wrapper).toContainMatchingElement('line.test-tick-class');
  });

  it('passes style to the ticks', () => {
    const style = { fill: 'red' };
    const wrapper = expectTicksToExist(
      shallow(<YTicks yScale={linearScale} tickStyle={style} />),
    );
    wrapper
      .find('line.rct-chart-tick-y')
      .forEach(line => expect(line.prop('style')).toEqual(style));
  });

  it('has a static getMargin method which returns the required outer margin space', () => {
    const zeroMargins = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    let margin = YTicks.getMargin({
      tickLength: 10,
      position: 'left',
      placement: 'before',
    });
    expect(margin).toEqual(_.defaults({ marginLeft: 10 }, zeroMargins));
    margin = YTicks.getMargin({
      tickLength: 10,
      position: 'left',
      placement: 'after',
    });
    expect(margin).toEqual(zeroMargins);

    margin = YTicks.getMargin({
      tickLength: 10,
      position: 'right',
      placement: 'before',
    });
    expect(margin).toEqual(zeroMargins);
    margin = YTicks.getMargin({
      tickLength: 10,
      position: 'right',
      placement: 'after',
    });
    expect(margin).toEqual(_.defaults({ marginRight: 10 }, zeroMargins));
  });
});
