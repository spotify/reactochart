import React from "react";
import _ from "lodash";
import shallowEqual from "./utils/shallowEqual";
import PropTypes from "prop-types";

import { getTickDomain, scaleEqual } from "./utils/Scale";
import { sumMargins } from "./utils/Margin";
import { getAxisChildProps } from "./utils/Axis";
import xyPropsEqual from "./utils/xyPropsEqual";

import XTicks from "./XTicks";
import XGrid from "./XGrid";
import XAxisLabels from "./XAxisLabels";
import XAxisTitle from "./XAxisTitle";

export default class XAxis extends React.Component {
  static propTypes = {
    xScale: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.string,
    placement: PropTypes.string,
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number,
    spacingLeft: PropTypes.number,
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
    labelFormat: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    labelFormats: PropTypes.array,
    labels: PropTypes.array,

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
    spacingRight: 0
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _.defaults({}, props, XAxis.defaultProps);
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
      showGrid
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
        titleDistance + labelsMargin[`margin${_.upperFirst(position)}`];
    } else if (showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineY =
      position === "bottom" ? height + spacingBottom : -spacingTop;
    // `width` is width of inner chart *not* including spacing - add spacing to figure out where to draw line
    const axisLineWidth = width + spacingLeft + spacingRight;

    return (
      <g className="rct-chart-axis rct-chart-axis-x">
        {showGrid ? <XGrid {...gridProps} /> : null}

        {showTicks ? <XTicks {...ticksProps} /> : null}

        {showLabels ? <XAxisLabels {...labelsProps} /> : null}

        {showTitle ? <XAxisTitle {...titleProps} /> : null}

        <line
          className="rct-chart-axis-line rct-chart-axis-line-x"
          x1={-spacingLeft}
          x2={width + spacingRight}
          y1={axisLineY}
          y2={axisLineY}
        />
      </g>
    );
  }
}
