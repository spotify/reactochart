import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { getAxisChildProps } from "./utils/Axis";
import { sumMargins } from "./utils/Margin";
import { getTickDomain } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";
import YAxisLabels from "./YAxisLabels";
import YAxisTitle from "./YAxisTitle";
import YGrid from "./YGrid";
import YTicks from "./YTicks";

/**
 * `YAxis` is the vertical axis of the chart. `YAxis` is a wrapper around `YGrid`, `YTicks`,
 * `YAxisLabels`, and `YAxisTitle`. See their respective docs for prop documentation.
 */
export default class YAxis extends React.Component {
  static propTypes = {
    yScale: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.string,
    placement: PropTypes.string,
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    /**
     * Internal top spacing of YAxis, in pixels.
     */
    spacingTop: PropTypes.number,
    /**
     * Internal bottom spacing of YAxis, in pixels.
     */
    spacingBottom: PropTypes.number,
    /**
     * Internal left spacing of YAxis, in pixels.
     */
    spacingLeft: PropTypes.number,
    /**
     * Internal right spacing of YAxis, in pixels.
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
    labelStyle: PropTypes.object,
    labelFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    labelFormats: PropTypes.array,
    labels: PropTypes.array,
    /**
     * Adds vertical offset (along the YAxis) to the labels
     */
    labelOffset: PropTypes.number,

    tickLength: PropTypes.number,
    tickClassName: PropTypes.string,
    tickStyle: PropTypes.object,

    gridLineClassName: PropTypes.string,
    gridLineStyle: PropTypes.object,

    onMouseEnterLabel: PropTypes.func,
    onMouseMoveLabel: PropTypes.func,
    onMouseLeaveLabel: PropTypes.func
  };

  static defaultProps = {
    width: 400,
    height: 250,
    position: "left",
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
    spacingRight: 0
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _.defaults({}, props, YAxis.defaultProps);
    return { yTickDomain: getTickDomain(props.yScale, props) };
  }

  static getMargin(props) {
    const { ticksProps, labelsProps, titleProps } = getAxisChildProps(props);
    let margins = [];

    if (props.showTicks) margins.push(YTicks.getMargin(ticksProps));

    if (props.showTitle && props.title)
      margins.push(YAxisTitle.getMargin(titleProps));

    if (props.showLabels) margins.push(YAxisLabels.getMargin(labelsProps));

    return sumMargins(margins, "margin");
  }

  render() {
    const {
      width,
      height,
      position,
      tickLength,
      titleDistance,
      labelDistance,
      showTitle,
      showLabels,
      showTicks,
      showGrid,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight
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
      const labelsMargin = YAxisLabels.getMargin(labelsProps);
      titleProps.distance =
        titleDistance + labelsMargin[`margin${_.upperFirst(position)}`];
    } else if (showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineX = position === "left" ? -spacingLeft : width + spacingRight;

    return (
      <g className="rct-chart-axis rct-chart-axis-y">
        {showGrid ? <YGrid {...gridProps} /> : null}

        {showTicks ? <YTicks {...ticksProps} /> : null}

        {showLabels ? <YAxisLabels {...labelsProps} /> : null}

        {showTitle ? <YAxisTitle {...titleProps} /> : null}

        <line
          className="rct-chart-axis-line rct-chart-axis-line-y"
          x1={axisLineX}
          x2={axisLineX}
          y1={-spacingTop}
          y2={height + spacingBottom}
        />
      </g>
    );
  }
}
