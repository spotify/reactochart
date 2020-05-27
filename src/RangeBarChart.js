import first from 'lodash/first';
import last from 'lodash/last';
import clamp from 'lodash/clamp';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import Bar from './Bar';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {
  domainFromData,
  domainFromRangeData,
  getValue,
  makeAccessor2,
} from './utils/Data';
import { bindTrailingArgs } from './util.js';
import { dataTypeFromScaleType } from './utils/Scale';
import xyPropsEqual from './utils/xyPropsEqual';

/**
 * `RangeBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *independent* axis (X axis for vertical bars), and is centered on this value.
 * However, on the *dependent* axis, each bar represents a *range* (min/max) of values,
 * rather than always starting at zero.
 */

export default class RangeBarChart extends React.Component {
  static propTypes = {
    /**
     * Array of data to be plotted. One bar will be rendered per datum in this array.
     */
    data: PropTypes.array.isRequired,
    /**
     * Boolean which determines whether the chart will use horizontal or vertical bars.
     * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
     */
    horizontal: PropTypes.bool,

    /**
     * Accessor function for bar X values, called once per bar (datum), or a single value to be used for all bars.
     * If `horizontal` is `false`, this gets the *independent* variable value on which the bar is centered.
     * If `horizontal` is `true`, this gets the start (minimum value) of the *dependent* variable range which is spanned by the bar's length.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (maximum X-values) of the *dependent* variable range which is spanned by the bar's length,
     * or a single value to be used for all bars.
     * Should only be passed when `horizontal` is `true` (ignored otherwise).
     */
    xEnd: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for bar Y values, called once per bar (datum), or a single value to be used for all bars.
     * If `horizontal` is `false`, this gets the start (minimum value) of the *dependent* variable range which is spanned by the bar's length.
     * If `horizontal` is `true`, this gets the *independent* variable value on which the bar is centered.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for the end (maximum Y-values) of the *dependent* variable range which is spanned by the bar's length,
     * or a single value to be used for all bars.
     * Should only be passed when `horizontal` is `false` (ignored otherwise).
     */
    yEnd: CustomPropTypes.valueOrAccessor,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width),
     */
    barThickness: PropTypes.number,
    // barThickness: PropTypes.oneOfType([PropTypes.number, PropTypes.func]), // todo

    /**
     * Inline style object to be applied to each bar,
     * or accessor function which returns a style object.
     */
    barStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Class attribute to be applied to each bar,
     * or accessor function which returns a class.
     */
    barClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

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
    onMouseLeaveBar: PropTypes.func,
    /**
     * `click` event handler callback, called when user clicks the bar.
     */
    onClick: PropTypes.func,
    /**
     * Conditional if column should display values above/beside each bar.
     */
    showLabels: PropTypes.bool,
    /**
     * Format to use for the values or accessor that returns the updated value on each bar.
     */
    barLabelFormat: PropTypes.func,
    /**
     * The distance from the column the text appears in pixels - default is 24.
     */
    labelDistance: PropTypes.number,
    /**
     * Class name(s) to be included on each bar's <text> element.
     */
    labelClassName: PropTypes.string,
  };
  static defaultProps = {
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {},
  };

  static getDomain(props) {
    const {
      xScaleType,
      yScaleType,
      horizontal,
      data,
      x,
      xEnd,
      y,
      yEnd,
    } = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    const rangeAxis = horizontal ? 'x' : 'y';
    const rangeStartAccessor = horizontal ? makeAccessor2(x) : makeAccessor2(y);
    const rangeEndAccessor = horizontal
      ? makeAccessor2(xEnd)
      : makeAccessor2(yEnd);
    const rangeScaleType = horizontal ? xScaleType : yScaleType;
    const rangeDataType = dataTypeFromScaleType(rangeScaleType);

    return {
      [`${rangeAxis}Domain`]: domainFromRangeData(
        data,
        rangeStartAccessor,
        rangeEndAccessor,
        rangeDataType,
      ),
    };
  }
  static getSpacing(props) {
    const {
      barThickness,
      horizontal,
      x,
      y,
      xScale,
      yScale,
      data,
      xDomain,
      yDomain,
    } = props;
    const P = barThickness / 2; // padding
    const barsDomain = horizontal ? yDomain : xDomain;
    const barsScale = horizontal ? yScale : xScale;
    const barsAccessor = horizontal ? makeAccessor2(y) : makeAccessor2(x);
    const barsDataDomain = domainFromData(data, barsAccessor);

    // find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = [first(barsDomain), last(barsDomain)]
      .map(barsScale)
      .sort(); // sort the pixel values return by the domain extents

    // find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = [
      first(barsDataDomain),
      last(barsDataDomain),
    ]
      .map(barsScale)
      .sort(); // sort the pixel values return by the domain extents

    // find the necessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingTail, spacingHead] = [
      clamp(P - (domainTail - dataDomainTail), 0, P),
      clamp(P - (dataDomainHead - domainHead), 0, P),
    ];

    if (horizontal) {
      return {
        spacingTop: spacingHead,
        spacingBottom: spacingTail,
        spacingLeft: 0,
        spacingRight: 0,
      };
    }

    return {
      spacingTop: 0,
      spacingBottom: 0,
      spacingLeft: spacingHead,
      spacingRight: spacingTail,
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['barStyle']);
    return shouldUpdate;
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
      barThickness,
      barClassName,
      barStyle,
      showLabels,
      barLabelFormat,
      labelDistance,
      labelClassName,
    } = this.props;

    return (
      <g>
        {data.map((d, i) => {
          const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
            'onMouseEnterBar',
            'onMouseMoveBar',
            'onMouseLeaveBar',
            'onClick',
          ].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = get(this.props, eventName);
            return isFunction(callback) ? bindTrailingArgs(callback, d) : null;
          });

          const barProps = {
            x: getValue(x, d, i),
            y: getValue(y, d, i),
            xEnd: horizontal ? getValue(xEnd, d, i) : undefined,
            yEnd: horizontal ? undefined : getValue(yEnd, d, i),
            xScale,
            yScale,
            key: `chart-bar-${i}`,
            onMouseEnter,
            onMouseMove,
            onMouseLeave,
            onClick,
            thickness: barThickness,
            showLabel: showLabels,
            labelFormat: barLabelFormat,
            labelDistance,
            labelClassName: getValue(labelClassName, d, i),
            className: `rct-chart-bar ${getValue(barClassName, d, i) || ''}`,
            style: getValue(barStyle, d, i),
          };

          return <Bar {...barProps} />;
        })}
      </g>
    );
  }
}
