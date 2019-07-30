import defaults from "lodash/defaults";
import isFunction from "lodash/isFunction";
import upperFirst from "lodash/upperFirst";
import PropTypes from "prop-types";
import React from "react";
import { getAxisChildProps, getMouseAxisOptions } from "./utils/Axis";
import { sumMargins } from "./utils/Margin";
import { getTickDomain, inferScaleType, invertPointScale } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";
import XAxisLabels from "./XAxisLabels";
import XAxisTitle from "./XAxisTitle";
import XGrid from "./XGrid";
import XTicks from "./XTicks";

const getMouseOptions = getMouseAxisOptions.bind(null, "x");

/**
 * `XAxis` is the horizontal axis of the chart. `XAxis` is a wrapper around `XGrid`, `XTicks`,
 * `XAxisLabels`, and `XAxisTitle`. See their respective docs for prop documentation.
 */
export default class XAxis extends React.Component {
  static propTypes = {
    xScale: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.string,
    placement: PropTypes.string,
    /**
     * Extends the x domain to start and end on rounded values,
     * guaranteeing the original domain will be covered.
     * See d3 docs for more information
     */
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    /**
     * Internal top spacing of XAxis, in pixels.
     */
    spacingTop: PropTypes.number,
    /**
     * Internal bottom spacing of XAxis, in pixels.
     */
    spacingBottom: PropTypes.number,
    /**
     * Internal left spacing of XAxis, in pixels.
     */
    spacingLeft: PropTypes.number,
    /**
     * Internal right spacing of XAxis, in pixels.
     */
    spacingRight: PropTypes.number,

    showTitle: PropTypes.bool,
    showLabels: PropTypes.bool,
    showTicks: PropTypes.bool,
    showGrid: PropTypes.bool,

    title: PropTypes.string,
    titleDistance: PropTypes.number,
    titleAlign: PropTypes.string,
    titleRotate: PropTypes.bool,
    titleStyle: PropTypes.object,

    labelDistance: PropTypes.number,
    labelClassName: PropTypes.string,
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    labelFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    labelFormats: PropTypes.array,
    labels: PropTypes.array,
    /**
     * Adds horizontal offset (along the XAxis) to the labels
     */
    labelOffset: PropTypes.number,

    tickLength: PropTypes.number,
    tickClassName: PropTypes.string,
    tickStyle: PropTypes.object,

    gridLineClassName: PropTypes.string,
    gridLineStyle: PropTypes.object,

    onMouseClickLabel: PropTypes.func,
    onMouseEnterLabel: PropTypes.func,
    onMouseMoveLabel: PropTypes.func,
    onMouseLeaveLabel: PropTypes.func,

    /**
     * `mouseenter` event handler callback, called when user's mouse enters the x axis.
     */
    onMouseEnterAxis: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves the x axis.
     */
    onMouseLeaveAxis: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within the x axis.
     */
    onMouseMoveAxis: PropTypes.func,
    /**
     * `click` event handler callback, called when user's mouse clicks on the x axis.
     */
    onMouseClickAxis: PropTypes.func,

    /**
     * Show X Axis line
     */
    showLine: PropTypes.bool,
    /**
     * Inline style object to be applied to the X Axis line
     */
    lineStyle: PropTypes.object
  };

  static defaultProps = {
    width: 400,
    height: 250,
    position: "bottom",
    nice: true,
    showTitle: true,
    showLabels: true,
    showTicks: true,
    showGrid: true,
    tickLength: 5,
    labelDistance: 3,
    titleDistance: 5,
    spacingTop: 0,
    spacingBottom: 0,
    spacingLeft: 0,
    spacingRight: 0,
    showLine: true,
    lineStyle: {}
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.xScale) return;
    props = defaults({}, props, XAxis.defaultProps);
    return { xTickDomain: getTickDomain(props.xScale, props) };
  }

  static getMargin(props) {
    const { ticksProps, labelsProps, titleProps } = getAxisChildProps(props);
    let margins = [];

    if (props.showTicks) margins.push(XTicks.getMargin(ticksProps));

    if (props.showTitle && props.title)
      margins.push(XAxisTitle.getMargin(titleProps));

    if (props.showLabels) margins.push(XAxisLabels.getMargin(labelsProps));

    return sumMargins(margins, "margin");
  }

  handleOnMouseMove = event => {
    const { onMouseMoveAxis, xScale } = this.props;

    if (!isFunction(onMouseMoveAxis)) {
      return;
    }

    const options = getMouseOptions(event, xScale);
    onMouseMoveAxis(options);
  };

  handleOnMouseEnter = event => {
    const { onMouseEnterAxis, xScale } = this.props;

    if (!isFunction(onMouseEnterAxis)) {
      return;
    }

    const options = getMouseOptions(event, xScale);
    onMouseEnterAxis(options);
  };

  handleOnMouseLeave = event => {
    const { onMouseLeaveAxis, xScale } = this.props;

    if (!isFunction(onMouseLeaveAxis)) {
      return;
    }

    const options = getMouseOptions(event, xScale);
    onMouseLeaveAxis(options);
  };

  handleOnClick = event => {
    const { onMouseClickAxis, xScale } = this.props;

    if (!isFunction(onMouseClickAxis)) {
      return;
    }

    const options = getMouseOptions(event, xScale);
    onMouseClickAxis(options);
  };

  render() {
    const {
      width,
      height,
      position,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight,
      tickLength,
      titleDistance,
      labelDistance,
      showTitle,
      showLabels,
      showTicks,
      showGrid,
      showLine,
      lineStyle
    } = this.props;

    const {
      ticksProps,
      gridProps,
      labelsProps,
      titleProps
    } = getAxisChildProps(this.props);

    labelsProps.distance = labelDistance + (showTicks ? tickLength : 0);

    if (showTitle && showLabels) {
      // todo optimize so we don't generate labels twice
      const labelsMargin = XAxisLabels.getMargin(labelsProps);
      titleProps.distance =
        titleDistance + labelsMargin[`margin${upperFirst(position)}`];
    } else if (showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineY =
      position === "bottom" ? height + spacingBottom : -spacingTop;

    return (
      <g
        className="rct-chart-axis rct-chart-axis-x"
        onMouseMove={this.handleOnMouseMove}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        onClick={this.handleOnClick}
      >
        {showGrid ? <XGrid {...gridProps} /> : null}

        {showTicks ? <XTicks {...ticksProps} /> : null}

        {showLabels ? <XAxisLabels {...labelsProps} /> : null}

        {showTitle ? <XAxisTitle {...titleProps} /> : null}

        {showLine ? (
          <line
            className="rct-chart-axis-line rct-chart-axis-line-x"
            x1={-spacingLeft}
            x2={width + spacingRight}
            y1={axisLineY}
            y2={axisLineY}
            style={lineStyle}
          />
        ) : null}
      </g>
    );
  }
}
