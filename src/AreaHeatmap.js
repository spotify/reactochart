import { extent } from "d3";
import flatten from "lodash/flatten";
import isFunction from "lodash/isFunction";
import every from "lodash/every";
import isFinite from "lodash/isFinite";
import PropTypes from "prop-types";
import React from "react";
import { methodIfFuncProp } from "./util.js";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { getValue, makeAccessor2 } from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";

/**
 * `AreaHeatmap` is still undergoing experimental changes!
 * We do not consider this chart to be production ready as it does not support categorical data.
 */

// todo support categorical data

export default class AreaHeatmap extends React.Component {
  static propTypes = {
    /**
     * Array of data objects.
     */
    data: PropTypes.array.isRequired,
    x: CustomPropTypes.valueOrAccessor,
    xEnd: CustomPropTypes.valueOrAccessor,
    y: CustomPropTypes.valueOrAccessor,
    yEnd: CustomPropTypes.valueOrAccessor,
    area: CustomPropTypes.valueOrAccessor,
    unitsPerPixel: PropTypes.number,
    /**
     * Class attribute to be applied to each rect
     * or accessor function which returns a class
     */
    rectClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each rect,
     * or accessor function which returns a style object.
     */
    rectStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func
  };
  static defaultProps = { rectClassName: "", rectStyle: {} };

  static getDomain(props) {
    const { data, x, xEnd, y, yEnd } = props;
    return {
      x: extent(
        flatten([data.map(makeAccessor2(x)), data.map(makeAccessor2(xEnd))])
      ),
      y: extent(
        flatten([data.map(makeAccessor2(y)), data.map(makeAccessor2(yEnd))])
      )
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ["rectStyle"]);
    return shouldUpdate;
  }

  onMouseEnter = e => {
    this.props.onMouseEnter(e);
  };

  onMouseLeave = e => {
    this.props.onMouseLeave(e);
  };

  onMouseMove = e => {
    const { xScale, yScale, onMouseMove } = this.props;
    if (!isFunction(onMouseMove)) return;

    const boundBox = this.refs.background.getBoundingClientRect();
    if (!boundBox) return;
    const [x, y] = [
      e.clientX - (boundBox.left || 0),
      e.clientY - (boundBox.top || 0)
    ];
    const [xVal, yVal] = [xScale.invert(x), yScale.invert(y)];

    onMouseMove(e, { xVal, yVal });
  };

  render() {
    const {
      data,
      area,
      x,
      xEnd,
      y,
      yEnd,
      xScale,
      yScale,
      scaleWidth,
      scaleHeight,
      rectClassName,
      rectStyle
    } = this.props;
    const [areaAccessor, xAccessor, xEndAccessor, yAccessor, yEndAccessor] = [
      area,
      x,
      xEnd,
      y,
      yEnd
    ].map(makeAccessor2);

    // to determine how many data units are represented by 1 square pixel of area,
    // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container
    const unitsPerPixel =
      this.props.unitsPerPixel ||
      Math.max.apply(
        this,
        data.map((d, i) => {
          // ratio of this bin's area (in data units) to the entire area of its container rectangle (in pixels)
          return (
            getValue(area, d, i) /
            Math.abs(
              (xScale(getValue(xEnd, d, i)) - xScale(getValue(x, d, i))) *
                (yScale(getValue(yEnd, d, i)) - yScale(getValue(y, d, i)))
            )
          );
        })
      );

    const handlers = {
      onMouseMove: methodIfFuncProp("onMouseMove", this.props, this),
      onMouseEnter: methodIfFuncProp("onMouseEnter", this.props, this),
      onMouseLeave: methodIfFuncProp("onMouseLeave", this.props, this)
    };

    return (
      <g className="rct-area-heatmap-chart" {...handlers}>
        <rect
          x="0"
          y="0"
          width={scaleWidth}
          height={scaleHeight}
          ref="background"
          fill="transparent"
        />
        {data.map((d, i) => {
          const [xVal, xEndVal, yVal, yEndVal, areaVal] = [
            x,
            xEnd,
            y,
            yEnd,
            area
          ].map(getter => getValue(getter, d, i));
          // full width and height of the containing rectangle
          const fullWidth = Math.abs(xScale(xEndVal) - xScale(xVal));
          const fullHeight = Math.abs(yScale(yEndVal) - yScale(yVal));
          // x / y position of top left of the containing rectangle
          const fullRectX = Math.min(xScale(xEndVal), xScale(xVal));
          const fullRectY = Math.min(yScale(yEndVal), yScale(yVal));

          // we know two facts:
          // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
          //    ie. area = height * width = areaVal / unitsPerPixel
          const pixelArea = areaVal / unitsPerPixel;
          // 2. all rectangles, regardless of size, have the same shape (are congruent), so the ratio
          //    of the rect's width to the full width is equal to the ratio of its height to the full height.
          //    ie. (height / fullHeight) = (width / fullWidth)
          // solve for height and width to get...
          const width = Math.sqrt(pixelArea * (fullWidth / fullHeight));
          const height = Math.sqrt(pixelArea * (fullHeight / fullWidth));

          // center the data rect in the containing rectangle
          const rectX = fullRectX + (fullWidth - width) / 2;
          const rectY = fullRectY + (fullHeight - height) / 2;

          if (!every([rectX, rectY, width, height], isFinite)) return null;

          const className = `rct-area-heatmap-rect ${getValue(
            rectClassName,
            d,
            i
          )}`;
          const style = getValue(rectStyle, d, i);
          const key = `rect-${i}`;

          return (
            <rect
              {...{ x: rectX, y: rectY, width, height, className, style, key }}
            />
          );
        })}
      </g>
    );
  }
}
