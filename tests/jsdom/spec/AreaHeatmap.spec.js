import React from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { AreaHeatmap } from '../../../src/index.js';

describe('AreaHeatmap', () => {
  const gridData = _.range(30).map(m => {
    return _.range(30).map(n => {
      return {
        x: n,
        xEnd: n + 1,
        y: m,
        yEnd: m + 1,
        value: Math.sin(m * n * 0.01),
      };
    });
  });
  const data = _.flatten(gridData);
  const props = {
    data,
    area: d => d.value,
    x: d => d.x,
    xEnd: d => d.xEnd,
    y: d => d.y,
    yEnd: d => d.yEnd,
    rectClassName: 'rect-class',
    xScale: scaleLinear()
      .domain([-1, 0, 1])
      .range([0, 30]),
    yScale: scaleLinear()
      .domain([0, 10])
      .range([0, 30]),
    onMouseMove: sinon.spy(),
    onMouseEnter: sinon.spy(),
    onMouseLeave: sinon.spy(),
    rectStyle: { fill: 'rebeccapurple' },
  };

  it('renders a color heatmap', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    const group = chart.find('g.rct-area-heatmap-chart');
    expect(group).to.have.length(1);
    expect(group.find('rect')).to.have.lengthOf.above(1);
  });

  it('passes props correctly', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    const lastRect = chart.find('rect').last();

    expect(chart.props().onMouseMove).to.be.a('function');
    expect(chart.props().onMouseEnter).to.be.a('function');
    expect(chart.props().onMouseLeave).to.be.a('function');

    expect(lastRect.props().x).to.be.a('number');
    expect(lastRect.props().y).to.be.a('number');
    expect(lastRect.props().width).to.be.a('number');
    expect(lastRect.props().height).to.be.a('number');
    expect(lastRect.props().className).to.include(props.rectClassName);
    expect(lastRect.props().style).to.equal(props.rectStyle);
  });

  it('triggers event handlers', () => {
    const chart = mount(<AreaHeatmap {...props} />);
    expect(chart.props().onMouseMove).not.to.have.been.called;
    chart.simulate('mousemove');
    expect(chart.props().onMouseMove).to.have.been.called;
    expect(chart.props().onMouseEnter).not.to.have.been.called;
    chart.simulate('mouseenter');
    expect(chart.props().onMouseEnter).to.have.been.called;
    expect(chart.props().onMouseLeave).not.to.have.been.called;
    chart.simulate('mouseleave');
    expect(chart.props().onMouseLeave).to.have.been.called;
  });
});
