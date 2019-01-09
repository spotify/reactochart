import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import MeasuredValueLabel from "./MeasuredValueLabel";
import {
  checkLabelsDistinct,
  getLabelsYOverhang,
  makeLabelFormatters
} from "./utils/Label";
import { getValue } from "./utils/Data";
import { getScaleTicks, getTickDomain, inferScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

function resolveYLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of Y-values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels which are distinct
  // since we currently do not support rotated axis value labels,
  // we do not check if they fit on the axis (unlike X labels), since all Y labels will have the same height
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
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    if (!force) return { attempts };

    // forced to decide, choose the least bad option
    // super bad, we don't have any label sets with distinct labels. return the last attempt.
    return _.last(attempts);
  }
}

class YAxisLabels extends React.Component {
  static propTypes = {
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    /**
     * Position of y axis labels. Accepted options are "left" or "right".
     */
    position: PropTypes.oneOf(["left", "right"]),
    /**
     * Placement of labels in regards to the y axis. Accepted options are "before" or "after".
     */
    placement: PropTypes.oneOf(["before", "after"]),
    /**
     * Label distance from Y Axis.
     */
    distance: PropTypes.number,
    /**
     * Round ticks to capture extent of given y domain from XYPlot.
     */
    nice: PropTypes.bool,
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
     * smallest amount of possible collisions along the axis. It's therefore dependent on
     * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
     * stylesheet, we suggest creating a styled label component that wraps YAxisLabels with your preferred styles.
     */
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    labelClassName: PropTypes.string,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the label given spacingLeft
     */
    spacingLeft: PropTypes.number,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the label given spacingRight
     */
    spacingRight: PropTypes.number,
    // Label Handling
    onMouseEnterLabel: PropTypes.func,
    onMouseMoveLabel: PropTypes.func,
    onMouseLeaveLabel: PropTypes.func,
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
     * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit
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
     * Adds vertical offset (along the YAxis) to the labels.
     */
    offset: PropTypes.number
  };

  static defaultProps = {
    offset: 0,
    height: 250,
    width: 400,
    position: "left",
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: "",
    labelStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: "14px",
      lineHeight: 1,
      textAnchor: "end"
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _.defaults({}, props, YAxisLabels.defaultProps);
    return { yTickDomain: getTickDomain(props.yScale, props) };
  }

  static getMargin(props) {
    props = _.defaults({}, props, YAxisLabels.defaultProps);
    const { yScale, position, placement, distance } = props;
    const labels = props.labels || YAxisLabels.getLabels(props);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };

    if (
      (position === "left" && placement === "after") ||
      (position === "right" && placement === "before")
    )
      return zeroMargin;

    const marginX = _.max(
      labels.map(label => Math.ceil(distance + label.width))
    );
    const [marginTop, marginBottom] = getLabelsYOverhang(
      yScale,
      labels,
      "middle"
    );

    return _.defaults(
      { [`margin${_.capitalize(position)}`]: marginX, marginTop, marginBottom },
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
    const { tickCount, labelStyle, yScale } = _.defaults(
      props,
      {},
      YAxisLabels.defaultProps
    );
    const ticks = props.ticks || getScaleTicks(yScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: YAxisLabels.defaultProps.labelStyle
    };
    const scaleType = inferScaleType(yScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs =
      _.isArray(propsFormats) && propsFormats.length
        ? propsFormats
        : YAxisLabels.getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const { labels } = resolveYLabelsForValues(yScale, ticks, formats, style);
    // console.log('resolveYLabelsForValues took ', performance.now() - start);
    // console.log('found labels', labels);
    return labels;
  }

  render() {
    // todo: position: 'zero' prop to position along the zero line
    const {
      width,
      yScale,
      position,
      distance,
      labelStyle,
      labelClassName,
      spacingLeft,
      spacingRight,
      offset
    } = this.props;
    const placement =
      this.props.placement || (position === "left" ? "before" : "after");
    const className = `rct-chart-value-label rct-chart-value-label-y ${labelClassName}`;
    const textAnchor = placement === "before" ? "end" : "start";
    const labels = this.props.labels || YAxisLabels.getLabels(this.props);
    const transform =
      position === "left"
        ? `translate(${-spacingLeft}, 0)`
        : `translate(${width + spacingRight}, 0)`;

    return (
      <g className="rct-chart-value-labels-y" transform={transform}>
        {labels.map((label, i) => {
          const y = yScale(label.value) + offset;
          const x = placement === "before" ? -distance : distance;

          const [onMouseEnter, onMouseMove, onMouseLeave] = [
            "onMouseEnterLabel",
            "onMouseMoveLabel",
            "onMouseLeaveLabel"
          ].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback)
              ? _.partial(callback, _, label.value)
              : null;
          });

          const style = _.defaults(
            { textAnchor },
            getValue(labelStyle, { x, y, ...label }, i),
            YAxisLabels.defaultProps.labelStyle
          );

          return (
            <g
              key={`x-axis-label-${i}`}
              {...{ onMouseEnter, onMouseMove, onMouseLeave }}
            >
              {/* <YAxisLabelDebugRect {...{x, y, label, style: getValue(labelStyle, label.text, i)}}/> */}
              <MeasuredValueLabel
                value={label.value}
                {...{
                  x,
                  y,
                  className,
                  dy: "0.35em",
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

class YAxisLabelDebugRect extends React.Component {
  render() {
    const { x, y, label, style } = this.props;
    const xAdj = style.textAnchor === "end" ? x - label.width : x;
    return (
      <rect
        {...{
          x: xAdj,
          y: y - label.height / 2,
          width: label.width,
          height: label.height,
          fill: "orange"
        }}
      />
    );
  }
}

export default YAxisLabels;
