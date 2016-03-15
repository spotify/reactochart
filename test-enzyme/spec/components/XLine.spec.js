import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import {shallow, mount} from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai from 'chai';
chai.use(chaiEnzyme());
const {expect} = chai;

import XLine from '../../../src/components/XLine';

function findLine(wrapper) {
  return wrapper.find('line.chart-line-x').first();
}

function expectCorrectLinePlacement(wrapper, value, scale) {
  const lines = wrapper.find('line.chart-line-x');
  expect(lines).to.have.length(1);
  const line = lines.first();
  expect(line.first().prop('x1')).to.equal(scale(value));
  expect(line.first().prop('x2')).to.equal(scale(value));
  return wrapper;
}

function getLineHeight(line) {
  const y1 = +line.prop('y1') || 0;
  const y2 = +line.prop('y2');
  return Math.abs(y2 - y1);
}

describe('XLine', () => {
  const linearScale = d3.scale.linear().domain([-5, 5]).range([0, 500]);
  const timeScale = d3.time.scale().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]).range([0, 500]);
  const ordinalScale = d3.scale.ordinal().domain(['a', 'b', 'c', 'd']).rangePoints([0, 300]);

  const linearValue = 2;
  const timeValue = new Date(2009, 9, 19);
  const ordinalValue = 'c';

  it('renders a .chart-line-x element in the correct place', () => {
    let wrapper = shallow(<XLine scale={linearScale} value={linearValue} />);
    expectCorrectLinePlacement(wrapper, linearValue, linearScale);

    wrapper = shallow(<XLine scale={timeScale} value={timeValue} />);
    expectCorrectLinePlacement(wrapper, timeValue, timeScale);

    wrapper = shallow(<XLine scale={ordinalScale} value={ordinalValue} />);
    expectCorrectLinePlacement(wrapper, ordinalValue, ordinalScale);
  });

  it('renders a line with the correct height', () => {
    let wrapper = shallow(<XLine scale={linearScale} value={linearValue} height={200} />);
    expect(getLineHeight(findLine(wrapper))).to.equal(200);

    wrapper = shallow(<XLine scale={linearScale} value={linearValue} height={400} />);
    expect(getLineHeight(findLine(wrapper))).to.equal(400);
  });

  it('passes lineClassName to the line', () => {
    let wrapper = shallow(<XLine scale={linearScale} value={linearValue} lineClassName={'test-line-class'} />);
    expect(wrapper).to.have.descendants('line.test-line-class');
  });

  it('passes lineStyle to the line', () => {
    const style = {fill: 'red'};
    let wrapper = shallow(<XLine scale={linearScale} value={linearValue} lineStyle={style} />);
    expect(findLine(wrapper).prop('style')).to.deep.equal(style);
  });
});
