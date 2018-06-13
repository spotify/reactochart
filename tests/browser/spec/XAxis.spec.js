import { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import { LineChart, XAxis, XYPlot } from "src/index.js";

// XAxis tests must run in browser since XAxis uses measureText

describe("XAxis", () => {
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
      <XYPlot {...props} xDomain={[0, 10]} yDomain={[0, 10]}>
        <LineChart data={[[0, 0], [10, 10]]} x={d => d[0]} y={d => d[1]} />
        <XAxis ticks={[-5, 0, 5]} />
      </XYPlot>
    );
    const rendered = mount(tree).find(XAxis);

    expect(rendered.props().xDomain).to.deep.equal([-5, 10]);
    expect(rendered.props().yDomain).to.deep.equal([0, 10]);
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
        <XAxis nice={true} />
      </XYPlot>
    ).find(LineChart);

    expect(niceXChart.props().xDomain).to.deep.equal([0, 10]);
    expect(niceXChart.props().yDomain).to.deep.equal([0.8, 9.7]);
  });
});
