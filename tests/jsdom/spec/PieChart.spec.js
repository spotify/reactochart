import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";

import { PieChart } from "../../../src/index.js";

describe("PieChart", () => {
  const props = {
    data: [45, 35, 20],
    radius: 100,
    holeRadius: 50,
    pieSliceClassName: "my-pie-slice",
    centerLabel: "Woot",
    centerLabelClassName: "my-center-label",
    centerLabelStyle: {
      textAnchor: "middle",
      dominantBaseline: "center",
      fill: "blue"
    },
    onMouseEnterSlice: sinon.spy(),
    onMouseMoveSlice: sinon.spy(),
    onMouseLeaveSlice: sinon.spy()
  };

  const markerLineProps = {
    markerLineValue: 20,
    markerLineClassName: "my-marker-line",
    markerLineStyle: {
      fill: "blue"
    },
    onMouseEnterLine: sinon.spy(),
    onMouseMoveLine: sinon.spy(),
    onMouseLeaveLine: sinon.spy()
  };

  it("passes props correctly to path and text elements", () => {
    const chart = mount(<PieChart {...props} {...markerLineProps} />);
    const paths = chart.find("path");
    const text = chart.find("text");

    paths.forEach(path => {
      const className = path.props().className;
      // Check if markerline vs pie slice
      if (className.includes("rct-marker-line")) {
        expect(className).to.contain(markerLineProps.markerLineClassName);
        expect(path.props().style).to.equal(markerLineProps.markerLineStyle);
      } else {
        expect(className).to.contain(props.pieSliceClassName);
      }
    });

    expect(text.props().className).to.contain(props.centerLabelClassName);
    expect(text.props().style).to.eql(props.centerLabelStyle);
  });

  it("correctly calculates width and height given margins", () => {
    const chart = mount(
      <PieChart
        {...props}
        radius={50}
        marginLeft={50}
        marginRight={50}
        marginTop={50}
        marginBottom={50}
      />
    );
    const svg = chart.find("svg");

    expect(svg.props().width).to.equal(200);
    expect(svg.props().height).to.equal(200);
  });

  it("renders correct amount of pie slices, markerlines, text elements", () => {
    let chart = mount(<PieChart {...props} />);
    let paths = chart.find("path");
    const text = chart.find("text");

    expect(paths).to.have.lengthOf(3);
    expect(text).to.have.lengthOf(1);

    chart = mount(<PieChart {...props} {...markerLineProps} />);
    paths = chart.find("path");

    expect(paths).to.have.lengthOf(4);
  });

  it("triggers event handlers", () => {
    const chart = mount(<PieChart {...props} {...markerLineProps} />);
    const paths = chart.find("path");
    const pieSlice = paths.first();
    const markerLine = paths.last();

    // test pie slice
    expect(props.onMouseMoveSlice).not.to.have.been.called;
    pieSlice.simulate("mousemove");
    expect(props.onMouseMoveSlice).to.have.been.called;
    expect(props.onMouseEnterSlice).not.to.have.been.called;
    pieSlice.simulate("mouseenter");
    expect(props.onMouseEnterSlice).to.have.been.called;
    expect(props.onMouseLeaveSlice).not.to.have.been.called;
    pieSlice.simulate("mouseleave");
    expect(props.onMouseLeaveSlice).to.have.been.called;

    // test markerline
    expect(markerLineProps.onMouseMoveLine).not.to.have.been.called;
    markerLine.simulate("mousemove");
    expect(markerLineProps.onMouseMoveLine).to.have.been.called;
    expect(markerLineProps.onMouseEnterLine).not.to.have.been.called;
    markerLine.simulate("mouseenter");
    expect(markerLineProps.onMouseEnterLine).to.have.been.called;
    expect(markerLineProps.onMouseLeaveLine).not.to.have.been.called;
    markerLine.simulate("mouseleave");
    expect(markerLineProps.onMouseLeaveLine).to.have.been.called;
  });

  it("renders slices labels with custom styles and distances", () => {
    const sliceStyle = { color: "red" };
    const chart = mount(
      <PieChart
        {...props}
        getPieSliceLabel={value => `${value}%`}
        pieSliceLabelDistance={20}
        pieSliceLabelStyle={sliceStyle}
      />
    );

    props.data.forEach(value => {
      const textNode = chart.find(`text[children="${value}%"]`);
      expect(textNode.exists()).to.be.true;
      expect(textNode.prop("style")).to.include(sliceStyle);
    });
  });

  it("calls factory props to compute slice label distances and styles", () => {
    const chart = mount(
      <PieChart
        {...props}
        getPieSliceLabel={value => `${value}%`}
        pieSliceLabelDistance={value => value}
        pieSliceLabelStyle={value => ({ fontSize: value })}
      />
    );

    props.data.forEach(value => {
      const textNode = chart.find(`text[children="${value}%"]`);
      expect(textNode.exists()).to.be.true;
      expect(textNode.prop("style")).to.include({ fontSize: value });
    });
  });
});
