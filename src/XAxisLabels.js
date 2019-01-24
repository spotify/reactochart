import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import MeasuredValueLabel from "./MeasuredValueLabel";
import {
  checkLabelsDistinct,
  countRangeOverlaps,
  getLabelsXOverhang,
  getLabelXRange,
  makeLabelFormatters
} from "./utils/Label";
import { getValue } from "./utils/Data";
import { getScaleTicks, getTickDomain, inferScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

function resolveXLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels

  let labels;
  let attempts = [];
  const goodFormat = _.find(formats, format => {
    const testLabels = values.map((value, i) =>
      MeasuredValueLabel.getLabel({
        value,
        format,
        style: _.defaults(
          getValue(style.labelStyle, value, i),
          style.defaultStyle
        )
      })
    );

    const areLabelsDistinct = checkLabelsDistinct(testLabels);
    if (!areLabelsDistinct) {
      // console.log('labels are not distinct', _.map(testLabels, 'text'));
      attempts.push({ labels: testLabels, format, areLabelsDistinct });
      return false;
    }

    const labelXRanges = testLabels.map(label =>
      getLabelXRange(scale, label, style.textAnchor || "middle")
    );
    const collisionCount = countRangeOverlaps(labelXRanges);
    if (collisionCount) {
      // console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
      attempts.push({
        labels: testLabels,
        format,
        areLabelsDistinct,
        collisionCount
      });
      return false;
    }

    labels = testLabels;
    return true;
  });

  if (!_.isUndefined(goodFormat)) {
    // found labels which work, return them
    return {
      labels,
      format: goodFormat,
      areLabelsDistinct: true,
      collisionCount: 0
    };
  } else {
    // none of the sets of labels are good
    if (!force)
      // if we're not forced to decide, return all the labels we tried (let someone else decide)
      return { attempts };

    // forced to decide, choose the least bad option
    // todo warn that we couldn't find good labels
    const distinctAttempts = attempts.filter(
      attempt => attempt.areLabelsDistinct
    );
    return distinctAttempts.length === 0
      ? // super bad, we don't have any label sets with distinct labels. return the last attempt.
        _.last(attempts)
      : // return the attempt with the fewest collisions between distinct labels
        _.minBy(distinctAttempts, "collisionCount");
  }
}

