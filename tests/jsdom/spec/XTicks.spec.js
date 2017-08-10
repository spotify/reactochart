import _ from 'lodash';
import * as d3 from 'd3';
import React from 'react';
import {shallow, mount} from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai from 'chai';
chai.use(chaiEnzyme());
const {expect} = chai;

import XTicks from '../../../src/XTicks';

function expectTicksToExist(wrapper) {
  const ticksGroup = wrapper.find('g.chart-ticks-x');
  expect(ticksGroup).to.have.length(1);
  expect(ticksGroup).to.have.descendants('line.chart-tick-x');
  return wrapper;
}

function expectCorrectTickPlacement(wrapper, ticks, scale) {
  let tickLines = wrapper.find('line.chart-tick-x');
  expect(tickLines).to.have.length(ticks.length);
  tickLines.forEach((line, i) => {
    expect(Math.round(+line.prop('x1'))).to.equal(Math.round(scale(ticks[i])));
  });
  return wrapper;
}

function getLineHeight(line) {
  const y1 = +line.prop('y1') || 0;
  const y2 = +line.prop('y2');
  return Math.abs(y2 - y1);
}

describe('XTicks', () => {
  const linearScale = d3.scaleLinear().domain([-5, 5]).range([0, 500]);
  const timeScale = d3.scaleTime().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]).range([0, 500]);
  const ordinalScale = d3.scalePoint().domain(['a', 'b', 'c', 'd']).range([0, 300]);

  it('renders a .chart-ticks-x element with tick lines', () => {
    expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} />));
    expectTicksToExist(shallow(<XTicks scale={{x: ordinalScale}} />));
    expectTicksToExist(shallow(<XTicks scale={{x: timeScale}} />));
  });

  it('uses `tickCount` to determine approx. # of ticks to display on number/time scales', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickCount={11} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(11);
    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickCount={3} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(3);

    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: timeScale}} tickCount={13} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(13);
    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: timeScale}} tickCount={5} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(5);
  });

  it('uses `ticks` to determine which ticks to show', () => {
    const linearTicks = [-3, 2, 4];
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} ticks={linearTicks} />));
    expectCorrectTickPlacement(wrapper, linearTicks, linearScale);

    const timeTicks = [new Date(2009, 4, 10), new Date(2010, 5, 13)];
    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: timeScale}} ticks={timeTicks} />));
    expectCorrectTickPlacement(wrapper, timeTicks, timeScale);

    const ordinalTicks = ['b', 'd'];
    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: ordinalScale}} ticks={ordinalTicks} />));
    expectCorrectTickPlacement(wrapper, ordinalTicks, ordinalScale);
  });

  it('uses `tickLength` to determine tick length', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickLength={5} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(getLineHeight(line)).to.equal(5));

    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickLength={13} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(getLineHeight(line)).to.equal(13));
  });

  it('uses `top` to draw the ticks at top of rectangle', () => {
    const height = 400;
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} height={height} />));
    expect(wrapper.find('g.chart-ticks-x')).to.have.attr('transform', `translate(0, ${height})`);

    wrapper = expectTicksToExist(shallow(<XTicks position="top" scale={{x: linearScale}} height={height}  />));
    expect(wrapper.find('g.chart-ticks-x')).to.have.attr('transform', `translate(0, 0)`);
  });

  it('draws the ticks above/below line if `placement` is passed', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.above(0));
    wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} placement="above" />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.below(0));

    wrapper = expectTicksToExist(shallow(<XTicks position="top" scale={{x: linearScale}} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.below(0));
    wrapper = expectTicksToExist(shallow(<XTicks position="top" scale={{x: linearScale}} placement="below" />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.above(0));
  });

  it('passes className to the ticks', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickClassName={'test-tick-class'} />));
    expect(wrapper).to.have.descendants('line.test-tick-class');
  });

  it('passes style to the ticks', () => {
    const style = {fill: 'red'};
    let wrapper = expectTicksToExist(shallow(<XTicks scale={{x: linearScale}} tickStyle={style} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('style')).to.deep.equal(style));
  });

  it('has a static getMargin method which returns the required outer margin space', () => {
    const zeroMargins = {top: 0, bottom: 0, left: 0, right: 0};

    let margin = XTicks.getMargin({tickLength: 10, position: 'bottom', placement: 'below'});
    expect(margin).to.deep.equal(_.defaults({bottom: 10}, zeroMargins));
    margin = XTicks.getMargin({tickLength: 10, position: 'top', placement: 'above'});
    expect(margin).to.deep.equal(_.defaults({top: 10}, zeroMargins));

    margin = XTicks.getMargin({tickLength: 10, position: 'bottom', placement: 'above'});
    expect(margin).to.deep.equal(zeroMargins);
    margin = XTicks.getMargin({tickLength: 10, position: 'top', placement: 'below'});
    expect(margin).to.deep.equal(zeroMargins);
  })
});
