import _ from 'lodash';
import React from 'react';
import d3 from 'd3';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import {
  isValidScale,
  innerRangeX,
  innerRangeY
} from 'utils/Scale';

import resolveXYScales from '../../src/utils/resolveXYScales';
import resolveObjectProps from '../../src/utils/resolveObjectProps';

class NotImplementedError extends Error {
  constructor(message = "Not Implemented Yet") {
    super(message);
  }
}

function expectRefAndDeepEqual(a, b) {
  expect(a).to.equal(b);
  expect(a).to.deep.equal(b);
}

function expectXYScales(scales) {
  expect(scales).to.be.an('object');
  ['x', 'y'].forEach(k => {
    expect(scales).to.have.property(k);
    expect(isValidScale(scales[k])).to.equal(true);
  });
}

function expectXYScaledComponent(rendered, {width, height, scaleType, domain, margin, range}) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {x: innerRangeX(width, margin), y: innerRangeY(height, margin)};
  expect(scaleType).to.be.an('object');

  expect(rendered.props).to.be.an('object');
  expect(rendered.props.margin).to.deep.equal(margin);

  const renderedScale = rendered.props.scale;
  expectXYScales(renderedScale);
  ['x', 'y'].forEach(k => {
    expect(rendered.props.scaleType[k]).to.equal(scaleType[k]);
    expect(renderedScale[k].domain()).to.deep.equal(domain[k]);
    if(scaleType[k] === 'ordinal')
      expect(renderedScale[k].range()).to.deep
        .equal(d3.scale.ordinal().domain(domain[k]).rangePoints(range[k]).range());
    else
      expect(renderedScale[k].range()).to.deep.equal(range[k]);
  });
}

