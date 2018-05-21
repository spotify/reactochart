import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import { expect } from "chai";
import { mount, shallow } from "enzyme";

import { testWithScales, expectProps } from "../utils";
import { XYPlot, BarChart, RangeBarChart } from "../../../src/index.js";

describe("BarChart", () => {
  it("passes most props through to RangeBarChart", () => {
    // bar chart is just a simple wrapper around RangeBarChart, most props are passed through
    const props = {
      xScale: d3
        .scalePoint()
        .domain(["a", "b", "c"])
        .range([0, 100]),
      yScale: d3
        .scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [["a", 0.25], ["b", 0.5], ["c", 0.67]],
      x: d => d[0],
      y: d => d[1],
      barThickness: 13,
      horizontal: false,
      barClassName: "test-bar-class-name",
      barStyle: { fill: "red" },
      getClass: () => "test",
      onMouseEnterBar: () => "onMouseEnterBar",
      onMouseMoveBar: () => "onMouseMoveBar",
      onMouseLeaveBar: () => "onMouseLeaveBar"
    };

    const chart = mount(<BarChart {...props} />);
    const rangeBarChart = chart.find(RangeBarChart);
    // all props should be passed through as-is *except* y
    expectProps(rangeBarChart, _.omit(props, ["y"]));

    // vertical bar chart - y is passed to RangeBarChart as yEnd
    expect(rangeBarChart.props().yEnd).to.equal(props.y);

    // check that correct props are passed through in horizontal case
    const horizontalProps = { ...props, horizontal: true };

    const horizontalChart = mount(<BarChart {...horizontalProps} />);
    const horizontalRangeBarChart = horizontalChart.find(RangeBarChart);

    // all props should be passed through as-is *except* x
    expectProps(horizontalRangeBarChart, _.omit(horizontalProps, ["x"]));

    // vertical bar chart - x is passed to RangeBarChart as xEnd
    expect(horizontalRangeBarChart.props().xEnd).to.equal(horizontalProps.x);
  });

  it("renders a bar chart with categorical X data & numerical Y data", () => {
    // make simple bar chart with 3 datapoints to make sure it renders correctly
    // this is more of an integration test/sanity check;
    // most tests for render correctness are in RangeBarChart and Bar specs

    testWithScales(
      ["linear", "ordinal"],
      ({ scale: xScale, testValues: xTestValues }) => {
        testWithScales(
          ["linear"],
          ({ scale: yScale, testValues: yTestValues }) => {
            const props = {
              xScale,
              yScale,
              data: _.zip(_.take(xTestValues, 3), _.take(yTestValues, 3)),
              x: d => d[0],
              y: d => d[1],
              barThickness: 10
            };

            const chart = mount(<BarChart {...props} />);
            const group = chart.find("g");
            const bars = chart.find("rect");
            expect(group).to.have.length(1);
            expect(bars).to.have.length(3);

            [0, 1, 2].forEach(i => {
              const barProps = bars.at(i).props();
              expect(barProps.x).to.equal(
                xScale(xTestValues[i]) - props.barThickness / 2
              );
              expect(barProps.width).to.equal(props.barThickness);
              const yZero = yScale(0);
              const yVal = yScale(yTestValues[i]);
              expect(barProps.y).to.equal(Math.min(yZero, yVal));
              expect(barProps.height).to.equal(Math.abs(yVal - yZero));
            });
          }
        );
      }
    );
  });
});
