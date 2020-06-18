import { expect } from 'chai';
import * as d3 from 'd3';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { Bar, RangeBarChart } from '../../../src/index.js';

describe('RangeBarChart', () => {
  const props = {
    xScale: d3
      .scalePoint()
      .domain(['a', 'b', 'c'])
      .range([0, 100]),
    yScale: d3
      .scaleLinear()
      .domain([0, 1])
      .range([100, 0]),
    data: [['a', [0.3, 0.5]], ['b', [0.6, 0.9]]],
    x: d => d[0],
    y: d => d[1][0],
    yEnd: d => d[1][1],
    barThickness: 10,
    barClassName: 'my-bar',
    barStyle: { fill: 'blue' },
    onMouseEnterBar: sinon.spy(),
    onMouseMoveBar: sinon.spy(),
    onMouseLeaveBar: sinon.spy(),
    onClick: sinon.spy(),
  };

  it('passes props to Bar elements', () => {
    const chart = mount(<RangeBarChart {...props} />);
    const bars = chart.find('rect');

    bars.forEach(bar => {
      expect(bar.props().className).to.contain(props.barClassName);
      expect(bar.props().style).to.equal(props.barStyle);
    });
  });

  it('renders a bar chart with categorical X data & numerical Y data', () => {
    // make simple bar chart with 3 datapoints to make sure it renders correctly
    // this is more of an integration test/sanity check;
    // most tests for render correctness are in RangeRect and Bar specs
    const chart = mount(<RangeBarChart {...props} />);
    const group = chart.find('g');
    const bars = chart.find('rect');
    expect(group).to.have.length(1);
    expect(bars).to.have.length(2);

    expect(bars.at(0).props().x).to.equal(0 - props.barThickness / 2);
    expect(bars.at(0).props().width).to.equal(props.barThickness);
    expect(bars.at(0).props().y).to.equal(50);
    expect(bars.at(0).props().height).to.equal(20);

    expect(bars.at(1).props().x).to.equal(50 - props.barThickness / 2);
    expect(bars.at(1).props().width).to.equal(props.barThickness);
    expect(bars.at(1).props().y).to.equal(10);
    expect(bars.at(1).props().height).to.equal(30);
  });

  it('triggers event handlers', () => {
    const chart = mount(<RangeBarChart {...props} />);
    const bars = chart.find(Bar);

    expect(props.onMouseMoveBar).not.to.have.been.called;
    bars.at(1).simulate('mousemove');
    expect(props.onMouseMoveBar).to.have.been.called;

    expect(props.onMouseEnterBar).not.to.have.been.called;
    bars.at(1).simulate('mouseenter');
    expect(props.onMouseEnterBar).to.have.been.called;

    expect(props.onMouseLeaveBar).not.to.have.been.called;
    bars.at(1).simulate('mouseleave');
    expect(props.onMouseLeaveBar).to.have.been.called;

    expect(props.onClick).not.to.have.been.called;
    bars.at(1).simulate('click');
    expect(props.onClick).to.have.been.called;
  });
});
