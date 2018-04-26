import React from "react";
import invariant from "invariant";
import isUndefined from "lodash/isUndefined";
import { hasOneOfTwo } from "./util";
import { hasXYScales } from "./utils/Scale";
import PropTypes from "prop-types";

/**
 * Bar is a low-level component to be used in XYPlot-type charts (namely BarChart).
 * It is specified in terms of a range (min & max) of values on one axis (the bar's long axis)
 * and a single value on the other axis.
 * Passing props `x`, `xEnd` and `y` specifies a horizontal bar,
 * centered on `y` and spanning from `x` to `xEnd`;
 * passing props `x`, `y`, and `yEnd' specifies a vertical bar.
 */

export default class Bar extends React.Component {
  static propTypes = {
    /**
     * For a vertical bar, `x` represents the X data value on which the bar is centered.
     * For a horizontal bar, represents the *starting* X value of the bar, ie. the minimum of the range it spans
     */
    x: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    /**
     * For a horizontal bar, `y` represents the Y data value on which the bar is centered.
     * For a vertical bar, represents the *starting* Y value of the bar, ie. the minimum of the range it spans
     */
    y: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    /**
     * For a horizontal bar, `xEnd` represents the *ending* X data value of the bar, ie. the maximum of the range it spans.
     * Should be undefined if the bar is vertical.
     */
    xEnd: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    /**
     * For a vertical bar, `yEnd` represents the *ending* Y data value of the bar, ie. the maximum of the range it spans.
     * Should be undefined if the bar is horizontal.
     */
    yEnd: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),

    /**
     * The thickness of the bar, in pixels. (width of vertical bar, or height of horizontal bar)
     */
    thickness: PropTypes.number,
    /**
     * Class name(s) to be included on the bar's <rect> element
     */
    className: PropTypes.string,
    /**
     * Inline style object to be included on the bar's <rect> element
     */
    style: PropTypes.object,
    /**
     * onMouseMove event handler callback, called when user's mouse moves within the bar.
     */
    onMouseMove: PropTypes.func,
    /**
     * onMouseEnter event handler callback, called when user's mouse enters the bar.
     */
    onMouseEnter: PropTypes.func,
    /**
     * onMouseLeave event handler callback, called when user's mouse leaves the bar.
     */
    onMouseLeave: PropTypes.func,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func
  };
  static defaultProps = {
    x: 0,
    y: 0,
    thickness: 8,
    className: "",
    style: {}
  };

  render() {
    //  x/y are values in the *data* domain, not pixel domain
    const {
      xScale,
      yScale,
      x,
      xEnd,
      y,
      yEnd,
      thickness,
      style,
      onMouseEnter,
      onMouseMove,
      onMouseLeave
    } = this.props;

    invariant(
      hasOneOfTwo(xEnd, yEnd),
      `Bar expects an xEnd *or* yEnd prop, but not both.`
    );

    const orientation = isUndefined(xEnd) ? "vertical" : "horizontal";
    const className = `chart-bar chart-bar-${orientation} ${this.props
      .className || ""}`;

    let rectX, rectY, width, height;
    if (orientation === "horizontal") {
      rectY = yScale(y) - thickness / 2;
      const x0 = xScale(x);
      const x1 = xScale(xEnd);
      rectX = Math.min(x0, x1);
      width = Math.abs(x1 - x0);
      height = thickness;
    } else {
      // vertical
      rectX = xScale(x) - thickness / 2;
      const y0 = yScale(y);
      const y1 = yScale(yEnd);
      rectY = Math.min(y0, y1);
      height = Math.abs(y1 - y0);
      width = thickness;
    }

    return (
      <rect
        {...{
          x: rectX,
          y: rectY,
          width,
          height,
          className,
          style,
          onMouseEnter,
          onMouseMove,
          onMouseLeave
        }}
      />
    );
  }
}
