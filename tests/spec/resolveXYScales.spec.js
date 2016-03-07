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

function expectRefAndDeepEqual(a, b) {
  expect(a).to.equal(b);
  expect(a).to.deep.equal(b);
}

function expectD3Scale(scale) {
  expect(scale).to.be.a('function');
  expect(scale.domain).to.be.a('function');
  expect(scale.range).to.be.a('function');
}

function expectXYScales(scales) {
  expect(scales).to.be.an('object');
  ['x', 'y'].forEach(k => {
    expect(scales).to.have.property(k);
    expectD3Scale(scales[k]);
  });
}

const innerWidth = (width, margin) => width - ((margin.left || 0) + (margin.right || 0));
const innerHeight = (height, margin) => height - ((margin.top || 0) + (margin.bottom || 0));

function innerRangeX(outerWidth, margin={}) {
  const left = margin.left || 0;
  return [left, left + innerWidth(outerWidth, margin)];
}
function innerRangeY(outerHeight, margin={}) {
  const top = margin.top || 0;
  return [top + innerHeight(outerHeight, margin), top];
}

describe('resolveXYScales', () => {
  const testDomain = {x: [-5, 5], y: [0, 10]};
  const testMargin = {top: 10, bottom: 20, left: 30, right: 40};

  class XYChart extends React.Component {
    static defaultProps = {};
    static getDomain(props) {
      return testDomain;
    }
    static getMargin(props) {
      return testMargin;
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
      margin: {top: 11, bottom: 21, left: 31, right: 41}
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    ['scale', 'margin'].forEach(propKey => {
      expectRefAndDeepEqual(rendered.props[propKey], props[propKey]);
    })
  });

  it('resolves XY scales from size, domain and margins', () => {
    const props = {
      width: 500,
      height: 300,
      domain: {x: [-50, 50], y: [-100, 100]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    expect(rendered.props.margin).to.deep.equal(props.margin);
    const renderedScale = rendered.props.scale;
    expectXYScales(renderedScale);
    expect(renderedScale.x.domain()).to.deep.equal(props.domain.x);
    expect(renderedScale.y.domain()).to.deep.equal(props.domain.y);
    expect(renderedScale.x.range()).to.deep.equal(innerRangeX(props.width, props.margin));
    expect(renderedScale.y.range()).to.deep.equal(innerRangeY(props.height, props.margin));
  });

  it('resolves XY scales from size, data and margins', () => {
    const props = {
      width: 500,
      height: 300,
      margin: {top: 11, bottom: 22, left: 33, right: 44},
      // data doesn't actually matter, since XYChart.getDomain returns a constant
      data: [{x: 10, y: 20}]
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    expect(rendered.props.margin).to.equal(props.margin);
    const renderedScale = rendered.props.scale;
    expectXYScales(renderedScale);
    expect(renderedScale.x.domain()).to.deep.equal(testDomain.x);
    expect(renderedScale.y.domain()).to.deep.equal(testDomain.y);
    expect(renderedScale.x.range()).to.deep.equal(innerRangeX(props.width, props.margin));
    expect(renderedScale.y.range()).to.deep.equal(innerRangeY(props.height, props.margin));
  });

  it('resolves XY scales and margins from data and size', () => {
    const props = {
      width: 500,
      height: 300,
      data: [{x: 10, y: 20}]
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    expect(rendered.props.margin).to.equal(testMargin);
    expect(rendered.props.margin).to.deep.equal(testMargin);
    const renderedScale = rendered.props.scale;
    expectXYScales(renderedScale);
    expect(renderedScale.x.domain()).to.deep.equal(testDomain.x);
    expect(renderedScale.y.domain()).to.deep.equal(testDomain.y);
    expect(renderedScale.x.range()).to.deep.equal(innerRangeX(props.width, testMargin));
    expect(renderedScale.y.range()).to.deep.equal(innerRangeY(props.height, testMargin));
  });

  it('resolves XY scales and margins from domain and size', () => {
    const props = {
      width: 500,
      height: 300,
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const wrapped = TestUtils.renderIntoDocument(<ScaledXYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, XYChart);

    expect(rendered.props.margin).to.equal(testMargin);
    expect(rendered.props.margin).to.deep.equal(testMargin);
    const renderedScale = rendered.props.scale;
    expectXYScales(renderedScale);
    expect(renderedScale.x.domain()).to.deep.equal(props.domain.x);
    expect(renderedScale.y.domain()).to.deep.equal(props.domain.y);
    expect(renderedScale.x.range()).to.deep.equal(innerRangeX(props.width, testMargin));
    expect(renderedScale.y.range()).to.deep.equal(innerRangeY(props.height, testMargin));
  });

  it('sets margins to zero if they are neither provided nor resolvable', () => {
    console.log('not implemented');
    //throw new NotImplementedError();
  });

  it('throws if domains are neither provided nor resolvable', () => {
    //throw new NotImplementedError();
    console.log('not implemented');
  });

  it('throws if neither XY scales nor size are provided', () => {
    console.log('not implemented');
    //throw new NotImplementedError();
  });

  it('throws if neither XY scales nor (domain or data) are provided', () => {
    console.log('not implemented');
    //throw new NotImplementedError();
  });

  // todo test partially specified margins
  // todo resolve internal chart padding also
  // todo: resolves margins if scales are present?
  // todo: handle resolving different types of scales? use axisType
  // todo: test with thin layers of components (w/o getDomain) in between?
  // todo: test when one scale or domain is passed but not the other?
});
