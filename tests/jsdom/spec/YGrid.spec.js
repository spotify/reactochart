import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import { expect } from "chai";
import { mount } from "enzyme";

import { YGrid, YLine } from "../../../src/index.js";
import { getScaleTicks, getTickDomain } from "../../../src/utils/Scale";

describe("YGrid", () => {
  const props = {
    width: 10,
    spacingTop: 10,
    spacingBottom: 10,
    spacingLeft: 10,
    spacingRight: 10,
    lineClassName: "ygrid-line-class",
    lineStyle: { stroke: "blue" },
    yScale: d3.scaleLinear().domain([0, 100])
  };

  it("passes props correctly to YLine", () => {
    const yGrid = mount(<YGrid {...props} />);
    const xLines = yGrid.find(YLine);

    xLines.getNodes().forEach(yLine => {
      const yLineProps = yLine.props;

      expect(yLineProps.className).to.contain(props.lineClassName);
      expect(yLineProps.style).to.equal(props.lineStyle);
      expect(yLineProps.spacingTop).to.equal(props.spacingTop);
      expect(yLineProps.spacingBottom).to.equal(props.spacingBottom);
      expect(yLineProps.spacingLeft).to.equal(props.spacingLeft);
      expect(yLineProps.spacingRight).to.equal(props.spacingRight);
      expect(yLineProps.yScale).to.equal(props.yScale);
      expect(yLineProps.width).to.equal(props.width);
    });
  });

  it("renders the correct amount of YLines given tickCount", () => {
    const tickCount = 50;
    const xGrid = mount(<YGrid {...props} tickCount={tickCount} />);
    const group = xGrid.find("g");

    expect(group).to.have.lengthOf(1);
    expect(group.getDOMNode().className).to.equal("rct-chart-grid-y");

    const xLines = xGrid.find(YLine);
    const numTicksMade = getScaleTicks(props.yScale, null, tickCount);

    expect(xLines).to.have.lengthOf(numTicksMade.length);
  });

  it("renders the correct amount of YLines given ticks", () => {
    const ticks = [0, 25, 50, 100];
    const xGrid = mount(<YGrid {...props} ticks={ticks} />);
    const group = xGrid.find("g");

    expect(group).to.have.lengthOf(1);
    expect(group.getDOMNode().className).to.equal("rct-chart-grid-y");

    const xLines = xGrid.find(YLine);
    expect(xLines).to.have.lengthOf(ticks.length);
  });

  it("getTickDomain works as expected", () => {
    const ticks = [0, 25, 50, 100];

    const result = getTickDomain(props.yScale, { ...props, ticks });

    expect(YGrid.getTickDomain({ ...props, ticks })).to.eql({
      yTickDomain: result
    });
  });
});
