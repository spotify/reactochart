import { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import {
  LineChart,
  XYPlot,
  YAxis,
  YAxisLabels,
  YAxisTitle,
  YGrid,
  YTicks
} from "src/index.js";

// YAxis tests must run in browser since YAxis uses measureText

describe("YAxis", () => {
  const width = 500;
  const height = 300;

  it("extends the scale domain if to include custom `ticks` if passed", () => {
    const props = {
      width,
      height,
      scaleType: { x: "linear", y: "linear" },
      margin: { top: 11, bottom: 22, left: 33, right: 44 }
    };

    const tree = (
      <XYPlot {...props}>
        <LineChart data={[[0, 0], [10, 10]]} x={d => d[0]} y={d => d[1]} />
        <YAxis ticks={[-5, 0, 5]} />
      </XYPlot>
    );
    const rendered = mount(tree).find(YAxis);
    expect(rendered.props().xDomain).to.deep.equal([0, 10]);
    expect(rendered.props().yDomain).to.deep.equal([-5, 10]);
  });

  it("rounds domain to nice numbers if `nice` option is true", () => {
    const props = {
      width,
      height,
      scaleType: { x: "linear", y: "linear" },
      margin: { top: 11, bottom: 22, left: 33, right: 44 }
    };

    const niceXChart = mount(
      <XYPlot {...props}>
        <LineChart
          data={[[0.3, 0.8], [9.2, 9.7]]}
          x={d => d[0]}
          y={d => d[1]}
        />
        <YAxis nice={true} />
      </XYPlot>
    ).find(LineChart);

    expect(niceXChart.props().xDomain).to.deep.equal([0.3, 9.2]);
    expect(niceXChart.props().yDomain).to.deep.equal([0, 10]);
  });
  it("renders every part of the yAxis", () => {
    const props = {
      width,
      height,
      scaleType: { x: "linear", y: "linear" },
      margin: { top: 11, bottom: 22, left: 33, right: 44 }
    };

    const tree = (
      <XYPlot {...props} xDomain={[0, 10]} yDomain={[0, 10]}>
        <LineChart data={[[0, 0], [10, 10]]} x={d => d[0]} y={d => d[1]} />
        <YAxis ticks={[-5, 0, 5]} />
      </XYPlot>
    );
    const rendered = mount(tree);
    const lineChart = rendered
      .find(YAxis)
      .childAt(4)
      .props();
    expect(rendered.find(YGrid).props().ticks).to.have.length(3);
    expect(rendered.find(YAxisLabels)).to.have.length(1);
    expect(rendered.find(YAxisTitle)).to.have.length(1);
    expect(rendered.find(YTicks)).to.have.length(1);
    expect(lineChart.className).to.equal(
      "rct-chart-axis-line rct-chart-axis-line-y"
    );
    expect(lineChart.x1).to.be.a("number");
    expect(lineChart.x2).to.be.a("number");
    expect(lineChart.y1).to.be.a("number");
    expect(lineChart.y2).to.be.a("number");
  });
});
