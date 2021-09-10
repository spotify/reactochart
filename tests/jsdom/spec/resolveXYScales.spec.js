import React from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { mount } from 'enzyme';

import { isValidScale } from '../../../src/utils/Scale';
import { innerRangeX, innerRangeY } from '../../../src/utils/Margin';

import resolveXYScales from '../../../src/utils/resolveXYScales';

function expectRefAndDeepEqual(a, b) {
  expect(a).toBe(b);
  expect(a).toEqual(b);
}

function expectXYScales(scales) {
  expect(scales).toBeInstanceOf('object');
  ['x', 'y'].forEach(k => {
    expect(scales).toHaveProperty(k);
    expect(isValidScale(scales[k])).toEqual(true);
  });
}

function expectXYScaledComponent(
  rendered,
  { width, height, scaleType, domain, margin, range },
) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {
    x: innerRangeX(width, margin),
    y: innerRangeY(height, margin),
  };
  expect(scaleType).toBeInstanceOf('object');
  console.log('expected domains', domain);
  console.log('expected range', range);

  expect(rendered.props).toBeInstanceOf('object');
  expect(rendered.props.margin).toEqual(margin);

  const renderedScale = rendered.props.scale;
  expectXYScales(renderedScale);
  ['x', 'y'].forEach(k => {
    expect(rendered.props.scaleType[k]).toEqual(scaleType[k]);
    console.log('domain', renderedScale[k].domain());
    console.log('expected domain', domain[k]);
    expect(renderedScale[k].domain()).toEqual(domain[k]);
    if (scaleType[k] === 'ordinal')
      expect(renderedScale[k].range()).toEqual(
        scaleOrdinal()
          .domain(domain[k])
          .rangePoints(range[k])
          .range(),
      );
    else expect(renderedScale[k].range()).toEqual(range[k]);
  });
}

function expectXYScaledComponentEnzyme(
  rendered,
  { width, height, scaleType, domain, margin, range },
) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {
    x: innerRangeX(width, margin),
    y: innerRangeY(height, margin),
  };
  expect(scaleType).toBeInstanceOf('object');

  expect(rendered.props().margin).toEqual(margin);

  const renderedScale = rendered.props().scale;
  expectXYScales(renderedScale);
  ['x', 'y'].forEach(k => {
    expect(rendered.props().scaleType[k]).toEqual(scaleType[k]);
    console.log('domain', renderedScale[k].domain());
    console.log('expected domain', domain[k]);
    expect(renderedScale[k].domain()).toEqual(domain[k]);
    if (scaleType[k] === 'ordinal')
      expect(renderedScale[k].range()).toEqual(
        scaleOrdinal()
          .domain(domain[k])
          .rangePoints(range[k])
          .range(),
      );
    else expect(renderedScale[k].range()).toEqual(range[k]);
  });
}

