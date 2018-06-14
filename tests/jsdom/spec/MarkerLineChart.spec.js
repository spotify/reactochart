import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";

import { MarkerLineChart } from "../../../src/index.js";

describe("MarkerLineChart", () => {
  const props = {
    xScale: d3.scaleLinear().domain([0, 30]),
    yScale: d3.scaleLinear().domain([0, 1]),
    data: _.range(30),
    x: d => d,
    y: d => d + 5,
    lineClassName: "my-line",
    lineStyle: { fill: "blue" },
    onMouseEnterLine: sinon.spy(),
    onMouseMoveLine: sinon.spy(),
    onMouseLeaveLine: sinon.spy()
  };

  it("passes props correctly to line elements", () => {
    let chart = mount(<MarkerLineChart {...props} />);
    let lines = chart.find("line");

    lines.forEach(line => {
      expect(line.props().className).to.contain(props.lineClassName);
      expect(line.props().style).to.equal(props.lineStyle);
    });

    // test with xEnd and yEnd
    chart = mount(<MarkerLineChart {...props} xEnd={d => d + 10} />);
    lines = chart.find("line");

    lines.forEach(line => {
      expect(line.props().className).to.contain(props.lineClassName);
      expect(line.props().style).to.equal(props.lineStyle);
    });

    // test with xEnd and yEnd
    chart = mount(
      <MarkerLineChart {...props} horizontal={true} yEnd={d => d + 10} />
    );
    lines = chart.find("line");

    lines.forEach(line => {
      expect(line.props().className).to.contain(props.lineClassName);
      expect(line.props().style).to.equal(props.lineStyle);
    });
  });

  it("renders the correct amount of group and line elements and has proper width/height", () => {
    let chart = mount(<MarkerLineChart {...props} />);
    let lines = chart.find("line");
    let group = chart.find("g");

    expect(group).to.have.lengthOf(1);
    expect(lines).to.have.lengthOf(props.data.length);
    lines.forEach(line => {
      expect(Math.abs(line.props().x2 - line.props().x1)).to.equal(10);
    });

    // test with xEnd and yEnd
    const xEnd = d => d + 10;
    chart = mount(<MarkerLineChart {...props} xEnd={xEnd} />);
    lines = chart.find("line");

    lines.forEach((line, idx) => {
      let d = props.data[idx];
      let difference = Math.abs(
        props.xScale(props.x(d)) - props.xScale(xEnd(d))
      );

      expect(Math.abs(line.props().x2 - line.props().x1)).to.equal(difference);
    });

    const yEnd = d => d + 10;
    chart = mount(<MarkerLineChart {...props} horizontal={true} yEnd={yEnd} />);
    lines = chart.find("line");

    lines.forEach((line, idx) => {
      let d = props.data[idx];
      let difference = Math.abs(
        props.yScale(props.y(d)) - props.yScale(yEnd(d))
      );

      expect(Math.abs(line.props().y2 - line.props().y1)).to.equal(difference);
    });
  });

  it("triggers event handlers", () => {
    const chart = mount(<MarkerLineChart {...props} />);
    const line = chart.find("line").first();

    expect(props.onMouseMoveLine).not.to.have.been.called;
    line.simulate("mousemove");
    expect(props.onMouseMoveLine).to.have.been.called;
    expect(props.onMouseEnterLine).not.to.have.been.called;
    line.simulate("mouseenter");
    expect(props.onMouseEnterLine).to.have.been.called;
    expect(props.onMouseLeaveLine).not.to.have.been.called;
    line.simulate("mouseleave");
    expect(props.onMouseLeaveLine).to.have.been.called;
  });
});
