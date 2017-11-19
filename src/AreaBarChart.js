import React from 'react';
import _ from 'lodash';
import invariant from 'invariant';
import PropTypes from 'prop-types';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales, dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor, domainFromRangeData} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';
import RangeRect from './RangeRect';

/**
 * `AreaBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *dependent* axis (Y axis for vertical bars), and the bar stretches from zero to this value.
 * However, on the *independent* axis, each bar represents a *range* (min/max) of values,
 * rather than being centered on a specific value.
 * In other words, the bar *lengths* act the same way as standard bar chart bars,
 * but their *thicknesses* are variable and meaningful.
 * `AreaBarChart`s are the correct way to display histograms with variable bin sizes.
 * They are so named because, in cases like these histograms, since both the bar thickness and length are meaningful,
 * so too is the bar's total *area*, unlike in other bar charts.
 */

export default class AreaBarChart extends React.Component {
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

    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    /**
     * Class attribute to be applied to each bar.
     */
    barClassName: PropTypes.string,
    /**
     * Data getter for class attribute to be applied to each bar. Whereas `className` passes the same class to all
     * bars, this is a function called once per bar, which gets the bar's datum as its first argument,
     * so that each bar may determine its own className.
     */
    getClass: CustomPropTypes.getter,
    /**
     * Inline style object to be applied to each bar.
     */
    barStyle: PropTypes.object,

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
    barClassName: '',
    barStyle: {}
  };

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['barStyle']);
    // console.log('should areabarchart update?', shouldUpdate);
    return shouldUpdate;
  }

  static getDomain(props) {
    const {scaleType, horizontal, data} = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    // for area bar chart, the independent variable is the range
    // ie. the range controls the thickness of the bar
    const rangeAxis = horizontal ? 'y' : 'x';
    const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);
    // make accessor functions from getX|Y and getX|YEnd
    const rangeStartAccessor = makeAccessor(props[`get${rangeAxis.toUpperCase()}`]);
    const rangeEndAccessor = makeAccessor(props[`get${rangeAxis.toUpperCase()}End`]);

    return {
      [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }

  render() {
    const {scale, data, horizontal, getX, getXEnd, getY, getYEnd, barClassName, barStyle, getClass} = this.props;
    invariant(hasXYScales(scale), `AreaBarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const barProps = {
      scale,
      style: barStyle
    };
    const getZero = _.constant(0);

    return <g>
      {data.map((d, i) => {
        const [onMouseEnter, onMouseMove, onMouseLeave] =
          ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(eventName => {

            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, d) : null;
        });

        barProps.className = `chart-area-bar ${getClass ? makeAccessor(getClass)(d) : ''} ${barClassName}`; 
        return <RangeRect
          datum={d}
          getX={horizontal ? getZero : getX}
          getXEnd={horizontal ? getX : getXEnd}
          getY={!horizontal ? getZero : getY}
          getYEnd={!horizontal ? getY : getYEnd}
          key={`chart-area-bar-${i}`}
          onMouseEnter={onMouseEnter} 
          onMouseMove={onMouseMove} 
          onMouseLeave={onMouseLeave}
          {...barProps}
        />;
      })}
    </g>;
  }
}
