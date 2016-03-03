import _ from 'lodash';
import React from 'react';
import d3 from 'd3';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import resolveXYScales from '../../src/utils/resolveXYScales';

class NotImplementedError extends Error {
  constructor(message = "Not Implemented Yet") {
    super(message);
  }
}

function expectD3Scale(scale) {
  expect(scale).to.be.a('function');
  expect(scale.domain).to.be.a('function');
  expect(scale.range).to.be.a('function');
}

describe('resolveXYScales', () => {

  class XYChart extends React.Component {
    static defaultProps = {};
    static getDomain() {

    }
    static getMargin() {

    }
    render() {
      return <div></div>;
    }
  }

  const ScaledXYChart = resolveXYScales(XYChart);

  it('passes XY scales and margins through if both are provided', () => {
    const props = {
      scale: {
        x: d3.scale.linear().domain([-1, 1]).range([0, 400]),
        y: d3.scale.linear().domain([-2, 2]).range([10, 300])
      },
      margin: {top: 10, bottom: 20, left: 30, right: 40}
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const scaled = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    ['scale', 'margin'].forEach(propKey => {
      expect(scaled.props[propKey]).to.equal(props[propKey]);
      expect(scaled.props[propKey]).to.deep.equal(props[propKey]);
    })
  });

  it('resolves XY scales from data, margins and size', () => {
    const props = {
      width: 500,
      height: 300,
      margin: {top: 10, bottom: 20, left: 30, right: 40},
      data: [
        {x: 10, y: 20},
        {x: 20, y: 95},
        {x: 30, y: 32}
      ]
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    expect(rendered.props.margin).to.equal(props.margin);
    expect(rendered.props.margin).to.deep.equal(props.margin);

    expect(rendered.props.scale).to.be.an('object');
    ['x', 'y'].forEach(k => {
      expect(rendered.props.scale).to.have.property(k);
      expectD3Scale(rendered.props.scale[k])
    });

    expect(rendered.props.scale.x.domain()).to.deep.equal([_.minBy(data, 'x'), _.maxBy(data, 'x')]);
    expect(rendered.props.scale.x.range()).to.deep.equal([
      props.margin.left, props.width - (props.margin.left + props.margin.right)
    ]);
    //expect(rendered.props.scale.y.domain()).to.deep.equal([20, 95]);
  });

  it('resolves XY scales from domain, margins and size', () => {
    throw new NotImplementedError();
  });

  it('resolves XY scales and margins from data and size', () => {
    throw new NotImplementedError();
  });

  it('resolves XY scales and margins from domain and size', () => {
    throw new NotImplementedError();
  });

  it('sets margins to zero if they are neither provided nor resolvable', () => {
    throw new NotImplementedError();
  });

  it('throws if domains are neither provided nor resolvable', () => {
    throw new NotImplementedError();
  });

  it('throws if neither XY scales nor size are provided', () => {
    throw new NotImplementedError();
  });

  it('throws if neither XY scales nor (domain or data) are provided', () => {
    throw new NotImplementedError();
  });

  // todo resolve internal chart padding also
  // todo: resolves margins if scales are present?
  // todo: handle resolving different types of scales? use axisType
  // todo: test with thin layers of components (w/o getDomain) in between?
  // todo: test when one scale or domain is passed but not the other?
});
