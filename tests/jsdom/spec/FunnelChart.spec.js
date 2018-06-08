import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";

import { FunnelChart } from "../../../src/index.js";
import { getValue } from "../../../src/utils/Data.js";

describe("FunnelChart", () => {
  const funnelData = [
    { observation: 1, value: 100 },
    { observation: 2, value: 85 },
    { observation: 3, value: 42 },
    { observation: 4, value: 37 },
    { observation: 5, value: 12 }
  ];

  const props = {
    data: funnelData,
    x: d => d.value,
    y: d => d.observation,
    pathClassName: "path-class",
    horizontal: true,
    xScale: d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range([0, 30]),
    yScale: d3
      .scaleLinear()
      .domain([0, 10])
      .range([0, 30]),
    pathStyle: { fill: "yellow" }
  };

  it("renders a funnel chart", () => {
    const chart = mount(<FunnelChart {...props} />);
    const group = chart.find("g.rct-funnel-chart");
    expect(group).to.have.length(1);
    expect(group.find("path")).to.have.length(props.data.length - 1);

    group.find("path").forEach(path => {
      const pathD = path.getNode().getAttribute("d");

      expect(pathD).not.to.include("NaN");
    });

    const lastPath = group.find("path").last();
    const pathData = lastPath.getNode().getAttribute("d");
    expect(pathData).to.equal("M1140,12L390,15L-330,15L-1080,12Z");
  });

  it("passes props correctly", () => {
    const chart = mount(<FunnelChart {...props} />);
    const lastPath = chart.find("path").last();
    expect(lastPath.props().className).to.include(props.pathClassName);
    expect(lastPath.props().style).to.contain(props.pathStyle);
    expect(lastPath.props().d).to.be.a("string");
  });
});
