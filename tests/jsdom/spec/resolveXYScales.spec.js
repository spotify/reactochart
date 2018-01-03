import _ from "lodash";
import React from "react";
import * as d3 from "d3";
import {expect} from "chai";
import {mount, shallow} from "enzyme";

import {isValidScale} from "../../../src/utils/Scale";
import {innerRangeX, innerRangeY} from "../../../src/utils/Margin";

import resolveXYScales from "../../../src/utils/resolveXYScales";

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
  expect(scales).to.be.an("object");
  ["x", "y"].forEach(k => {
    expect(scales).to.have.property(k);
    expect(isValidScale(scales[k])).to.equal(true);
  });
}

function expectXYScaledComponent(rendered, {width, height, scaleType, domain, margin, range}) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {x: innerRangeX(width, margin), y: innerRangeY(height, margin)};
  expect(scaleType).to.be.an("object");
  console.log("expected domains", domain);
  console.log("expected range", range);

  expect(rendered.props).to.be.an("object");
  expect(rendered.props.margin).to.deep.equal(margin);

  const renderedScale = rendered.props.scale;
  expectXYScales(renderedScale);
  ["x", "y"].forEach(k => {
    expect(rendered.props.scaleType[k]).to.equal(scaleType[k]);
    console.log("domain", renderedScale[k].domain());
    console.log("expected domain", domain[k]);
    expect(renderedScale[k].domain()).to.deep.equal(domain[k]);
    if (scaleType[k] === "ordinal")
      expect(renderedScale[k].range()).to.deep.equal(
        d3
          .scaleOrdinal()
          .domain(domain[k])
          .rangePoints(range[k])
          .range()
      );
    else expect(renderedScale[k].range()).to.deep.equal(range[k]);
  });
}

function expectXYScaledComponentEnzyme(rendered, {width, height, scaleType, domain, margin, range}) {
  // checks that a given rendered component has been created with XY scales/margin
  // that match the expected domain, range & margin
  // if range not provided, it should be width/height minus margins
  range = range || {x: innerRangeX(width, margin), y: innerRangeY(height, margin)};
  expect(scaleType).to.be.an("object");

  expect(rendered.props().margin).to.deep.equal(margin);

  console.log("renderedprops", rendered.props());
  const renderedScale = rendered.props().scale;
  expectXYScales(renderedScale);
  ["x", "y"].forEach(k => {
    expect(rendered.props().scaleType[k]).to.equal(scaleType[k]);
    console.log("domain", renderedScale[k].domain());
    console.log("expected domain", domain[k]);
    expect(renderedScale[k].domain()).to.deep.equal(domain[k]);
    if (scaleType[k] === "ordinal")
      expect(renderedScale[k].range()).to.deep.equal(
        d3
          .scaleOrdinal()
          .domain(domain[k])
          .rangePoints(range[k])
          .range()
      );
    else expect(renderedScale[k].range()).to.deep.equal(range[k]);
  });
}