describe('resolveXYScales', () => {
  const customScaleType = { xScaleType: 'ordinal', yScaleType: 'linear' };
  const customDomain = { xDomain: [-5, 5], yDomain: [0, 10] };
  const customMargin = {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 40,
  };
  const width = 500;
  const height = 400;

  // test fixture component classes
  class ComponentWithChildren extends React.Component {
    render() {
      return <div>{this.props.children}</div>;
    }
  }

  class Chart extends ComponentWithChildren {}
  const XYChart = resolveXYScales(Chart);

  class ChartWithCustomScaleType extends ComponentWithChildren {
    static getScaleType(props) {
      return customScaleType;
    }
  }
  const XYChartWithCustomScaleType = resolveXYScales(ChartWithCustomScaleType);

  class ChartWithCustomDomain extends ComponentWithChildren {
    static getDomain(props) {
      return customDomain;
    }
  }
  const XYChartWithCustomDomain = resolveXYScales(ChartWithCustomDomain);

  class ChartWithCustomMargin extends ComponentWithChildren {
    static getMargin(props) {
      return customMargin;
    }
  }
  const XYChartWithCustomMargin = resolveXYScales(ChartWithCustomMargin);

  class ContainerChart extends React.Component {
    render() {
      const {
        width,
        height,
        xScale,
        yScale,
        xScaleType,
        yScaleType,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        xDomain,
        yDomain,
      } = this.props;
      const newChildren = React.Children.map(
        this.props.children,
        (child, i) => {
          return React.cloneElement(child, {
            width,
            height,
            xScale,
            yScale,
            xScaleType,
            yScaleType,
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
            xDomain,
            yDomain,
          });
        },
      );
      return <div>{newChildren}</div>;
    }
  }
  const XYContainerChart = resolveXYScales(ContainerChart);

  it('passes XY scales and margins through if both are provided', () => {
    const props = {
      xScale: scaleLinear()
        .domain([-1, 1])
        .range([0, 400]),
      yScale: scaleLinear()
        .domain([-2, 2])
        .range([10, 300]),
      marginTop: 11,
      marginBottom: 21,
      marginLeft: 31,
      marginRight: 41,
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    [
      'xScale',
      'yScale',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
    ].forEach(propKey => {
      expectRefAndDeepEqual(rendered.props()[propKey], props[propKey]);
    });
  });

  it('creates scales from scaleType, size, domain & margins', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'ordinal',
      xDomain: [-50, 50],
      yDomain: [-100, 100],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);
    const renderedXScale = rendered.props().xScale;
    const renderedYScale = rendered.props().yScale;

    expect(isValidScale(renderedXScale)).toEqual(true);
    expect(isValidScale(renderedYScale)).toEqual(true);
    expect(renderedXScale.domain()).toEqual(props.xDomain);
    expect(renderedYScale.domain()).toEqual(props.yDomain);
    expect(renderedXScale.range()).toEqual([
      0,
      width - (props.marginLeft + props.marginRight),
    ]);
    expect(renderedYScale.range()).toEqual([
      height - (props.marginTop + props.marginBottom),
      0,
    ]);
  });

  it('infers scaleType from Component.getScaleType', () => {
    const props = {
      width,
      height,
      xDomain: [-50, 50],
      yDomain: [-100, 100],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };

    const wrapped = mount(<XYChartWithCustomScaleType {...props} />);
    const rendered = wrapped.find(ChartWithCustomScaleType);

    expect(rendered.props().xScaleType).toEqual(customScaleType.xScaleType);
    expect(rendered.props().yScaleType).toEqual(customScaleType.yScaleType);
  });

  it('infers scaleType from data', () => {
    const props = {
      width,
      height,
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      x: d => d[0],
      y: d => d[1],
      xDomain: [12, 22],
      yDomain: ['a', 'b', 'c'],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().xScaleType).toEqual('linear');
    expect(rendered.props().yScaleType).toEqual('ordinal');
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
  //   expect(rendered.props().scaleType).toEqual(customScaleType);
  // });

  it('infers scaleType from children data', () => {
    const props = {
      width,
      height,
      xDomain: [12, 22],
      yDomain: ['a', 'b', 'c'],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      x: d => d[0],
      y: d => d[1],
    };

    const tree = (
      <XYContainerChart {...props}>
        <XYChart {...chartProps} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().xScaleType).toEqual('linear');
    expect(rendered.props().yScaleType).toEqual('ordinal');
  });

  it('infers domain from Component.getDomain', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const wrapped = mount(<XYChartWithCustomDomain {...props} />);
    const rendered = wrapped.find(ChartWithCustomDomain);

    expect(rendered.props().xDomain).toEqual(customDomain.xDomain);
    expect(rendered.props().yDomain).toEqual(customDomain.yDomain);
  });

  it('infers domain from data', () => {
    const props = {
      width,
      height,
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      x: d => d[0],
      y: d => d[1],
      xScaleType: 'linear',
      yScaleType: 'ordinal',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().xDomain).toEqual([12, 22]);
    expect(rendered.props().yDomain).toEqual(['a', 'b', 'c']);
  });

  it('infers domain from children getDomain', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChartWithCustomDomain />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().xDomain).toEqual(customDomain.xDomain);
    expect(rendered.props().yDomain).toEqual(customDomain.yDomain);
  });

  it('infers domain from children data', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChart data={[[0, 2], [3, 5]]} x={d => d[0]} y={d => d[1]} />
        <XYChart data={[[-2, 0], [2, 4]]} x={d => d[0]} y={d => d[1]} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().xDomain).toEqual([-2, 3]);
    expect(rendered.props().yDomain).toEqual([0, 5]);
  });

  it('x and y domain includes 0 given inferred domain from children data', () => {
    const props = {
      width,
      height,
      includeXZero: true,
      includeYZero: true,
      xScaleType: 'linear',
      yScaleType: 'linear',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChart data={[[5, 10], [5, 14]]} x={d => d[0]} y={d => d[1]} />
        <XYChart data={[[10, 5], [10, 5]]} x={d => d[0]} y={d => d[1]} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().xDomain).toEqual([0, 10]);
    expect(rendered.props().yDomain).toEqual([0, 14]);
  });

  it('infers margin from Component.getMargin', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      xDomain: [-50, 50],
      yDomain: [-100, 100],
    };
    const wrapped = mount(<XYChartWithCustomMargin {...props} />);
    const rendered = wrapped.find(ChartWithCustomMargin);
    expect(rendered.props().marginTop).toEqual(customMargin.marginTop);
    expect(rendered.props().marginBottom).toEqual(customMargin.marginBottom);
    expect(rendered.props().marginLeft).toEqual(customMargin.marginLeft);
    expect(rendered.props().marginRight).toEqual(customMargin.marginRight);
  });

  it('infers margin from children getMargin', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      xDomain: [-50, 50],
      yDomain: [-100, 100],
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChartWithCustomMargin />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().marginTop).toEqual(customMargin.marginTop);
    expect(rendered.props().marginBottom).toEqual(customMargin.marginBottom);
    expect(rendered.props().marginLeft).toEqual(customMargin.marginLeft);
    expect(rendered.props().marginRight).toEqual(customMargin.marginRight);
  });

  it('infers margin from children margin props', () => {
    const props = {
      width,
      height,
      xScaleType: 'linear',
      yScaleType: 'linear',
      xDomain: [-50, 50],
      yDomain: [-100, 100],
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChart marginTop={20} marginLeft={10} />
        <XYChart marginBottom={40} marginLeft={30} marginRight={50} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().marginTop).toEqual(20);
    expect(rendered.props().marginBottom).toEqual(40);
    expect(rendered.props().marginLeft).toEqual(30);
    expect(rendered.props().marginRight).toEqual(50);
  });

  it('infers scaleType & domain from data, margin from getMargin', () => {
    const containerProps = { width, height };
    const chartProps = {
      data: [[12, 'a'], [18, 'b'], [22, 'c']],
      x: d => d[0],
      y: d => d[1],
    };
    const tree = (
      <XYContainerChart {...containerProps}>
        <XYChartWithCustomMargin {...chartProps} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ChartWithCustomMargin);

    expect(rendered.props().marginTop).toEqual(customMargin.marginTop);
    expect(rendered.props().marginBottom).toEqual(customMargin.marginBottom);
    expect(rendered.props().marginLeft).toEqual(customMargin.marginLeft);
    expect(rendered.props().marginRight).toEqual(customMargin.marginRight);
    expect(rendered.props().xScaleType).toEqual('linear');
    expect(rendered.props().yScaleType).toEqual('ordinal');
    expect(rendered.props().xDomain).toEqual([12, 22]);
    expect(rendered.props().yDomain).toEqual(['a', 'b', 'c']);
  });

  it('inverts the scale domain if `invertScale` option is true', () => {
    const props = {
      width,
      height,
      xDomain: [-3, 3],
      yDomain: [0, 10],
      xScaleType: 'linear',
      yScaleType: 'linear',
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44,
    };

    const invertXChart = mount(<XYChart {...props} invertXScale />).find(Chart);
    expect(invertXChart.props().xDomain).toEqual([3, -3]);
    expect(invertXChart.props().yDomain).toEqual([0, 10]);

    const invertYChart = mount(<XYChart {...props} invertYScale />).find(Chart);
    expect(invertYChart.props().xDomain).toEqual([-3, 3]);
    expect(invertYChart.props().yDomain).toEqual([10, 0]);
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
