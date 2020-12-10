import defaults from 'lodash/defaults';
import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';
import max from 'lodash/max';
import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import MeasuredValueLabel from './MeasuredValueLabel';
import {
  checkLabelsDistinct,
  getLabelsYOverhang,
  makeLabelFormatters,
  getDefaultFormats,
} from './utils/Label';
import { getValue } from './utils/Data';
import { getScaleTicks, getTickDomain, inferScaleType } from './utils/Scale';
import { bindTrailingArgs } from './util.js';
import xyPropsEqual from './utils/xyPropsEqual';

function resolveYLabelsForValues(
  scale,
  values,
  formats = [],
  style,
  force = true,
) {
  // given a set of Y-values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels which are distinct
  // since we currently do not support rotated axis value labels,
  // we do not check if they fit on the axis (unlike X labels), since all Y labels will have the same height
  // returns the formatter and the generated labels

  let labels;
  const attempts = [];
  const goodFormat = formats.find(format => {
    const testLabels = values.map((value, i) =>
      MeasuredValueLabel.getLabel({
        value,
        format,
        style: defaults(
          getValue(style.labelStyle, { value }, i),
          style.defaultStyle,
        ),
      }),
    );

    const areLabelsDistinct = checkLabelsDistinct(testLabels);
    if (!areLabelsDistinct) {
      attempts.push({ labels: testLabels, format, areLabelsDistinct });
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
  // if we're not forced to decide, return all the labels we tried (let someone else decide)
  if (!force) return { attempts };

  // forced to decide, choose the least bad option
  // super bad, we don't have any label sets with distinct labels. return the last attempt.
  return last(attempts);
}

class YAxisLabels extends React.Component {
  static propTypes = {
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Height of chart - provided by XYPlot.
     */
    height: PropTypes.number,
    /**
     * Width of chart - provided by XYPlot.
     */
    width: PropTypes.number,
    /**
     * Position of y axis labels. Accepted options are "left" or "right".
     */
    position: PropTypes.oneOf(['left', 'right']),
    /**
     * Placement of labels in regards to the y axis. Accepted options are "before" or "after".
     */
    placement: PropTypes.oneOf(['before', 'after']),
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
     * Adds vertical offset (along the YAxis) to the labels.
     */
    offset: PropTypes.number,
  };

  static defaultProps = {
    offset: 0,
    height: 250,
    width: 400,
    position: 'left',
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: '',
    labelStyle: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '14px',
      lineHeight: 1,
      textAnchor: 'end',
    },
  };

  static getTickDomain(props) {
    if (!props.yScale) return;
    const propsWithDefaults = defaults({}, props, YAxisLabels.defaultProps);
    return {
      yTickDomain: getTickDomain(propsWithDefaults.yScale, propsWithDefaults),
    };
  }

  static getMargin(props) {
    const propsWithDefaults = defaults({}, props, YAxisLabels.defaultProps);
    const { yScale, position, placement, distance } = propsWithDefaults;
    const labels =
      propsWithDefaults.labels || YAxisLabels.getLabels(propsWithDefaults);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    if (
      (position === 'left' && placement === 'after') ||
      (position === 'right' && placement === 'before')
    )
      return zeroMargin;

    const marginX = max(labels.map(label => Math.ceil(distance + label.width)));
    const [marginTop, marginBottom] = getLabelsYOverhang(
      yScale,
      labels,
      'middle',
    );

    return defaults(
      { [`margin${capitalize(position)}`]: marginX, marginTop, marginBottom },
      zeroMargin,
    );
  }

  static getLabels(props) {
    const { tickCount, labelStyle, yScale } = defaults(
      props,
      {},
      YAxisLabels.defaultProps,
    );
    const ticks = props.ticks || getScaleTicks(yScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: YAxisLabels.defaultProps.labelStyle,
    };
    const scaleType = inferScaleType(yScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs =
      Array.isArray(propsFormats) && propsFormats.length
        ? propsFormats
        : getDefaultFormats(scaleType);
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

  shouldComponentUpdate(nextProps) {
    return !xyPropsEqual(this.props, nextProps);
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
      offset,
    } = this.props;
    const placement =
      this.props.placement || (position === 'left' ? 'before' : 'after');
    const className = `rct-chart-value-label rct-chart-value-label-y ${labelClassName}`;
    const textAnchor = placement === 'before' ? 'end' : 'start';
    const labels = this.props.labels || YAxisLabels.getLabels(this.props);
    const transform =
      position === 'left'
        ? `translate(${-spacingLeft}, 0)`
        : `translate(${width + spacingRight}, 0)`;

    return (
      <g
        className="rct-chart-value-labels-y"
        transform={transform}
        aria-hidden="true"
      >
        {labels.map((label, i) => {
          const y = yScale(label.value) + offset;
          const x = placement === 'before' ? -distance : distance;

          const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
            'onMouseEnterLabel',
            'onMouseMoveLabel',
            'onMouseLeaveLabel',
            'onMouseClickLabel',
          ].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = get(this.props, eventName);
            return isFunction(callback)
              ? bindTrailingArgs(callback, label.value)
              : null;
          });

          const style = defaults(
            { textAnchor },
            getValue(labelStyle, { x, y, ...label }, i),
            YAxisLabels.defaultProps.labelStyle,
          );

          return (
            <g
              key={`x-axis-label-${i}`}
              {...{ onMouseEnter, onMouseMove, onMouseLeave, onClick }}
            >
              {/* <YAxisLabelDebugRect {...{x, y, label, style: getValue(labelStyle, label.text, i)}}/> */}
              <MeasuredValueLabel
                value={label.value}
                {...{
                  x,
                  y,
                  className,
                  dy: '0.35em',
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
const YAxisLabelDebugRect = () => {
  const { x, y, label, style } = this.props;
  const xAdj = style.textAnchor === 'end' ? x - label.width : x;
  return (
    <rect
      {...{
        x: xAdj,
        y: y - label.height / 2,
        width: label.width,
        height: label.height,
        fill: 'orange',
      }}
    />
  );
};
/* eslint-enable */

export default YAxisLabels;
