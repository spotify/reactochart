import _ from 'lodash';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import React from 'react';
import { shallow } from 'enzyme';

import XTicks from '../../../src/XTicks';

function expectTicksToExist(wrapper) {
  const ticksGroup = wrapper.find('g.rct-chart-ticks-x');
  expect(ticksGroup).toHaveLength(1);
  expect(ticksGroup).toContainMatchingElement('line.rct-chart-tick-x');
  return wrapper;
}

function expectCorrectTickPlacement(wrapper, ticks, scale) {
  const tickLines = wrapper.find('line.rct-chart-tick-x');
  expect(tickLines).toHaveLength(ticks.length);
  tickLines.forEach((line, i) => {
    expect(Math.round(+line.prop('x1'))).toEqual(Math.round(scale(ticks[i])));
  });
  return wrapper;
}

function getLineHeight(line) {
  const y1 = +line.prop('y1') || 0;
  const y2 = +line.prop('y2');
  return Math.abs(y2 - y1);
}

describe('XTicks', () => {
  const linearScale = scaleLinear()
    .domain([-5, 5])
    .range([0, 500]);
  const timeScale = scaleTime()
    .domain([new Date(2009, 0, 1), new Date(2010, 0, 1)])
    .range([0, 500]);
  const ordinalScale = scalePoint()
    .domain(['a', 'b', 'c', 'd'])
    .range([0, 300]);

  it('renders a .rct-chart-ticks-x element with tick lines', () => {
    expectTicksToExist(shallow(<XTicks xScale={linearScale} />));
    expectTicksToExist(shallow(<XTicks xScale={ordinalScale} />));
    expectTicksToExist(shallow(<XTicks xScale={timeScale} />));
  });

  it('uses `tickCount` to determine approx. # of ticks to display on number/time scales', () => {
    let wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickCount={11} />),
    );
    expect(wrapper.find('line.rct-chart-tick-x')).toHaveLength(11);
    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickCount={3} />),
    );
    expect(wrapper.find('line.rct-chart-tick-x')).toHaveLength(3);

    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={timeScale} tickCount={13} />),
    );
    expect(wrapper.find('line.rct-chart-tick-x')).toHaveLength(13);
    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={timeScale} tickCount={5} />),
    );
    expect(wrapper.find('line.rct-chart-tick-x')).toHaveLength(5);
  });

  it('uses `ticks` to determine which ticks to show', () => {
    const linearTicks = [-3, 2, 4];
    let wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} ticks={linearTicks} />),
    );
    expectCorrectTickPlacement(wrapper, linearTicks, linearScale);

    const timeTicks = [new Date(2009, 4, 10), new Date(2010, 5, 13)];
    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={timeScale} ticks={timeTicks} />),
    );
    expectCorrectTickPlacement(wrapper, timeTicks, timeScale);

    const ordinalTicks = ['b', 'd'];
    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={ordinalScale} ticks={ordinalTicks} />),
    );
    expectCorrectTickPlacement(wrapper, ordinalTicks, ordinalScale);
  });

  it('uses `tickLength` to determine tick length', () => {
    let wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickLength={5} />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(getLineHeight(line)).toEqual(5));

    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickLength={13} />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(getLineHeight(line)).toEqual(13));
  });

  it('uses `top` to draw the ticks at top of rectangle', () => {
    const height = 400;
    let wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} height={height} />),
    );
    expect(wrapper.find('g.rct-chart-ticks-x')).toHaveProp(
      'transform',
      `translate(0, ${height})`,
    );

    wrapper = expectTicksToExist(
      shallow(<XTicks position="top" xScale={linearScale} height={height} />),
    );
    expect(wrapper.find('g.rct-chart-ticks-x')).toHaveProp(
      'transform',
      `translate(0, 0)`,
    );
  });

  it('draws the ticks above/below line if `placement` is passed', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks xScale={linearScale} />));
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(line.prop('y2')).toBeGreaterThan(0));
    wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} placement="above" />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(line.prop('y2')).toBeLessThan(0));

    wrapper = expectTicksToExist(
      shallow(<XTicks position="top" xScale={linearScale} />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(line.prop('y2')).toBeLessThan(0));
    wrapper = expectTicksToExist(
      shallow(<XTicks position="top" xScale={linearScale} placement="below" />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(line.prop('y2')).toBeGreaterThan(0));
  });

  it('passes className to the ticks', () => {
    const wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickClassName="test-tick-class" />),
    );
    expect(wrapper).toContainMatchingElement('line.test-tick-class');
  });

  it('passes style to the ticks', () => {
    const style = { fill: 'red' };
    const wrapper = expectTicksToExist(
      shallow(<XTicks xScale={linearScale} tickStyle={style} />),
    );
    wrapper
      .find('line.rct-chart-tick-x')
      .forEach(line => expect(line.prop('style')).toEqual(style));
  });

  it('has a static getMargin method which returns the required outer margin space', () => {
    const zeroMargins = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    let margin = XTicks.getMargin({
      tickLength: 10,
      position: 'bottom',
      placement: 'below',
    });
    expect(margin).toEqual(_.defaults({ marginBottom: 10 }, zeroMargins));
    margin = XTicks.getMargin({
      tickLength: 10,
      position: 'top',
      placement: 'above',
    });
    expect(margin).toEqual(_.defaults({ marginTop: 10 }, zeroMargins));

    margin = XTicks.getMargin({
      tickLength: 10,
      position: 'bottom',
      placement: 'above',
    });
    expect(margin).toEqual(zeroMargins);
    margin = XTicks.getMargin({
      tickLength: 10,
      position: 'top',
      placement: 'below',
    });
    expect(margin).toEqual(zeroMargins);
  });
});