describe("resolveXYScales", () => {
  const customScaleType = {xScaleType: "ordinal", yScaleType: "linear"};
  const customDomain = {xDomain: [-5, 5], yDomain: [0, 10]};
  const customMargin = {marginTop: 10, marginBottom: 20, marginLeft: 30, marginRight: 40};
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
        yDomain
      } = this.props;
      const newChildren = React.Children.map(this.props.children, (child, i) => {
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
          yDomain
        });
      });
      return <div>{newChildren}</div>;
    }
  }
  const XYContainerChart = resolveXYScales(ContainerChart);
  //
  // const XYChartWithObjectProps = resolveObjectProps(resolveXYScales(Chart),
  //   ['domain', 'scale', 'scaleType'], ['x', 'y']
  // );
  // const XYChartWithCustomMarginAndObjectProps = resolveObjectProps(resolveXYScales(ChartWithCustomMargin),
  //   ['domain', 'scale', 'scaleType'], ['x', 'y']
  // );
  // const XYContainerChartWithObjectProps = resolveObjectProps(resolveXYScales(ContainerChart),
  //   ['domain', 'scale', 'scaleType'], ['x', 'y']
  // );

  it("passes XY scales and margins through if both are provided", () => {
    const props = {
      xScale: d3
        .scaleLinear()
        .domain([-1, 1])
        .range([0, 400]),
      yScale: d3
        .scaleLinear()
        .domain([-2, 2])
        .range([10, 300]),
      marginTop: 11,
      marginBottom: 21,
      marginLeft: 31,
      marginRight: 41
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    ["xScale", "yScale", "marginTop", "marginBottom", "marginLeft", "marginRight"].forEach(propKey => {
      expectRefAndDeepEqual(rendered.props()[propKey], props[propKey]);
    });
  });

  it("creates scales from scaleType, size, domain & margins", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "ordinal",
      xDomain: [-50, 50],
      yDomain: [-100, 100],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);
    const renderedXScale = rendered.props().xScale;
    const renderedYScale = rendered.props().yScale;

    // expectXYScales(renderedScale);
    expect(isValidScale(renderedXScale)).to.equal(true);
    expect(isValidScale(renderedYScale)).to.equal(true);
    expect(renderedXScale.domain()).to.deep.equal(props.xDomain);
    expect(renderedYScale.domain()).to.deep.equal(props.yDomain);
    expect(renderedXScale.range()).to.deep.equal([0, width - (props.marginLeft + props.marginRight)]);
    expect(renderedYScale.range()).to.deep.equal([height - (props.marginTop + props.marginBottom), 0]);
  });

  it("infers scaleType from Component.getScaleType", () => {
    const props = {
      width,
      height,
      xDomain: [-50, 50],
      yDomain: [-100, 100],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };

    const wrapped = mount(<XYChartWithCustomScaleType {...props} />);
    const rendered = wrapped.find(ChartWithCustomScaleType);

    expect(rendered.props().xScaleType).to.equal(customScaleType.xScaleType);
    expect(rendered.props().yScaleType).to.equal(customScaleType.yScaleType);
  });

  it("infers scaleType from data", () => {
    const props = {
      width,
      height,
      data: [[12, "a"], [18, "b"], [22, "c"]],
      x: d => d[0],
      y: d => d[1],
      xDomain: [12, 22],
      yDomain: ["a", "b", "c"],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };

    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().xScaleType).to.equal("linear");
    expect(rendered.props().yScaleType).to.deep.equal("ordinal");
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

  it("infers scaleType from children data", () => {
    const props = {
      width,
      height,
      xDomain: [12, 22],
      yDomain: ["a", "b", "c"],
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };
    const chartProps = {
      data: [[12, "a"], [18, "b"], [22, "c"]],
      x: d => d[0],
      y: d => d[1]
    };

    const tree = (
      <XYContainerChart {...props}>
        <XYChart {...chartProps} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().xScaleType).to.equal("linear");
    expect(rendered.props().yScaleType).to.deep.equal("ordinal");
  });

  it("infers domain from Component.getDomain", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };
    const wrapped = mount(<XYChartWithCustomDomain {...props} />);
    const rendered = wrapped.find(ChartWithCustomDomain);

    expect(rendered.props().xDomain).to.deep.equal(customDomain.xDomain);
    expect(rendered.props().yDomain).to.deep.equal(customDomain.yDomain);
  });

  it("infers domain from data", () => {
    const props = {
      width,
      height,
      data: [[12, "a"], [18, "b"], [22, "c"]],
      x: d => d[0],
      y: d => d[1],
      xScaleType: "linear",
      yScaleType: "ordinal",
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };
    const wrapped = mount(<XYChart {...props} />);
    const rendered = wrapped.find(Chart);

    expect(rendered.props().xDomain).to.deep.equal([12, 22]);
    expect(rendered.props().yDomain).to.deep.equal(["a", "b", "c"]);
  });

  it("infers domain from children getDomain", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChartWithCustomDomain />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().xDomain).to.deep.equal(customDomain.xDomain);
    expect(rendered.props().yDomain).to.deep.equal(customDomain.yDomain);
  });

  it("infers domain from children data", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChart data={[[0, 2], [3, 5]]} x={d => d[0]} y={d => d[1]} />
        <XYChart data={[[-2, 0], [2, 4]]} x={d => d[0]} y={d => d[1]} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);

    expect(rendered.props().xDomain).to.deep.equal([-2, 3]);
    expect(rendered.props().yDomain).to.deep.equal([0, 5]);
  });

  it("infers margin from Component.getMargin", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      xDomain: [-50, 50],
      yDomain: [-100, 100]
    };
    const wrapped = mount(<XYChartWithCustomMargin {...props} />);
    const rendered = wrapped.find(ChartWithCustomMargin);
    expect(rendered.props().marginTop).to.equal(customMargin.marginTop);
    expect(rendered.props().marginBottom).to.equal(customMargin.marginBottom);
    expect(rendered.props().marginLeft).to.equal(customMargin.marginLeft);
    expect(rendered.props().marginRight).to.equal(customMargin.marginRight);
  });

  it("infers margin from children getMargin", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      xDomain: [-50, 50],
      yDomain: [-100, 100]
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChartWithCustomMargin />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().marginTop).to.equal(customMargin.marginTop);
    expect(rendered.props().marginBottom).to.equal(customMargin.marginBottom);
    expect(rendered.props().marginLeft).to.equal(customMargin.marginLeft);
    expect(rendered.props().marginRight).to.equal(customMargin.marginRight);
  });

  it("infers margin from children margin props", () => {
    const props = {
      width,
      height,
      xScaleType: "linear",
      yScaleType: "linear",
      xDomain: [-50, 50],
      yDomain: [-100, 100]
    };
    const tree = (
      <XYContainerChart {...props}>
        <XYChart marginTop={20} marginLeft={10} />
        <XYChart marginBottom={40} marginLeft={30} marginRight={50} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ContainerChart);
    expect(rendered.props().marginTop).to.equal(20);
    expect(rendered.props().marginBottom).to.equal(40);
    expect(rendered.props().marginLeft).to.equal(30);
    expect(rendered.props().marginRight).to.equal(50);
  });

  it("infers scaleType & domain from data, margin from getMargin", () => {
    const containerProps = {width, height};
    const chartProps = {
      data: [[12, "a"], [18, "b"], [22, "c"]],
      x: d => d[0],
      y: d => d[1]
    };
    const tree = (
      <XYContainerChart {...containerProps}>
        <XYChartWithCustomMargin {...chartProps} />
      </XYContainerChart>
    );
    const wrapped = mount(tree);
    const rendered = wrapped.find(ChartWithCustomMargin);

    expect(rendered.props().marginTop).to.equal(customMargin.marginTop);
    expect(rendered.props().marginBottom).to.equal(customMargin.marginBottom);
    expect(rendered.props().marginLeft).to.equal(customMargin.marginLeft);
    expect(rendered.props().marginRight).to.equal(customMargin.marginRight);
    expect(rendered.props().xScaleType).to.equal("linear");
    expect(rendered.props().yScaleType).to.equal("ordinal");
    expect(rendered.props().xDomain).to.deep.equal([12, 22]);
    expect(rendered.props().yDomain).to.deep.equal(["a", "b", "c"]);
  });

  // it('works with resolveObjectProps', () => {
  //   const containerProps = {
  //     width, height,
  //     domain: [-12, 12],
  //     scaleType: 'linear'
  //   };
  //   const tree = <XYContainerChartWithObjectProps {...containerProps}>
  //     <XYChartWithCustomMarginAndObjectProps />
  //   </XYContainerChartWithObjectProps>;
  //   const wrapped = mount(tree);
  //   const rendered = wrapped.find(ContainerChart);
  //
  //   expect(rendered.props().margin).to.deep.equal(customMargin);
  //   expect(rendered.props().scaleType).to.deep.equal({x: 'linear', y: 'linear'});
  //   expect(rendered.props().domain.x).to.deep.equal([-12, 12]);
  //   expect(rendered.props().domain.y).to.deep.equal([-12, 12]);
  // });

  it("inverts the scale domain if `invertScale` option is true", () => {
    const props = {
      width,
      height,
      xDomain: [-3, 3],
      yDomain: [0, 10],
      xScaleType: "linear",
      yScaleType: "linear",
      marginTop: 11,
      marginBottom: 22,
      marginLeft: 33,
      marginRight: 44
    };

    const invertXChart = mount(<XYChart {...props} invertXScale={true} />).find(Chart);
    expect(invertXChart.props().xDomain).to.deep.equal([3, -3]);
    expect(invertXChart.props().yDomain).to.deep.equal([0, 10]);

    const invertYChart = mount(<XYChart {...props} invertYScale={true} />).find(Chart);
    expect(invertYChart.props().xDomain).to.deep.equal([-3, 3]);
    expect(invertYChart.props().yDomain).to.deep.equal([10, 0]);
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
