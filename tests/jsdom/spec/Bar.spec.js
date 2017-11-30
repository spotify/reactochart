import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chai from 'chai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const {expect} = chai;

import {Bar} from '../../../src/index.js';

function expectProps(el, expectedProps) {
  const props = el.props();
  _.forEach(expectedProps, (expectedValue, key) => {
    expect(props[key]).to.equal(expectedValue);
  });
}

describe('Bar', () => {
  it('renders a basic vertical bar correctly', () => {
    const bar = shallow(
      <Bar
        xScale={d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100])}
        yScale={d3.scaleLinear().domain([0, 1]).range([100, 0])}
        x={'b'}
        y={0.25}
        yEnd={0.75}
        thickness={20}
      />
    );

    const rect = bar.find('rect');
    expect(rect).to.have.length(1);

    const rectProps = rect.props();
    expect(rectProps.className).to.include('chart-bar');
    expect(rectProps.className).to.include('chart-bar-vertical');
    expect(rectProps.x).to.equal(50 - (20 / 2));
    expect(rectProps.y).to.equal(25);
    expect(rectProps.height).to.equal(50);
    expect(rectProps.width).to.equal(20);
  });

  it('renders a basic horizontal bar correctly', () => {
    const bar = shallow(
      <Bar
        xScale={d3.scaleLinear().domain([0, 1]).range([0, 100])}
        yScale={d3.scalePoint().domain(['a', 'b', 'c']).range([100, 0])}
        x={.1}
        xEnd={.7}
        y={'b'}
        thickness={20}
      />
    );

    const rect = bar.find('rect');
    expect(rect).to.have.length(1);

    const rectProps = rect.props();
    expect(rectProps.className).to.include('chart-bar');
    expect(rectProps.className).to.include('chart-bar-horizontal');
    expect(rectProps.x).to.equal(10);
    expect(rectProps.y).to.equal(50 - (20 / 2));
    expect(rectProps.height).to.equal(20);
    expect(rectProps.width).to.equal(60);
  });

  it('has a thickness prop which controls the thickness of the bar', () => {
    const verticalBarProps = {
      xScale: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
      yScale: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      x: 'a',
      y: 0,
      yEnd: 1,
      thickness: 10
    };

    const verticalBar = shallow(<Bar {...verticalBarProps} />);
    expect(verticalBar.find('rect')).to.have.length(1);
    expect(verticalBar.find('rect').props().width).to.equal(10);

    const thickVerticalBar = shallow(<Bar {...verticalBarProps} thickness={40} />);
    expect(thickVerticalBar.find('rect')).to.have.length(1);
    expect(thickVerticalBar.find('rect').props().width).to.equal(40);

    const horizontalBarProps = {
      xScale: d3.scaleLinear().domain([0, 1]).range([0, 100]),
      yScale: d3.scalePoint().domain(['a', 'b', 'c']).range([100, 0]),
      x: .2,
      xEnd: .9,
      y: 'c',
      thickness: 12
    };

    const horizontalBar = shallow(<Bar {...horizontalBarProps} />);
    expect(horizontalBar.find('rect')).to.have.length(1);
    expect(horizontalBar.find('rect').props().height).to.equal(12);

    const thickHorizontalBar = shallow(<Bar {...horizontalBarProps} thickness={56} />);
    expect(thickHorizontalBar.find('rect')).to.have.length(1);
    expect(thickHorizontalBar.find('rect').props().height).to.equal(56);
  });

  it("passes className and style props through to the bar's rectangle element", () => {
    const verticalBarProps = {
      xScale: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
      yScale: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      x: 'a',
      y: 0,
      yEnd: 1,
      className: 'foo-bar-test-class',
      style: {fill: 'thistle'}
    };

    const verticalBar = shallow(<Bar {...verticalBarProps} />);
    const rect = verticalBar.find('rect');
    expect(rect).to.have.length(1);
    expect(rect.props().className).to.include('foo-bar-test-class');
    expect(rect.props().style).to.deep.equal(verticalBarProps.style);
  });

  it("attaches onMouseMove, onMouseEnter and onMouseLeave handlers to the bar's rectangle",  () => {
    const barProps = {
      xScale: d3.scaleLinear().domain([0, 1]).range([0, 100]),
      yScale: d3.scalePoint().domain(['a', 'b', 'c']).range([100, 0]),
      x: 'a',
      y: 0,
      yEnd: 1,
      onMouseMove: sinon.spy(),
      onMouseEnter: sinon.spy(),
      onMouseLeave: sinon.spy()
    };

    const bar = mount(<Bar {...barProps} />);
    const rect = bar.find('rect');

    expect(barProps.onMouseEnter).not.to.have.been.called;
    rect.simulate('mouseenter');
    expect(barProps.onMouseEnter).to.have.been.calledOnce;

    expect(barProps.onMouseMove).not.to.have.been.called;
    rect.simulate('mousemove');
    expect(barProps.onMouseMove).to.have.been.calledOnce;

    expect(barProps.onMouseLeave).not.to.have.been.called;
    rect.simulate('mouseleave');
    expect(barProps.onMouseLeave).to.have.been.calledOnce;
  });

  it("throws an error if x/y scale(s) are missing or invalid", () => {
    const barProps = {x: 'a', y: 0, yEnd: 1};
    const xScale = d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([100, 0]);

    // throw if no scale prop passed
    expect(() => { shallow(<Bar {...barProps}/>); }).to.throw(Error);
    // throw if one scale is missing
    expect(() => {
      shallow(<Bar {...{...barProps, xScale}}/>);
    }).to.throw(Error);
    // throw if one scale is invalid
    expect(() => {
      shallow(<Bar {...{...barProps, xScale: 'bad', yScale}}/>);
    }).to.throw(Error);
    // don't throw if both are provided
    expect(() => {
      shallow(<Bar {...{...barProps, xScale, yScale}}/>);
    }).not.to.throw(Error);
  });

  it("throws an error if exactly ONE of xEnd OR yEnd are not provided", () => {
    const barProps = {
      xScale: d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]),
      yScale: d3.scaleLinear().domain([0, 1]).range([100, 0]),
      x: 'a',
      y: 0
    };

    // throw if neither xEnd or yEnd passed
    expect(() => { shallow(<Bar {...barProps}/>); }).to.throw(Error);
    // throw if both xEnd and yEnd passed
    expect(() => { shallow(<Bar {...{...barProps, xEnd: 'b', yEnd: 1}}/>); }).to.throw(Error);
    // OK if one or other is passed
    expect(() => { shallow(<Bar {...{...barProps, xEnd: 'b'}}/>); }).not.to.throw(Error);
    expect(() => { shallow(<Bar {...{...barProps, yEnd: 1}}/>); }).not.to.throw(Error);
  })
});