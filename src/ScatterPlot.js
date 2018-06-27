import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { methodIfFuncProp } from "./util.js";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { getValue } from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";

/**
 * `ScatterPlot` displays its data as a collection of points. Each point represents
 * the relationship between two variables, one plotted along the x-axis and the other on the y-axis.
 */
export default class ScatterPlot extends React.Component {
  static propTypes = {
    /**
     * Array of data to be plotted.
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for plot X values, called once per datum, or a single value to be used for all points.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for plot Y values, called once per datum, or a single value to be used for all points.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Used with the default point symbol (circle), defines the circle radius.
     */
    pointRadius: PropTypes.number,
    /**
     * Text or SVG node to use as custom point symbol, or function which returns text/SVG.
     */
    pointSymbol: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * Manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered.
     */
    pointOffset: PropTypes.arrayOf(PropTypes.number),
    /**
     * Inline style object to be applied to each point,
     * or accessor function which returns a style object.
     */
    pointStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Class attribute to be applied to each point,
     * or accessor function which returns a class.
     */
    pointClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a point.
     */
    onMouseEnterPoint: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within a point.
     */
    onMouseMovePoint: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a point.
     */
    onMouseLeavePoint: PropTypes.func
  };
  static defaultProps = {
    pointRadius: 3,
    pointSymbol: <circle />,
    pointOffset: [0, 0],
    pointStyle: {},
    pointClassName: ""
  };

  // todo: implement getSpacing or getPadding static

  onMouseEnterPoint = (e, d) => {
    this.props.onMouseEnterPoint(e, d);
  };
  onMouseMovePoint = (e, d) => {
    this.props.onMouseMovePoint(e, d);
  };
  onMouseLeavePoint = (e, d) => {
    this.props.onMouseLeavePoint(e, d);
  };

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ["pointStyle"]);
    return shouldUpdate;
  }

  renderPoint = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] = [
      "onMouseEnterPoint",
      "onMouseMovePoint",
      "onMouseLeavePoint"
    ].map(eventName => {
      // partially apply this bar's data point as 2nd callback argument
      const callback = methodIfFuncProp(eventName, this.props, this);
      return _.isFunction(callback) ? _.partial(callback, _, d) : null;
    });
    const {
      xScale,
      yScale,
      x,
      y,
      pointRadius,
      pointOffset,
      pointStyle,
      pointClassName
    } = this.props;
    let { pointSymbol } = this.props;
    const className = `rct-chart-scatterplot-point ${getValue(
      pointClassName,
      d,
      i
    )}`;
    const style = getValue(pointStyle, d, i);
    let symbolProps = {
      className,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      key: `scatter-point-${i}`
    };

    // resolve symbol-generating functions into real symbols
    if (_.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
    // wrap string/number symbols in <text> container
    if (_.isString(pointSymbol) || _.isNumber(pointSymbol))
      pointSymbol = <text>{pointSymbol}</text>;
    // use props.pointRadius for circle radius
    if (pointSymbol.type === "circle" && _.isUndefined(pointSymbol.props.r))
      symbolProps.r = pointRadius;

    // x,y coords of center of symbol
    const cx = xScale(getValue(x, d, i)) + pointOffset[0];
    const cy = yScale(getValue(y, d, i)) + pointOffset[1];

    // set positioning attributes based on symbol type
    if (pointSymbol.type === "circle" || pointSymbol.type === "ellipse") {
      _.assign(symbolProps, { cx, cy, style: { ...style } });
    } else if (pointSymbol.type === "text") {
      _.assign(symbolProps, {
        x: cx,
        y: cy,
        style: { textAnchor: "middle", dominantBaseline: "central", ...style }
      });
    } else {
      _.assign(symbolProps, {
        x: cx,
        y: cy,
        style: { ...style }
      });
    }

    return React.cloneElement(pointSymbol, symbolProps);
  };

  render() {
    return <g>{this.props.data.map(this.renderPoint)}</g>;
  }
}
