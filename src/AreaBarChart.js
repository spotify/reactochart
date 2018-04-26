import React from "react";
import _ from "lodash";
import invariant from "invariant";
import PropTypes from "prop-types";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { hasXYScales, dataTypeFromScaleType } from "./utils/Scale";
import {
  makeAccessor,
  makeAccessor2,
  getValue,
  domainFromRangeData
} from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";
import RangeRect from "./RangeRect";

/**
 * `AreaBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *dependent* axis (Y axis for vertical bars), and the bar stretches from zero to this value.
 * However, on the *independent* axis, each bar represents a *range* (min/max) of values,
 * rather than being centered on a specific value.
 * In other words, the bar *lengths* act the same way as standard bar chart bars,
 * but their *thicknesses* are variable and meaningful.
 * `AreaBarChart`s are the correct way to display histograms with variable bin sizes.
 * They are so named because, in cases like these histograms, since both the bar thickness and length are meaningful,
 * so too is the bar's total *area*, unlike in other bar charts.
 */

export default class AreaBarChart extends React.Component {
  static propTypes = {
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    /**
     * Array of data to be plotted. One bar will be rendered per datum in this array.
     */
    data: PropTypes.array,
    /**
     * Boolean which determines whether the chart will use horizontal or vertical bars.
     * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
     */
    horizontal: PropTypes.bool,

    /**
     * Accessor function for bar X values, called once per bar (datum).
     * If `horizontal` is `false`, this gets the start (min value) of the *independent* variable range, spanned by the bar's thickness.
     * If `horizontal` is `true`, this gets the *dependent* variable value, the end of the bar's length
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (max X value) of the *independent* variable range, spanned by the bar's thickness.
     * Should only be passed when `horizontal` is `false` (ignored otherwise).
     */
    xEnd: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for bar Y values, called once per bar (datum).
     * If `horizontal` is `true`, this gets the start (min value) of the *independent* variable range which is spanned by the bar's thickness.
     * If `horizontal` is `false`, this gets the *dependent* variable value, the end of the bar's length
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (max Y value) of the *independent* variable range, spanned by the bar's thickness.
     * Should only be passed when `horizontal` is `true` (ignored otherwise).
     */
    yEnd: CustomPropTypes.valueOrAccessor,

    /**
     * Class attribute to be applied to each bar.
     * or accessor function which returns a class;
     */
    barClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each bar,
     * or accessor function which returns a style object;
     */
    barStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

    /**
     * `mousemove` event handler callback, called when user's mouse moves within a bar.
     */
    onMouseMoveBar: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a bar.
     */
    onMouseEnterBar: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a bar.
     */
    onMouseLeaveBar: PropTypes.func
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barClassName: "",
    barStyle: {}
  };

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ["barStyle"]);
    // console.log('should areabarchart update?', shouldUpdate);
    return shouldUpdate;
  }

  static getDomain(props) {
    const { xScaleType, yScaleType, horizontal, data } = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    // for area bar chart, the independent variable is the range
    // ie. the range controls the thickness of the bar
    const rangeAxis = horizontal ? "y" : "x";
    const rangeDataType = dataTypeFromScaleType(
      rangeAxis === "x" ? xScaleType : yScaleType
    );
    // make accessor functions from getX|Y and getX|YEnd
    const rangeStartAccessor = makeAccessor2(props[`${rangeAxis}`]);
    const rangeEndAccessor = makeAccessor2(props[`${rangeAxis}End`]);

    return {
      [rangeAxis + "Domain"]: domainFromRangeData(
        data,
        rangeStartAccessor,
        rangeEndAccessor,
        rangeDataType
      )
    };
  }

  render() {
    const {
      xScale,
      yScale,
      data,
      horizontal,
      x,
      xEnd,
      y,
      yEnd,
      barClassName,
      barStyle
    } = this.props;

    return (
      <g>
        {data.map((d, i) => {
          const [onMouseEnter, onMouseMove, onMouseLeave] = [
            "onMouseEnterBar",
            "onMouseMoveBar",
            "onMouseLeaveBar"
          ].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, d) : null;
          });

          return (
            <RangeRect
              {...{
                xScale,
                yScale,
                className: `chart-area-bar ${getValue(barClassName, d, i)}`,
                style: getValue(barStyle, d, i),
                x: horizontal ? 0 : getValue(x, d, i),
                xEnd: horizontal ? getValue(x, d, i) : getValue(xEnd, d, i),
                y: !horizontal ? 0 : getValue(y, d, i),
                yEnd: !horizontal ? getValue(y, d, i) : getValue(yEnd, d, i),
                key: `chart-area-bar-${i}`,
                onMouseEnter,
                onMouseMove,
                onMouseLeave
              }}
            />
          );
        })}
      </g>
    );
  }
}
