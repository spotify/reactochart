import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { methodIfFuncProp } from "./util.js";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import {
  domainFromData,
  domainFromRangeData,
  getValue,
  makeAccessor2
} from "./utils/Data";
import { dataTypeFromScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

function getTickType(props) {
  const { xEnd, yEnd, horizontal } = props;
  // warn if a range is passed for the dependent variable, which is expected to be a value
  if (
    (!horizontal && !_.isUndefined(yEnd)) ||
    (horizontal && !_.isUndefined(xEnd))
  )
    console.warn(
      "Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable."
    );

  if (
    (!horizontal && !_.isUndefined(xEnd)) ||
    (horizontal && !_.isUndefined(yEnd))
  )
    return "RangeValue";

  return "ValueValue";
}

/**
 * `MarkerLineChart` is similar to a bar chart,
 * except that it just draws a line at the data value, rather than a full bar.
 * If the independent variable is a range, the length of the line will represent that range,
 * otherwise all lines will be the same length.
 * The dependent variable must be a single value, not a range.
 */

export default class MarkerLineChart extends React.Component {
  static propTypes = {
    /**
     * Array of data objects. One marker line will be rendered per datum in the array.
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for marker line's X values, called once per line (datum), or a single value to be used for all marker lines.
     * If `horizontal` is `false`, this gets the *independent* variable value on which the line is centered.
     * If `horizontal` is `true`, this gets the start (minimum value) of the *dependent* variable.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for marker line's Y values, called once per line (datum), or a single value to be used for all marker lines.
     * If `horizontal` is `false`, this gets the start (minimum value) of the *dependent* variable.
     * If `horizontal` is `true`, this gets the *independent* variable value on which the line is centered.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (maximum X-values) of the *dependent* variable, which is where the marker line is rendered,
     * or a single value to be used for all marker lines.
     * Should only be passed when `horizontal` is `true` (ignored otherwise).
     */
    xEnd: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (maximum Y-values) of the *dependent* variable range which is where the marker line is rendered,
     * or a single value to be used for all marker lines.
     * Should only be passed when `horizontal` is `false` (ignored otherwise).
     */
    yEnd: CustomPropTypes.valueOrAccessor,
    /**
     * Boolean which determines whether the chart will be horizontal.
     * When `true` the X-axis will be treated as the dependent axis.
     */
    horizontal: PropTypes.bool,
    lineLength: PropTypes.number,
    /**
     * D3 scale type for X axis - provided by XYPlot.
     */
    xScaleType: PropTypes.string,
    /**
     * D3 scale type for Y axis - provided by XYPlot.
     */
    yScaleType: PropTypes.string,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Class attribute to be applied to the line path,
     * or accessor function which returns a class.
     */
    lineClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each marker line,
     * or accessor function which returns a style object.
     */
    lineStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a marker line.
     */
    onMouseEnterLine: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within a marker line.
     */
    onMouseMoveLine: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a marker line.
     */
    onMouseLeaveLine: PropTypes.func
  };
  static defaultProps = {
    horizontal: false,
    lineLength: 10,
    lineClassName: "",
    lineStyle: {}
  };

  static getSpacing(props) {
    const tickType = getTickType(props);
    //no spacing for rangeValue marker charts since line start and end are set explicitly
    if (tickType === "RangeValue")
      return {
        spacingTop: 0,
        spacingRight: 0,
        spacingBottom: 0,
        spacingLeft: 0
      };

    const {
      lineLength,
      horizontal,
      data,
      xDomain,
      yDomain,
      xScale,
      yScale,
      x,
      y
    } = props;
    const P = lineLength / 2; //padding
    const markDomain = horizontal ? yDomain : xDomain;
    const markScale = horizontal ? yScale : xScale;
    const markAccessor = horizontal ? makeAccessor2(y) : makeAccessor2(x);
    const markDataDomain = domainFromData(data, markAccessor);

    // todo refactor/add better comments to clarify
    // find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = _([
      _.first(markDomain),
      _.last(markDomain)
    ])
      .map(markScale)
      .sortBy(); //sort the pixel values return by the domain extents
    // find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = _([
      _.first(markDataDomain),
      _.last(markDataDomain)
    ])
      .map(markScale)
      .sortBy(); //sort the pixel values return by the domain extents
    // find the necessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingTail, spacingHead] = [
      _.clamp(P - (domainTail - dataDomainTail), 0, P),
      _.clamp(P - (dataDomainHead - domainHead), 0, P)
    ];

    if (horizontal) {
      return {
        spacingTop: spacingHead,
        spacingBottom: spacingTail,
        spacingLeft: 0,
        spacingRight: 0
      };
    } else {
      return {
        spacingTop: 0,
        spacingBottom: 0,
        spacingLeft: spacingHead,
        spacingRight: spacingTail
      };
    }
  }

  static getDomain(props) {
    if (getTickType(props) === "RangeValue") {
      // set range domain for range type
      const {
        data,
        x,
        xEnd,
        y,
        yEnd,
        xScaleType,
        yScaleType,
        horizontal
      } = props;

      // only have to specify range axis domain, other axis uses default domainFromData
      // in this chart type, the range axis, if there is one, is always the *independent* variable
      const rangeAxis = horizontal ? "y" : "x";
      const rangeStartAccessor = horizontal
        ? makeAccessor2(y)
        : makeAccessor2(x);
      const rangeEndAccessor = horizontal
        ? makeAccessor2(yEnd)
        : makeAccessor2(xEnd);
      const rangeDataType = dataTypeFromScaleType(
        horizontal ? yScaleType : xScaleType
      );

      return {
        [`${rangeAxis}Domain`]: domainFromRangeData(
          data,
          rangeStartAccessor,
          rangeEndAccessor,
          rangeDataType
        )
      };
    } else {
      return {};
    }
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  onMouseEnterLine = (e, d) => {
    this.props.onMouseEnterLine(e, d);
  };
  onMouseMoveLine = (e, d) => {
    this.props.onMouseMoveLine(e, d);
  };
  onMouseLeaveLine = (e, d) => {
    this.props.onMouseLeaveLine(e, d);
  };

  renderRangeValueLine = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] = [
      "onMouseEnterLine",
      "onMouseMoveLine",
      "onMouseLeaveLine"
    ].map(eventName => {
      // partially apply this bar's data point as 2nd callback argument
      const callback = methodIfFuncProp(eventName, this.props, this);
      return _.isFunction(callback) ? _.partial(callback, _, d) : null;
    });

    const {
      x,
      xEnd,
      y,
      yEnd,
      horizontal,
      xScale,
      yScale,
      lineClassName,
      lineStyle
    } = this.props;
    const xVal = xScale(makeAccessor2(x)(d));
    const yVal = yScale(makeAccessor2(y)(d));
    const xEndVal = _.isUndefined(xEnd) ? 0 : xScale(makeAccessor2(xEnd)(d));
    const yEndVal = _.isUndefined(yEnd) ? 0 : yScale(makeAccessor2(yEnd)(d));
    const [x1, y1] = [xVal, yVal];
    const x2 = horizontal ? xVal : xEndVal;
    const y2 = horizontal ? yEndVal : yVal;
    const key = `marker-line-${i}`;

    if (!_.every([x1, x2, y1, y2], _.isFinite)) return null;
    return (
      <line
        className={`${getValue(lineClassName, d, i)}`}
        style={getValue(lineStyle, d, i)}
        {...{ x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave }}
      />
    );
  };

  renderValueValueLine = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] = [
      "onMouseEnterLine",
      "onMouseMoveLine",
      "onMouseLeaveLine"
    ].map(eventName => {
      // partially apply this bar's data point as 2nd callback argument
      const callback = methodIfFuncProp(eventName, this.props, this);
      return _.isFunction(callback) ? _.partial(callback, _, d) : null;
    });

    const {
      x,
      y,
      horizontal,
      lineLength,
      xScale,
      yScale,
      lineClassName,
      lineStyle
    } = this.props;
    const xVal = xScale(makeAccessor2(x)(d));
    const yVal = yScale(makeAccessor2(y)(d));
    const x1 = !horizontal ? xVal - lineLength / 2 : xVal;
    const x2 = !horizontal ? xVal + lineLength / 2 : xVal;
    const y1 = !horizontal ? yVal : yVal - lineLength / 2;
    const y2 = !horizontal ? yVal : yVal + lineLength / 2;
    const key = `marker-line-${i}`;

    if (!_.every([x1, x2, y1, y2], _.isFinite)) return null;
    return (
      <line
        className={`${getValue(lineClassName, d, i)}`}
        style={getValue(lineStyle, d, i)}
        {...{ x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave }}
      />
    );
  };

  render() {
    const tickType = getTickType(this.props);
    return (
      <g className="rct-marker-line-chart">
        {tickType === "RangeValue"
          ? this.props.data.map(this.renderRangeValueLine)
          : this.props.data.map(this.renderValueValueLine)}
      </g>
    );
  }
}
