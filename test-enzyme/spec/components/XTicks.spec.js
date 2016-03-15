import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import {shallow, mount} from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai from 'chai';
chai.use(chaiEnzyme());
const {expect} = chai;

import XTicks from '../../../src/components/XTicks';

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
  const linearScale = d3.scale.linear().domain([-5, 5]).range([0, 500]);
  const timeScale = d3.time.scale().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]).range([0, 500]);
  const ordinalScale = d3.scale.ordinal().domain(['a', 'b', 'c', 'd']).rangePoints([0, 300]);

  it('renders a .chart-ticks-x element with tick lines', () => {
    expectTicksToExist(shallow(<XTicks scale={linearScale} />));
    expectTicksToExist(shallow(<XTicks scale={ordinalScale} />));
    expectTicksToExist(shallow(<XTicks scale={timeScale} />));
  });

  it('uses `tickCount` to determine approx. # of ticks to display on number/time scales', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} tickCount={11} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(11);
    wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} tickCount={3} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(3);

    wrapper = expectTicksToExist(shallow(<XTicks scale={timeScale} tickCount={13} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(13);
    wrapper = expectTicksToExist(shallow(<XTicks scale={timeScale} tickCount={5} />));
    expect(wrapper.find('line.chart-tick-x')).to.have.length(5);
  });

  it('uses `ticks` to determine which ticks to show', () => {
    const linearTicks = [-3, 2, 4];
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} ticks={linearTicks} />));
    expectCorrectTickPlacement(wrapper, linearTicks, linearScale);

    const timeTicks = [new Date(2009, 4, 10), new Date(2010, 5, 13)];
    wrapper = expectTicksToExist(shallow(<XTicks scale={timeScale} ticks={timeTicks} />));
    expectCorrectTickPlacement(wrapper, timeTicks, timeScale);

    const ordinalTicks = ['b', 'd'];
    wrapper = expectTicksToExist(shallow(<XTicks scale={ordinalScale} ticks={ordinalTicks} />));
    expectCorrectTickPlacement(wrapper, ordinalTicks, ordinalScale);
  });

  it('uses `tickLength` to determine tick length', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} tickLength={5} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(getLineHeight(line)).to.equal(5));

    wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} tickLength={13} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(getLineHeight(line)).to.equal(13));
  });

  it('uses `top` to draw the ticks at top of rectangle', () => {
    const height = 400;
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} height={height} />));
    expect(wrapper.find('g.chart-ticks-x')).to.have.attr('transform', `translate(0,${height})`);

    wrapper = expectTicksToExist(shallow(<XTicks top scale={linearScale} height={height}  />));
    expect(wrapper.find('g.chart-ticks-x')).to.have.attr('transform', '');
  });

  it('draws the ticks inside the rectangle if `inner` is passed', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.above(0));
    wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} inner />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.below(0));

    wrapper = expectTicksToExist(shallow(<XTicks top scale={linearScale} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.below(0));
    wrapper = expectTicksToExist(shallow(<XTicks inner top scale={linearScale} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('y2')).to.be.above(0));
  });

  it('passes className to the ticks', () => {
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} className={'test-tick-class'} />));
    expect(wrapper).to.have.descendants('line.test-tick-class');
  });

  it('passes style to the ticks', () => {
    const style = {fill: 'red'};
    let wrapper = expectTicksToExist(shallow(<XTicks scale={linearScale} style={style} />));
    wrapper.find('line.chart-tick-x').forEach(line => expect(line.prop('style')).to.deep.equal(style));
  });

  it('has a static getMargin method which returns the required outer margin space', () => {
    const zeroMargins = {top: 0, bottom: 0, left: 0, right: 0};

    let margin = XTicks.getMargin({tickLength: 10, inner: false, top: false});
    expect(margin).to.deep.equal(_.defaults({bottom: 10}, zeroMargins));
    margin = XTicks.getMargin({tickLength: 10, inner: false, top: true});
    expect(margin).to.deep.equal(_.defaults({top: 10}, zeroMargins));

    margin = XTicks.getMargin({tickLength: 10, inner: true, top: false});
    expect(margin).to.deep.equal(zeroMargins);
    margin = XTicks.getMargin({tickLength: 10, inner: true, top: true});
    expect(margin).to.deep.equal(zeroMargins);
  })
});
