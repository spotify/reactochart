import { expect } from "chai";
import * as d3 from "d3";
import _ from "lodash";
import {
  getAxisChildProps,
  getMouseAxisOptions
} from "../../../src/utils/Axis";

describe("Axis utils", () => {
  it("getAxisChildProps", () => {
    const axisProps = {
      width: 400,
      height: 250,
      xScale: d3.scaleLinear(),
      yScale: d3.scaleLinear(),
      spacingTop: 10,
      spacingBottom: 10,
      spacingLeft: 10,
      spacingRight: 10,
      position: "top",
      placement: "",
      ticks: [10, 20, 30, 40, 50],
      tickCount: 5,
      tickLength: 8,
      tickClassName: "my-ticks",
      tickStyle: { stroke: "blue" },
      title: "what a title",
      titleDistance: 12,
      titleAlign: "center",
      titleRotate: true,
      titleStyle: { color: "blue" },
      labelDistance: 12,
      labelClassName: "my-label",
      labelStyle: { color: "brown" },
      labelFormat: "0a",
      labelFormats: ["0a"],
      labels: ["what a label"],
      gridLineClassName: "my-grid",
      labelOffset: 10,
      gridLineStyle: { stroke: "blue" },
      onMouseEnterLabel: () => {},
      onMouseMoveLabel: () => {},
      onMouseLeaveLabel: () => {}
    };

    const {
      ticksProps,
      gridProps,
      labelsProps,
      titleProps
    } = getAxisChildProps(axisProps);

    expect(ticksProps).to.eql(
      _.pick(axisProps, [
        "width",
        "height",
        "xScale",
        "yScale",
        "ticks",
        "tickCount",
        "spacingTop",
        "spacingBottom",
        "spacingLeft",
        "spacingRight",
        "position",
        "placement",
        "tickLength",
        "tickStyle",
        "tickClassName"
      ])
    );

    expect(gridProps).to.eql(
      Object.assign(
        {},
        _.pick(axisProps, [
          "width",
          "height",
          "xScale",
          "yScale",
          "ticks",
          "tickCount",
          "spacingTop",
          "spacingBottom",
          "spacingLeft",
          "spacingRight"
        ]),
        {
          lineClassName: axisProps.gridLineClassName,
          lineStyle: axisProps.gridLineStyle
        }
      )
    );

    expect(labelsProps).to.eql(
      Object.assign(
        {},
        _.pick(axisProps, [
          "width",
          "height",
          "xScale",
          "yScale",
          "ticks",
          "tickCount",
          "spacingTop",
          "spacingBottom",
          "spacingLeft",
          "spacingRight",
          "position",
          "placement",
          "labels",
          "labelClassName",
          "labelStyle",
          "onMouseEnterLabel",
          "onMouseMoveLabel",
          "onMouseLeaveLabel"
        ]),
        {
          distance: axisProps.labelDistance,
          format: axisProps.labelFormat,
          formats: axisProps.labelFormats,
          offset: axisProps.labelOffset
        }
      )
    );

    expect(titleProps).to.eql(
      Object.assign(
        {},
        _.pick(axisProps, [
          "width",
          "height",
          "position",
          "placement",
          "title",
          "spacingTop",
          "spacingBottom",
          "spacingLeft",
          "spacingRight"
        ]),
        {
          style: axisProps.titleStyle,
          distance: axisProps.titleDistance,
          alignment: axisProps.titleAlign,
          rotate: axisProps.titleRotate
        }
      )
    );
  });

  describe("getMouseAxisOptions", () => {
    it("throws error on invalid axis type", () => {
      expect(() => {
        getMouseAxisOptions("z", {}, {});
      }).to.throw(Error);
    });

    it("returns valid mouse options for x axisType", () => {
      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => {
            return {
              top: 0,
              left: 0,
              height: 300,
              width: 300
            };
          }
        },
        clientX: 50,
        clientY: 0
      };

      const scale = d3
        .scalePoint()
        .domain(["a", "b", "c"])
        .range([0, 100]);

      expect(getMouseAxisOptions("x", mockEvent, scale)).to.eql({
        event: mockEvent,
        outerX: 50,
        outerY: 0,
        xScale: scale,
        xValue: "b"
      });
    });

    it("returns valid mouse options for y axisType", () => {
      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => {
            return {
              top: 0,
              left: 0,
              height: 300,
              width: 300
            };
          }
        },
        clientX: 0,
        clientY: 50
      };

      const scale = d3
        .scalePoint()
        .domain(["a", "b", "c"])
        .range([0, 100]);

      expect(getMouseAxisOptions("y", mockEvent, scale)).to.eql({
        event: mockEvent,
        outerX: 0,
        outerY: 50,
        yScale: scale,
        yValue: "b"
      });
    });
  });
});
