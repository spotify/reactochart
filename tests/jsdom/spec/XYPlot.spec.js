import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";

import { XYPlot } from "../../../src/index.js";

describe("XYPlot", () => {
  const commonXYProps = {
    xDomain: [0, 10],
    yDomain: [0, 100],
    xyPlotClassName: "xy-plot",
    onMouseMove: sinon.spy(),
    onMouseEnter: sinon.spy(),
    onMouseLeave: sinon.spy(),
    onMouseDown: sinon.spy(),
    onMouseUp: sinon.spy()
  };

  it("renders SVG with given width, height and className (or a default)", () => {
    const chart = mount(<XYPlot width={600} height={800} {...commonXYProps} />);
    const svg = chart.find("svg");

    expect(svg.getDOMNode().className).to.contain(
      commonXYProps.xyPlotClassName
    );

    const node = svg.getNode();
    expect(node.tagName.toLowerCase()).to.equal("svg");
    expect(node.getAttribute("width")).to.equal("600");
    expect(node.getAttribute("height")).to.equal("800");

    const chart2 = mount(<XYPlot {...commonXYProps} />);
    const node2 = chart2.find("svg").getNode();
    expect(node2.tagName.toLowerCase()).to.equal("svg");
    expect(parseInt(node2.getAttribute("width")))
      .to.be.a("number")
      .and.to.be.above(0);
    expect(parseInt(node2.getAttribute("height")))
      .to.be.a("number")
      .and.to.be.above(0);
  });

  it("renders inner chart area with given margin", () => {
    const size = 400;
    const margin = {
      marginTop: 10,
      marginBottom: 20,
      marginLeft: 30,
      marginRight: 40
    };
    const chart = mount(
      <XYPlot width={size} height={size} {...margin} {...commonXYProps} />
    );
    const inner = chart.find(".rct-chart-inner").getNode();
    const bg = chart.find(".rct-plot-background").getNode();
    expect(inner.getAttribute("transform").replace(/\s/, "")).to.contain(
      `translate(${margin.marginLeft},${margin.marginTop})`
    );
    expect(parseInt(bg.getAttribute("width"))).to.equal(
      size - (margin.marginLeft + margin.marginRight)
    );
    expect(parseInt(bg.getAttribute("height"))).to.equal(
      size - (margin.marginTop + margin.marginBottom)
    );
  });

  it("triggers event handlers", () => {
    const chart = mount(<XYPlot {...commonXYProps} />);
    expect(chart.props().onMouseMove).not.to.have.been.called;
    chart.simulate("mousemove");
    expect(chart.props().onMouseMove).to.have.been.called;
    expect(chart.props().onMouseEnter).not.to.have.been.called;
    chart.simulate("mouseenter");
    expect(chart.props().onMouseEnter).to.have.been.called;
    expect(chart.props().onMouseLeave).not.to.have.been.called;
    chart.simulate("mouseleave");
    expect(chart.props().onMouseLeave).to.have.been.called;
    expect(chart.props().onMouseDown).not.to.have.been.called;
    chart.simulate("mousedown");
    expect(chart.props().onMouseDown).to.have.been.called;
    expect(chart.props().onMouseUp).not.to.have.been.called;
    chart.simulate("mouseup");
    expect(chart.props().onMouseUp).to.have.been.called;
  });
});
