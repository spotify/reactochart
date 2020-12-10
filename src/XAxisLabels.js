import defaults from 'lodash/defaults';
import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';
import minBy from 'lodash/minBy';
import max from 'lodash/max';
import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import MeasuredValueLabel from './MeasuredValueLabel';
import {
  checkLabelsDistinct,
  countRangeOverlaps,
  getLabelsXOverhang,
  getLabelXRange,
  makeLabelFormatters,
  getDefaultFormats,
} from './utils/Label';
import { getValue } from './utils/Data';
import { getScaleTicks, getTickDomain, inferScaleType } from './utils/Scale';
import { bindTrailingArgs } from './util.js';
import xyPropsEqual from './utils/xyPropsEqual';

function resolveXLabelsForValues(
  scale,
  values,
  formats = [],
  style,
  force = true,
) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels

  let labels;
  const attempts = [];

  const goodFormat = formats.find(format => {
    const testLabels = values.map((value, i) => {
      return MeasuredValueLabel.getLabel({
        value,
        format,
        style: defaults(
          getValue(style.labelStyle, { value }, i),
          style.defaultStyle,
        ),
      });
    });

    const areLabelsDistinct = checkLabelsDistinct(testLabels);
    if (!areLabelsDistinct) {
      attempts.push({ labels: testLabels, format, areLabelsDistinct });
      return false;
    }

    const labelXRanges = testLabels.map(label =>
      getLabelXRange(scale, label, style.textAnchor || 'middle'),
    );
    const collisionCount = countRangeOverlaps(labelXRanges);
    if (collisionCount) {
      // console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
      attempts.push({
        labels: testLabels,
        format,
        areLabelsDistinct,
        collisionCount,
      });
      return false;
    }

    labels = testLabels;
    return true;
  });

  if (!isUndefined(goodFormat)) {
    // found labels which work, return them
    return {
      labels,
      format: goodFormat,
      areLabelsDistinct: true,
      collisionCount: 0,
    };
  }
  // none of the sets of labels are good
  if (!force)
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    return { attempts };

  // forced to decide, choose the least bad option
  // todo warn that we couldn't find good labels
  const distinctAttempts = attempts.filter(
    attempt => attempt.areLabelsDistinct,
  );
  return distinctAttempts.length === 0
    ? last(attempts)
    : minBy(distinctAttempts, 'collisionCount');
}

