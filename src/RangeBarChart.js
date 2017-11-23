import React from 'react';
import _ from 'lodash';
import invariant from 'invariant';
import PropTypes from 'prop-types';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales, dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor2, getValue, domainFromRangeData, domainFromData, getDataDomainByAxis} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';
import Bar from './Bar';

/**
 *
 * `RangeBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *independent* axis (X axis for vertical bars), and is centered on this value.
 * However, on the *dependent* axis, each bar represents a *range* (min/max) of values,
 * rather than always starting at zero.
 */

export default class RangeBarChart extends React.Component {
  static propTypes = {
    /**
     * D3 scales for the X and Y axes of the chart, in {x, y} object format.
     */
    scale: CustomPropTypes.xyObjectOf(PropTypes.func.isRequired),
    /**
     * Array of data to be plotted. One bar will be rendered per datum in this array.
     */
    data: PropTypes.array,
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
     * Accessor function for the end (maximum X values) of the *dependent* variable range which is spanned by the bar's length,
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
     * Accessor function for the end (maximum Y-value) of the *dependent* variable range which is spanned by the bar's length,
     * or a single value to be used for all bars.
     * Should only be passed when `horizontal` is `false` (ignored otherwise).
     */
    yEnd: CustomPropTypes.valueOrAccessor,

    /**
     * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width),
     */
    barThickness: PropTypes.number,
    // barThickness: PropTypes.oneOfType([PropTypes.number, PropTypes.func]), // todo

    /**
     * Inline style object to be applied to each bar,
     * or accessor function which returns a style object;
     */
    barStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Class attribute to be applied to each bar.
     * or accessor function which returns a class;
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
    onMouseLeaveBar: PropTypes.func
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {}
  };

  static getDomain(props) {
    const {scaleType, horizontal, data, x, xEnd, y, yEnd} = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    const rangeAxis = horizontal ? 'x' : 'y';
    const rangeStartAccessor = horizontal ? makeAccessor2(x) : makeAccessor2(y);
    const rangeEndAccessor = horizontal ? makeAccessor2(xEnd) : makeAccessor2(yEnd);
    const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);

    return {
      [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }
  static getSpacing(props) {
    const {barThickness, horizontal, scale, data, domain} = props;
    const dataDomain = getDataDomainByAxis(props);
    const P = barThickness / 2; //padding
    const k = horizontal ? 'y' : 'x';
    //find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = _([_.first(domain[k]), _.last(domain[k])]).map(scale[k]).sortBy(); //sort the pixel values return by the domain extents
    //find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = _([_.first(dataDomain[k]), _.last(dataDomain[k])]).map(scale[k]).sortBy(); //sort the pixel values return by the domain extents
    //find the neccessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingTail, spacingHead] = [_.clamp(P - (domainTail - dataDomainTail), 0, P), _.clamp(P - (dataDomainHead - domainHead), 0, P)];
    if(horizontal){
      return {top: spacingHead, right: 0, bottom: spacingTail, left: 0}
    } else {
      return {top: 0, right: spacingTail, bottom: 0, left: spacingHead}
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['barStyle']);
    return shouldUpdate;
  }

  render() {
    const {scale, data, horizontal, x, xEnd, y, yEnd, barThickness, barClassName, barStyle} = this.props;
    invariant(hasXYScales(scale), `RangeBarChart.props.scale.x and scale.y must both be valid d3 scales`);
    // invariant(hasOneOfTwo(xEnd, yEnd), `RangeBarChart expects a xEnd *or* yEnd prop, but not both.`);

    return <g>
      {data.map((d, i) => {
        const [onMouseEnter, onMouseMove, onMouseLeave] =
          ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, d) : null;
        });

        const barProps = {
          x: getValue(x, d, i),
          y: getValue(y, d, i),
          key: `chart-bar-${i}`,
          onMouseEnter,
          onMouseMove,
          onMouseLeave,
          scale,
          thickness: barThickness,
          className: `chart-bar ${getValue(barClassName, d, i) || ''}`,
          style: getValue(barStyle, d, i)
        };

        // console.log('xEnd yEnd value', getValue(xEnd, d), getValue(yEnd, d), horizontal);
        return horizontal ?
          <Bar xEnd={getValue(xEnd, d, i)} {...barProps} /> :
          <Bar yEnd={getValue(yEnd, d, i)} {...barProps} />;
      })}
    </g>;
  }
}
