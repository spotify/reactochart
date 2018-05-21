import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { expect } from "chai";
import { mount, shallow } from "enzyme";

import { XYPlot, LineChart } from "../../../src/index.js";

const commonXYProps = { xDomain: [0, 10], yDomain: [0, 100] };

describe("XYPlot", () => {
  it("renders SVG with given width & height (or a default)", () => {
    const chart = mount(<XYPlot width={600} height={800} {...commonXYProps} />);
    const node = chart.find("svg").getNode();
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

  // TODO: TEST MOUSE EVENTS! Use sinon.spy()!
});