class XAxisLabels extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    /**
     * Position of x axis labels. Accepted options are "top" or "bottom".
     */
    position: PropTypes.oneOf(['top', 'bottom']),
    /**
     * Placement of labels in regards to the x axis. Accepted options are "above" or "below".
     */
    placement: PropTypes.oneOf(['below', 'above']),
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
     * An accessor function that returns the updated label.
     *
     * For example, given labels with real numbers one can pass in the following accessor,
     * (label) => `${label}%`, to display percentages.
     */
    format: PropTypes.func,
    /**
     * Formats to use for the labels in priority order. XAxisLabels will try to be smart about which format
     * to use that keeps the labels distinct and provides the least amount of collisions when rendered. Formats
     * can be either string(s) or function(s), utilizing d3-format.
     *
     * For example, given labels with real numbers one can pass in [".0%"] for a rounded percentage, like 12%.
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
     * Default label behavior places the text centered below the data point it delineates. This can allow
     * overhang where the first and possibly last labels' text hangs over the edges of the x axis range.
     * Setting this to `true` will force the first and last labels to align in such a way that their text does
     * not exceed the x range. That is, the first label will be text-anchor: "start" instead of "middle", and
     * the label marking the right edge of the chart will be anchored to the "end" instead of "middle".
     *
     * This affects spacing calculations.
     */
    noLabelOverhang: PropTypes.bool,
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
    offset: PropTypes.number,
  };

  static defaultProps = {
    offset: 0,
    height: 250,
    position: 'bottom',
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: '',
    labelStyle: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '14px',
      lineHeight: 1,
      textAnchor: 'middle',
    },
  };

  static getTickDomain(props) {
    if (!props.xScale) return;
    const propsWithDefaults = defaults({}, props, XAxisLabels.defaultProps);
    return {
      xTickDomain: getTickDomain(propsWithDefaults.xScale, propsWithDefaults),
    };
  }

  static getMargin(props) {
    const propsWithDefaults = defaults({}, props, XAxisLabels.defaultProps);
    const { xScale, position, placement, distance } = propsWithDefaults;
    const labels =
      propsWithDefaults.labels || XAxisLabels.getLabels(propsWithDefaults);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    if (
      (position === 'bottom' && placement === 'above') ||
      (position === 'top' && placement === 'below')
    )
      return zeroMargin;

    const marginY = max(
      labels.map(label => Math.ceil(distance + label.height)),
    );
    let textAnchor = 'middle';
    if (propsWithDefaults.noLabelOverhang) {
      textAnchor = 'start';
    }
    const [marginLeft, marginRight] = getLabelsXOverhang(
      xScale,
      labels,
      textAnchor,
    );

    return defaults(
      { [`margin${capitalize(position)}`]: marginY, marginLeft, marginRight },
      zeroMargin,
    );
  }

  static getLabels(props) {
    const { tickCount, labelStyle, xScale } = defaults(
      props,
      {},
      XAxisLabels.defaultProps,
    );
    const ticks = props.ticks || getScaleTicks(xScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: XAxisLabels.defaultProps.labelStyle,
    };
    const propsFormats = props.format ? [props.format] : props.formats;
    const scaleType = inferScaleType(xScale);
    const formatStrs =
      Array.isArray(propsFormats) && propsFormats.length
        ? propsFormats
        : getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const { labels } = resolveXLabelsForValues(xScale, ticks, formats, style);

    return labels;
  }

  shouldComponentUpdate(nextProps) {
    return !xyPropsEqual(this.props, nextProps);
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
      offset,
    } = this.props;
    const labels = this.props.labels || XAxisLabels.getLabels(this.props);
    const placement =
      this.props.placement || (position === 'top' ? 'above' : 'below');
    const className = `rct-chart-value-label rct-chart-value-label-x ${labelClassName}`;
    const transform =
      position === 'bottom'
        ? `translate(0, ${height + spacingBottom})`
        : `translate(0, ${-spacingTop})`;
    // todo: position: 'zero' to position along the zero line
    // example include having both positive and negative areas and youd like labels just on zero line

    return (
      <g className="rct-chart-value-labels-x" transform={transform}>
        {labels.map((label, i) => {
          const x = xScale(label.value) + offset;
          const y = placement === 'above' ? -label.height - distance : distance;
          const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
            'onMouseEnterLabel',
            'onMouseMoveLabel',
            'onMouseLeaveLabel',
            'onMouseClickLabel',
          ].map(eventName => {
            // partially apply this label's data point as 2nd callback argument
            const callback = get(this.props, eventName);
            return isFunction(callback)
              ? bindTrailingArgs(callback, label.value)
              : null;
          });
          let textAnchor = 'middle';
          if (this.props.noLabelOverhang) {
            if (i === 0) textAnchor = 'start';
            if (i === labels.length - 1 && xScale.range()[1] === x)
              textAnchor = 'end';
          }

          const style = defaults(
            { textAnchor },
            getValue(labelStyle, { x, y, ...label }, i),
            XAxisLabels.defaultProps.labelStyle,
          );

          return (
            <g
              key={`x-axis-label-${i}`}
              aria-hidden="true"
              {...{ onMouseEnter, onMouseMove, onMouseLeave, onClick }}
            >
              {/* <XAxisLabelDebugRect {...{x, y, label}}/> */}
              <MeasuredValueLabel
                value={label.value}
                {...{
                  x,
                  y,
                  className,
                  dy: '0.8em',
                  style,
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

/* eslint-disable */
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
          fill: 'orange',
        }}
      />
    );
  }
}
/* eslint-enable */

export default XAxisLabels;
