import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';

import {isValidScale} from '../../../src/utils/Scale';
import {innerRangeX, innerRangeY} from '../../../src/utils/Margin';

import resolveXYScales from '../../../src/utils/resolveXYScales';
import resolveObjectProps from '../../../src/utils/resolveObjectProps';

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
  console.log('expected domains', domain);
  console.log('expected range', range);

  expect(rendered.props).to.be.an('object');
  expect(rendered.props.margin).to.deep.equal(margin);

  const renderedScale = rendered.props.scale;
  expectXYScales(renderedScale);
  ['x', 'y'].forEach(k => {
    expect(rendered.props.scaleType[k]).to.equal(scaleType[k]);
    console.log('domain', renderedScale[k].domain());
    console.log('expected domain', domain[k]);
    expect(renderedScale[k].domain()).to.deep.equal(domain[k]);
    if(scaleType[k] === 'ordinal')
      expect(renderedScale[k].range()).to.deep
        .equal(d3.scaleOrdinal().domain(domain[k]).rangePoints(range[k]).range());
    else
      expect(renderedScale[k].range()).to.deep.equal(range[k]);
  });
}

function expectXYScaledComponentEnzyme(rendered, {width, height, scaleType, domain, margin, range}) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {x: innerRangeX(width, margin), y: innerRangeY(height, margin)};
  expect(scaleType).to.be.an('object');

  expect(rendered.props().margin).to.deep.equal(margin);

  console.log('renderedprops', rendered.props());
  const renderedScale = rendered.props().scale;
  expectXYScales(renderedScale);
  ['x', 'y'].forEach(k => {
    expect(rendered.props().scaleType[k]).to.equal(scaleType[k]);
    console.log('domain', renderedScale[k].domain());
    console.log('expected domain', domain[k]);
    expect(renderedScale[k].domain()).to.deep.equal(domain[k]);
    if(scaleType[k] === 'ordinal')
      expect(renderedScale[k].range()).to.deep
        .equal(d3.scaleOrdinal().domain(domain[k]).rangePoints(range[k]).range());
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
        x: d3.scaleLinear().domain([-1, 1]).range([0, 400]),
        y: d3.scaleLinear().domain([-2, 2]).range([10, 300])
      },
      margin: {top: 11, bottom: 21, left: 31, right: 41}
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    ['scale', 'margin'].forEach(propKey => {
      expectRefAndDeepEqual(rendered.props()[propKey], props[propKey]);
    })
  });

  it('creates scales from scaleType, size, domain & margins', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'ordinal'},
      domain: {x: [-50, 50], y: [-100, 100]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);
    const renderedScale = rendered.props().scale;
    
    expectXYScales(renderedScale);
    expect(renderedScale.x.domain()).to.deep.equal(props.domain.x);
    expect(renderedScale.y.domain()).to.deep.equal(props.domain.y);
    expect(renderedScale.x.range()).to.deep.equal([0, width - (props.margin.left + props.margin.right)]);
    expect(renderedScale.y.range()).to.deep.equal([height - (props.margin.top + props.margin.bottom), 0]);
  });


  it('infers scaleType from Component.getScaleType', () => {
    const props = {
      width, height,
      domain: {x: [-50, 50], y: [-100, 100]},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };

    const wrapped = mount(<XYChartWithCustomScaleType {...props} />);
    const rendered = wrapped.find(ChartWithCustomScaleType);

    expect(rendered.props().scaleType).to.deep.equal(customScaleType);

  });

  it('infers scaleType from data', () => {
    const props = {
      width, height,
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getX: 0,
      getY: 1,
      domain: {x: [12, 22], y: ['a', 'b', 'c']},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().scaleType).to.deep.equal({x: 'linear', y: 'ordinal'});
  });

  // todo: fix this (only matters in edge case)
  // it('infers scaleType from children getScaleType', () => {
  //   const props = {
  //     width, height,
  //     domain: {x: [12, 22], y: [2, 3]},
  //     margin: {top: 11, bottom: 22, left: 33, right: 44}
  //   };
  //
  //   const tree = <XYContainerChart {...props}><XYChartWithCustomScaleType a="1"/></XYContainerChart>;
  //   const wrapped = mount(tree);
  //   const rendered = wrapped.find(ContainerChart);
  //
  //   console.log(rendered.props());
  //   expect(rendered.props().scaleType).to.deep.equal(customScaleType);
  // });

  it('infers scaleType from children data', () => {
    const props = {
      width, height,
      domain: {x: [12, 22], y: ['a', 'b', 'c']},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getX: 0,
      getY: 1
    };

    const tree = <XYContainerChart {...props}><XYChart {...chartProps}/></XYContainerChart>;
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().scaleType).to.deep.equal({x: 'linear', y: 'ordinal'});
  });


  it('infers domain from Component.getDomain', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = mount(<XYChartWithCustomDomain {...props} />);
    const rendered = wrapped.find(ChartWithCustomDomain);

    expect(rendered.props().domain).to.deep.equal(customDomain);
  });

  it('infers domain from data', () => {
    const props = {
      width, height,
      // thing: 'yes',
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getX: 0,
      getY: 1,
      scaleType: {x: 'linear', y: 'ordinal'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().domain.x).to.deep.equal([12, 22]);
    expect(rendered.props().domain.y).to.deep.equal(['a', 'b', 'c']);
  });

  it('infers domain from children getDomain', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const tree = <XYContainerChart {...props}><XYChartWithCustomDomain /></XYContainerChart>;
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().domain).to.deep.equal(customDomain);
  });

  it('infers domain from children data', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };
    const tree = <XYContainerChart {...props}>
      <XYChart data={[[0, 2], [3, 5]]} getX={0} getY={1} />
      <XYChart data={[[-2, 0], [2, 4]]} getX={0} getY={1} />
    </XYContainerChart>;
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().domain.x).to.deep.equal([-2, 3]);
    expect(rendered.props().domain.y).to.deep.equal([0, 5]);
  });


  it('infers margin from Component.getMargin', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const wrapped = mount(<XYChartWithCustomMargin {...props} />);
    const rendered = wrapped.find(ChartWithCustomMargin);
    expect(rendered.props().margin).to.deep.equal(customMargin);
  });

  it('infers margin from children getMargin', () => {
    const props = {
      width, height,
      scaleType: {x: 'linear', y: 'linear'},
      domain: {x: [-50, 50], y: [-100, 100]}
    };
    const tree = <XYContainerChart {...props}><XYChartWithCustomMargin /></XYContainerChart>;
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().margin).to.deep.equal(customMargin);
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
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().margin).to.deep.equal({top: 20, bottom: 40, left: 30, right: 50});
  });


  it('infers scaleType & domain from data, margin from getMargin', () => {
    const containerProps = {width, height};
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      getX: 0,
      getY: 1
    };
    const tree = <XYContainerChart {...containerProps}>
      <XYChartWithCustomMargin {...chartProps} />
    </XYContainerChart>;
    const wrapped = mount(tree);
    const rendered = wrapped.find(ChartWithCustomMargin);

    expect(rendered.props().margin).to.deep.equal(customMargin);
    expect(rendered.props().scaleType).to.deep.equal({x: 'linear', y: 'ordinal'});
    expect(rendered.props().domain.x).to.deep.equal([12, 22]);
    expect(rendered.props().domain.y).to.deep.equal(['a', 'b', 'c']);
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
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().margin).to.deep.equal(customMargin);
    expect(rendered.props().scaleType).to.deep.equal({x: 'linear', y: 'linear'});
    expect(rendered.props().domain.x).to.deep.equal([-12, 12]);
    expect(rendered.props().domain.y).to.deep.equal([-12, 12]);
  });

  it('inverts the scale domain if `invertScale` option is true', () => {
    const props = {
      width, height,
      domain: {x: [-3, 3], y: [0, 10]},
      scaleType: {x: 'linear', y: 'linear'},
      margin: {top: 11, bottom: 22, left: 33, right: 44}
    };

    const invertXChart = mount(<XYChart {...props} {...{invertScale: {x: true, y: false}}} />).find(Chart);
    expect(invertXChart.props().domain.x).to.deep.equal([3, -3]);
    expect(invertXChart.props().domain.y).to.deep.equal([0, 10]);

    const invertYChart = mount(<XYChart {...props} {...{invertScale: {x: false, y: true}}} />).find(Chart);
    expect(invertYChart.props().domain.x).to.deep.equal([-3, 3]);
    expect(invertYChart.props().domain.y).to.deep.equal([10, 0]);
  });
  
  // todo test resolving scaleType from domains

  // todo spacing/padding
  // todo test tickCount
  // todo includeZero?

  // todo test combining multiple scaletypes/domains/margins from children
  // todo test partially specified scaletype
  // todo test partially specified margins
  // todo test partially specified scales
  // todo test partially specified domains
  // todo: test with thin layers of components (w/o getDomain) in between?
  // todo: test when one scale or domain is passed but not the other?
});
