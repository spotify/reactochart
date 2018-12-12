import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import { expect } from "chai";
import { mount } from "enzyme";

import { XGrid, XLine } from "../../../src/index.js";
import { getScaleTicks, getTickDomain } from "../../../src/utils/Scale";

describe("XGrid", () => {
  const props = {
    height: 10,
    spacingTop: 10,
    spacingBottom: 10,
    spacingLeft: 10,
    spacingRight: 10,
    lineClassName: "xgrid-line-class",
    lineStyle: { stroke: "blue" },
    xScale: d3.scaleLinear().domain([0, 100])
  };

  it("passes props correctly to XLine", () => {
    const xGrid = mount(<XGrid {...props} />);
    const xLines = xGrid.find(XLine);
    const group = xGrid.find("g");

    expect(group).to.have.lengthOf(1);
    expect(group.getDOMNode().className).to.equal("rct-chart-grid-x");
 
    xLines.forEach(xLine => {
      const xLineProps = xLine.props();

      expect(xLineProps.className).to.contain(props.lineClassName);
      expect(xLineProps.style).to.equal(props.lineStyle);
      expect(xLineProps.spacingTop).to.equal(props.spacingTop);
      expect(xLineProps.spacingBottom).to.equal(props.spacingBottom);
      expect(xLineProps.spacingLeft).to.equal(props.spacingLeft);
      expect(xLineProps.spacingRight).to.equal(props.spacingRight);
      expect(xLineProps.xScale).to.equal(props.xScale);
      expect(xLineProps.height).to.equal(props.height);
    });
  });

  it("renders the correct amount of XLines given tickCount", () => {
    const tickCount = 50;
    const xGrid = mount(<XGrid {...props} tickCount={tickCount} />);
    const group = xGrid.find("g");

    expect(group).to.have.lengthOf(1);
    expect(group.getDOMNode().className).to.equal("rct-chart-grid-x");

    const xLines = xGrid.find(XLine);
    const numTicksMade = getScaleTicks(props.xScale, null, tickCount);

    expect(xLines).to.have.lengthOf(numTicksMade.length);
  });

  it("renders the correct amount of XLines given ticks", () => {
    const ticks = [0, 25, 50, 100];
    const xGrid = mount(<XGrid {...props} ticks={ticks} />);
    const group = xGrid.find("g");

    expect(group).to.have.lengthOf(1);
    expect(group.getDOMNode().className).to.equal("rct-chart-grid-x");

    const xLines = xGrid.find(XLine);
    expect(xLines).to.have.lengthOf(ticks.length);
  });

  it("getTickDomain works as expected", () => {
    const ticks = [0, 25, 50, 100];

    const result = getTickDomain(props.xScale, { ...props, ticks });

    expect(XGrid.getTickDomain({ ...props, ticks })).to.eql({
      xTickDomain: result
    });
  });
});