describe('resolveXYScales', () => {
  const customScaleType = {x: 'ordinal', y: 'linear'};
  const customDomain = {x: [-5, 5], y: [0, 10]};
  const customMargin = {top: 10, bottom: 20, left: 30, right: 40};
  const width = 500;
  const height = 400;

  // test fixture component classes
  class ComponentWithChildren extends React.Component {
    render() {
      //console.log(this.props.scale.x.range())
      return <div>{this.props.children}</div>;
    }
  }

  class Chart extends ComponentWithChildren {}
  const XYChart = resolveXYScales(Chart);

  class ChartWithCustomScaleType extends ComponentWithChildren {
    static getScaleType(props) { return customScaleType; }
  }
  const XYChartWithCustomScaleType = resolveXYScales(ChartWithCustomScaleType);

  class ChartWithCustomDomain extends ComponentWithChildren {
    static getDomain(props) { return customDomain; }
  }
  const XYChartWithCustomDomain = resolveXYScales(ChartWithCustomDomain);

  class ChartWithCustomMargin extends ComponentWithChildren {
    static getMargin(props) { return customMargin; }
  }
  const XYChartWithCustomMargin = resolveXYScales(ChartWithCustomMargin);

  class ContainerChart extends React.Component {
    render() {
      const {width, height, scale, scaleType, margin, domain} = this.props;
      const newChildren = React.Children.map(this.props.children, (child, i) => {
        return React.cloneElement(child, {width, height, scale, scaleType, margin, domain});
      });
      return <div>{newChildren}</div>;
    }
  }
  const XYContainerChart = resolveXYScales(ContainerChart);

  const XYChartWithObjectProps = resolveObjectProps(resolveXYScales(Chart),
    ['domain', 'scale', 'scaleType'], ['x', 'y']
  );
  const XYChartWithCustomMarginAndObjectProps = resolveObjectProps(resolveXYScales(ChartWithCustomMargin),
    ['domain', 'scale', 'scaleType'], ['x', 'y']
  );
  const XYContainerChartWithObjectProps = resolveObjectProps(resolveXYScales(ContainerChart),
    ['domain', 'scale', 'scaleType'], ['x', 'y']
  );

  it('passes XY scales and margins through if both are provided', () => {
    const props = {
      scale: {
        x: d3.scale.linear().domain([-1, 1]).range([0, 400]),
        y: d3.scale.linear().domain([-2, 2]).range([10, 300])
      },
      margin: {top: 11, bottom: 21, left: 31, right: 41}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, Chart);

    ['scale', 'margin'].forEach(propKey => {
      expectRefAndDeepEqual(rendered.props[propKey], props[propKey]);
    })
  });

  it('creates scales from scaleType, size, domain & margins', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'ordinal'},
      domain: {x: [-50, 50], y: [-100, 100]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, Chart);
    expectXYScaledComponent(rendered, props);
  });


  it('infers scaleType from Component.getScaleType', () => {
    const props = {
      width, height,
      domain: {x: [-50, 50], y: [-100, 100]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChartWithCustomScaleType {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ChartWithCustomScaleType);
    expectXYScaledComponent(rendered, {scaleType: customScaleType, ...props});
  });

  it('infers scaleType from data', () => {
    const props = {
      width, height,
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getValue: {x: 0, y: 1},
      domain: {x: [12, 22], y: ['a', 'b', 'c']},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, Chart);
    expectXYScaledComponent(rendered, {scaleType: {x: 'linear', y: 'ordinal'}, ...props});
  });

  it('infers scaleType from children getScaleType', () => {
    const props = {
      width, height,
      domain: {x: [12, 22], y: [2, 3]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const tree = <XYContainerChart {...props}><XYChartWithCustomScaleType a="1"/></XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {scaleType: customScaleType, ...props});
  });

  it('infers scaleType from children data', () => {
    const props = {
      width, height,
      domain: {x: [12, 22], y: ['a', 'b', 'c']},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getValue: {x: 0, y: 1}
    };
    const tree = <XYContainerChart {...props}><XYChart {...chartProps}/></XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {scaleType: {x: 'linear', y: 'ordinal'}, ...props});
  });


  it('infers domain from Component.getDomain', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChartWithCustomDomain {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ChartWithCustomDomain);
    expectXYScaledComponent(rendered, {domain: customDomain, ...props});
  });

  it('infers domain from data', () => {
    const props = {
      width, height,
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getValue: {x: 0, y: 1},
      scaleType: {x: 'linear', y: 'ordinal'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChart {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, Chart);
    expectXYScaledComponent(rendered, {domain: {x: [12, 22], y: ['a', 'b', 'c']}, ...props});
  });

  it('infers domain from children getDomain', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const tree = <XYContainerChart {...props}><XYChartWithCustomDomain /></XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {domain: customDomain, ...props});
  });

  it('infers domain from children data', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const tree = <XYContainerChart {...props}>
      <XYChart data={[[0, 2], [3, 5]]} getValue={{x: 0, y: 1}} />
      <XYChart data={[[-2, 0], [2, 4]]} getValue={{x: 0, y: 1}} />
    </XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {domain: {x: [-2, 3], y: [0, 5]}, ...props});
  });


  it('infers margin from Component.getMargin', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const wrapped = TestUtils.renderIntoDocument(<XYChartWithCustomMargin {...props} />);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ChartWithCustomMargin);
    expectXYScaledComponent(rendered, {margin: customMargin, ...props});
  });

  it('infers margin from children getMargin', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const tree = <XYContainerChart {...props}><XYChartWithCustomMargin /></XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {margin: customMargin, ...props});
  });

  it('infers margin from children margin props', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const tree = <XYContainerChart {...props}>
      <XYChart margin={{top: 20, left: 10}} />
      <XYChart margin={{bottom: 40, left: 30, right: 50}} />
    </XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);
    expectXYScaledComponent(rendered, {margin: {top: 20, bottom: 40, left: 30, right: 50}, ...props});
  });


  it('infers scaleType & domain from data, margin from getMargin', () => {
    const containerProps = {width, height};
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getValue: {x: 0, y: 1}
    };
    const tree = <XYContainerChart {...containerProps}>
      <XYChartWithCustomMargin {...chartProps} />
    </XYContainerChart>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ChartWithCustomMargin);
    expectXYScaledComponent(rendered, {
      ...chartProps, ...containerProps,
      margin: customMargin,
      scaleType: {x: 'linear', y: 'ordinal'},
      domain: {x: [12, 22], y: ['a', 'b', 'c']}
    });
  });

  it('works with resolveObjectProps', () => {
    const containerProps = {
      width, height,
      domain: [-12, 12],
      scaleType: 'linear'
    };
    const tree = <XYContainerChartWithObjectProps {...containerProps}>
      <XYChartWithCustomMarginAndObjectProps />
    </XYContainerChartWithObjectProps>;
    const wrapped = TestUtils.renderIntoDocument(tree);
    const rendered = TestUtils.findRenderedComponentWithType(wrapped, ContainerChart);

    expectXYScaledComponent(rendered, {
      ...containerProps,
      margin: customMargin,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-12, 12], y: [-12, 12]}
    });
  });

  function renderAndFindByType(node, Component) {
    const rendered = TestUtils.renderIntoDocument(node);
    return TestUtils.findRenderedComponentWithType(rendered, Component);
  }

  it('rounds domain to nice numbers if `nice` option is true', () => {
    const props = {
      width, height,
      data: [[0.3, 0.8], [9.2, 9.7]],
      getValue: {x: 0, y: 1},
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };

    const niceXChart = renderAndFindByType(<XYChart {...props} {...{nice: {x: true, y: false}}} />, Chart);
    expectXYScaledComponent(niceXChart, {domain: {x: [0, 10], y: [0.8, 9.7]}, ...props});

    const niceYChart = renderAndFindByType(<XYChart {...props} {...{nice: {x: false, y: true}}} />, Chart);
    expectXYScaledComponent(niceYChart, {domain: {x: [0.3, 9.2], y: [0, 10]}, ...props});
  });

  // todo spacing/padding
  // todo invertScale
  // todo tickCount?
  // todo ticks?
  // todo includeZero?

  // todo test combining multiple scaletypes/domains/margins from children
  // todo test partially specified scaletype
  // todo test partially specified margins
  // todo test partially specified scales
  // todo test partially specified domains
  // todo: test with thin layers of components (w/o getDomain) in between?
  // todo: test when one scale or domain is passed but not the other?
});