class XAxisLabels extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    /***
     * Position of x axis labels. Accepted options are "top" or "bottom".
     */
    position: PropTypes.oneOf(["top", "bottom"]),
    /**
     * Placement of labels in regards to the x axis. Accepted options are "above" or "below".
     */
    placement: PropTypes.oneOf(["below", "above"]),
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the label given spacingTop.
     */
    spacingTop: PropTypes.number,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the label given spacingBottom.
     */
    spacingBottom: PropTypes.number,
    /**
     * Label distance from X Axis.
     */
    distance: PropTypes.number,
    /**
     * Number of ticks on axis.
     */
    tickCount: PropTypes.number,
    /**
     * Custom ticks to display.
     */
    ticks: PropTypes.array,
    /**
     * Inline style object applied to each label,
     * or accessor function which returns a style object
     *
     * Disclaimer: labelStyle will merge its defaults with the given labelStyle prop
     * in order to ensure that our collision library measureText is able to calculate the
     * smallest amount of possible collissions along the axis. It's therefore dependent on
     * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
     * stylesheet, we suggest creating a styled label component that wraps XAxisLabels with your preferred styles.
     */
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    labelClassName: PropTypes.string,
    /**
     * Format to use for the labels or accessor that returns the updated label.
     *
     * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit.
     */
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Formats to use for the labels in priority order. XAxisLabels will try to be smart about which format
     * to use that keeps the labels distinct and provides the least amount of collisions when rendered.
     *
     * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit.
     */
    formats: PropTypes.array,
    /**
     * Custom labels provided. Note that each object in the array has to be of shape.
     * `{
     *  value,
     *  text,
     *  height,
     *  width
     * }`
     * value - value you'd like this label to be aligned with
     * text - text you'd like displayed
     * height - height of the given label
     * width - width of the given label
     */
    labels: PropTypes.array,
    /**
     * Round ticks to capture extent of given x domain from XYPlot.
     */
    nice: PropTypes.bool,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters the label.
     */
    onMouseEnterLabel: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within the label.
     */
    onMouseMoveLabel: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves the label.
     */
    onMouseLeaveLabel: PropTypes.func,
    /**
     * `mouseclick` event handler callback, called when user's mouse clicks the label.
     */
    onMouseClickLabel: PropTypes.func,
    /**
     * Adds horizontal offset (along the XAxis) to the labels
     */
    offset: PropTypes.number
  };

  static defaultProps = {
    offset: 0,
    height: 250,
    position: "bottom",
    placement: undefined,
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: "",
    labelStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: "14px",
      lineHeight: 1,
      textAnchor: "middle"
    },
    format: undefined,
    formats: undefined,
    labels: undefined
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _.defaults({}, props, XAxisLabels.defaultProps);
    return { xTickDomain: getTickDomain(props.xScale, props) };
  }

  static getMargin(props) {
    props = _.defaults({}, props, XAxisLabels.defaultProps);
    const { xScale, position, placement, distance, labelStyle } = props;
    const labels = props.labels || XAxisLabels.getLabels(props);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };

    if (
      (position === "bottom" && placement === "above") ||
      (position === "top" && placement === "below")
    )
      return zeroMargin;

    const marginY = _.max(
      labels.map(label => Math.ceil(distance + label.height))
    );
    const [marginLeft, marginRight] = getLabelsXOverhang(
      xScale,
      labels,
      "middle"
    );

    return _.defaults(
      { [`margin${_.capitalize(position)}`]: marginY, marginLeft, marginRight },
      zeroMargin
    );
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ["YYYY", "'YY", "MMM YYYY", "M/YY"];
    const numberFormatStrs = [
      "0.[00]a",
      "0,0",
      "0.[0]",
      "0.[00]",
      "0.[0000]",
      "0.[000000]"
    ];

    return scaleType === "ordinal"
      ? [_.identity]
      : scaleType === "time"
        ? timeFormatStrs
        : numberFormatStrs;
  }

  static getLabels(props) {
    const { tickCount, labelStyle, xScale } = _.defaults(
      props,
      {},
      XAxisLabels.defaultProps
    );
    const ticks = props.ticks || getScaleTicks(xScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: XAxisLabels.defaultProps.labelStyle
    };

    const scaleType = inferScaleType(xScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs =
      _.isArray(propsFormats) && propsFormats.length
        ? propsFormats
        : XAxisLabels.getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const { labels } = resolveXLabelsForValues(xScale, ticks, formats, style);

    return labels;
  }

  render() {
    const {
      height,
      xScale,
      position,
      distance,
      labelStyle,
      labelClassName,
      spacingTop,
      spacingBottom,
      offset
    } = this.props;
    const labels = this.props.labels || XAxisLabels.getLabels(this.props);
    const placement =
      this.props.placement || (position === "top" ? "above" : "below");
    const className = `rct-chart-value-label rct-chart-value-label-x ${labelClassName}`;
    const transform =
      position === "bottom"
        ? `translate(0, ${height + spacingBottom})`
        : `translate(0, ${-spacingTop})`;
    // todo: position: 'zero' to position along the zero line
    // example include having both positive and negative areas and youd like labels just on zero line

    return (
      <g className="rct-chart-value-labels-x" transform={transform}>
        {labels.map((label, i) => {
          const x = xScale(label.value) + offset;
          const y = placement === "above" ? -label.height - distance : distance;
          const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
            "onMouseEnterLabel",
            "onMouseMoveLabel",
            "onMouseLeaveLabel",
            "onMouseClickLabel"
          ].map(eventName => {
            // partially apply this label's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback)
              ? _.partial(callback, _, label.value)
              : null;
          });

          const style = _.defaults(
            { textAnchor: "middle" },
            getValue(labelStyle, { x, y, ...label }, i),
            XAxisLabels.defaultProps.labelStyle
          );

          return (
            <g
              key={`x-axis-label-${i}`}
              {...{ onMouseEnter, onMouseMove, onMouseLeave, onClick }}
            >
              {/* <XAxisLabelDebugRect {...{x, y, label}}/> */}
              <MeasuredValueLabel
                value={label.value}
                {...{
                  x,
                  y,
                  className,
                  dy: "0.8em",
                  style
                }}
              >
                {label.text}
              </MeasuredValueLabel>
            </g>
          );
        })}
      </g>
    );
  }
}

class XAxisLabelDebugRect extends React.Component {
  render() {
    const { x, y, label } = this.props;
    return (
      <rect
        {...{
          x: x - label.width / 2,
          y: y,
          width: label.width,
          height: label.height,
          fill: "orange"
        }}
      />
    );
  }
}

export default XAxisLabels;
