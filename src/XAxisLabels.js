import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import MeasuredValueLabel from "./MeasuredValueLabel";
import { getScaleTicks, inferScaleType, getTickDomain } from "./utils/Scale";
import {
  checkLabelsDistinct,
  countRangeOverlaps,
  makeLabelFormatters,
  getLabelXRange,
  getLabelsXOverhang
} from "./utils/Label";
import xyPropsEqual from "./utils/xyPropsEqual";

function resolveXLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels

  let labels;
  let attempts = [];
  const goodFormat = _.find(formats, format => {
    const testLabels = values.map(value =>
      MeasuredValueLabel.getLabel({ value, format, style })
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
    xScale: PropTypes.func,
    // Label Handling
    onMouseEnterLabel: PropTypes.func,
    onMouseMoveLabel: PropTypes.func,
    onMouseLeaveLabel: PropTypes.func
  };
  static defaultProps = {
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
    labels: undefined,
    spacingTop: 0,
    spacingBottom: 0
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
      labelStyle.textAnchor || "middle"
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
    const style = _.defaults(labelStyle, XAxisLabels.defaultProps.labelStyle);

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
    // console.log('found labels', labels);
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
      onMouseEnterLabel,
      onMouseMoveLabel,
      onMouseLeaveLabel,
      spacingTop,
      spacingBottom
    } = this.props;
    const labels = this.props.labels || XAxisLabels.getLabels(this.props);
    const placement =
      this.props.placement || (position === "top" ? "above" : "below");
    const className = `chart-value-label chart-value-label-x ${labelClassName}`;
    const transform =
      position === "bottom"
        ? `translate(0, ${height + spacingBottom})`
        : `translate(0, ${-spacingTop})`;
    // todo: position: 'zero' to position along the zero line

    return (
      <g className="chart-value-labels-x" transform={transform}>
        {labels.map((label, i) => {
          const x = xScale(label.value);
          const y = placement === "above" ? -label.height - distance : distance;
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

          return (
            <g
              key={`x-axis-label-${i}`}
              {...{ onMouseEnter, onMouseMove, onMouseLeave }}
            >
              {/* <XAxisLabelDebugRect {...{x, y, label}}/> */}
              <MeasuredValueLabel
                value={label.value}
                {...{ x, y, className, dy: "0.8em", style: labelStyle }}
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
